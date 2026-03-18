#!/usr/bin/env node

/**
 * OpenClaw gateway backend — WebSocket protocol v3 with device identity.
 *
 * Implements the full OpenClaw gateway handshake:
 *   1. Connect → receive challenge nonce
 *   2. Sign nonce with persisted Ed25519 key pair (device identity)
 *   3. Send connect frame with auth token + device signature
 *   4. Dispatch task via chat.send, collect streamed response
 *
 * Identity persisted at: .openclaw-dispatch/device.json (project-local)
 * Device token persisted at: .openclaw-dispatch/device-token.txt
 *
 * Health check:   node scripts/backends/openclaw.mjs --health
 * Task execution: reads SHERPA_TASK_PROMPT, SHERPA_LOG_FILE env vars
 *
 * Exit codes: 0 = success, 1 = failure, 2 = gateway unavailable
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const identityDir = path.join(projectRoot, ".openclaw-dispatch");
const identityFile = path.join(identityDir, "device.json");
const deviceTokenFile = path.join(identityDir, "device-token.txt");

// Load .env.local
try {
  const envContent = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    if (line.startsWith("#") || !line.includes("=")) continue;
    const eqIdx = line.indexOf("=");
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local */ }

const GATEWAY_URL =
  process.env.OPENCLAW_GATEWAY_URL ||
  "wss://sherpa-ubuntu-4gb-hil-1.tail384b2.ts.net:18790";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const SESSION_ID = process.env.OPENCLAW_SESSION_ID || "sherpa-dispatch";

const CLIENT_ID = "gateway-client";
const CLIENT_MODE = "backend";
const CLIENT_VERSION = "1.0.0";
const CLIENT_PLATFORM = "node";
const ROLE = "operator";
const SCOPES = ["operator.read", "operator.write", "operator.admin"];
const PROTOCOL_VERSION = 3;

// ---------------------------------------------------------------------------
// Device Identity (Ed25519 key pair, persisted)
// ---------------------------------------------------------------------------

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function base64UrlEncode(buf) {
  return buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function derivePublicKeyRaw(publicKeyPem) {
  const key = crypto.createPublicKey(publicKeyPem);
  const spki = key.export({ type: "spki", format: "der" });
  if (spki.length === ED25519_SPKI_PREFIX.length + 32 &&
      spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}

function fingerprintPublicKey(publicKeyPem) {
  const raw = derivePublicKeyRaw(publicKeyPem);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function loadOrCreateIdentity() {
  try {
    if (fs.existsSync(identityFile)) {
      const parsed = JSON.parse(fs.readFileSync(identityFile, "utf8"));
      if (parsed?.version === 1 && parsed.deviceId && parsed.publicKeyPem && parsed.privateKeyPem) {
        return parsed;
      }
    }
  } catch { /* regenerate */ }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const deviceId = fingerprintPublicKey(publicKeyPem);

  fs.mkdirSync(identityDir, { recursive: true });
  const stored = { version: 1, deviceId, publicKeyPem, privateKeyPem, createdAtMs: Date.now() };
  fs.writeFileSync(identityFile, JSON.stringify(stored, null, 2) + "\n", { mode: 0o600 });
  return stored;
}

function loadDeviceToken() {
  try { return fs.readFileSync(deviceTokenFile, "utf8").trim() || null; } catch { return null; }
}

function saveDeviceToken(token) {
  fs.mkdirSync(identityDir, { recursive: true });
  fs.writeFileSync(deviceTokenFile, token, { mode: 0o600 });
}

// ---------------------------------------------------------------------------
// Protocol v3 auth
// ---------------------------------------------------------------------------

function buildDeviceAuthPayloadV3({ deviceId, clientId, clientMode, role, scopes, signedAtMs, token, nonce, platform, deviceFamily }) {
  return [
    "v3", deviceId, clientId, clientMode, role,
    scopes.join(","), String(signedAtMs), token ?? "",
    nonce, (platform ?? "").trim().toLowerCase(),
    (deviceFamily ?? "").trim().toLowerCase(),
  ].join("|");
}

function signPayload(privateKeyPem, payload) {
  const key = crypto.createPrivateKey(privateKeyPem);
  const sig = crypto.sign(null, Buffer.from(payload, "utf8"), key);
  return base64UrlEncode(sig);
}

// ---------------------------------------------------------------------------
// Gateway connection
// ---------------------------------------------------------------------------

function connectAndAuth(url, gatewayToken, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.close(); reject(new Error("connection timed out")); }, timeoutMs);
    const ws = new WebSocket(url);

    ws.on("error", (err) => { clearTimeout(timer); reject(err); });

    ws.on("message", (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // Step 1: Receive challenge nonce
      if (msg.type === "event" && msg.event === "connect.challenge") {
        const nonce = msg.payload?.nonce;
        const identity = loadOrCreateIdentity();
        const signedAtMs = Date.now();
        const deviceToken = loadDeviceToken();

        const payload = buildDeviceAuthPayloadV3({
          deviceId: identity.deviceId,
          clientId: CLIENT_ID,
          clientMode: CLIENT_MODE,
          role: ROLE,
          scopes: SCOPES,
          signedAtMs,
          token: gatewayToken,
          nonce,
          platform: CLIENT_PLATFORM,
          deviceFamily: null,
        });

        // Step 2: Send connect with device identity
        ws.send(JSON.stringify({
          type: "req",
          id: crypto.randomUUID(),
          method: "connect",
          params: {
            minProtocol: PROTOCOL_VERSION,
            maxProtocol: PROTOCOL_VERSION,
            client: { id: CLIENT_ID, version: CLIENT_VERSION, platform: CLIENT_PLATFORM, mode: CLIENT_MODE },
            caps: [],
            commands: [],
            role: ROLE,
            scopes: SCOPES,
            auth: {
              token: gatewayToken,
              deviceToken: deviceToken || undefined,
            },
            device: {
              id: identity.deviceId,
              publicKey: base64UrlEncode(derivePublicKeyRaw(identity.publicKeyPem)),
              signature: signPayload(identity.privateKeyPem, payload),
              signedAt: signedAtMs,
              nonce,
            },
          },
        }));
      }

      // Step 3: Handle connect response
      if (msg.type === "res") {
        clearTimeout(timer);
        if (msg.ok === true) {
          // Persist device token if provided
          const dt = msg.payload?.auth?.deviceToken;
          if (dt) saveDeviceToken(dt);
          resolve(ws);
        } else {
          ws.close();
          reject(new Error(msg.error?.message || "connect rejected"));
        }
      }
    });
  });
}

function chatSend(ws, sessionId, text, timeoutMs = 900_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`response timed out after ${timeoutMs / 1000}s`)), timeoutMs);
    const reqId = crypto.randomUUID();
    const chunks = [];
    let chatSendAcked = false;

    const handler = (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // chat.send acknowledgment
      if (msg.type === "res" && msg.id === reqId) {
        if (msg.ok === false) {
          clearTimeout(timer);
          ws.off("message", handler);
          reject(new Error(msg.error?.message || "chat.send rejected"));
          return;
        }
        chatSendAcked = true;
      }

      // Collect streamed text deltas from agent events
      if (msg.type === "event" && msg.event === "agent" &&
          msg.payload?.stream === "assistant" && msg.payload?.data?.delta) {
        chunks.push(msg.payload.data.delta);
      }

      // Turn complete: lifecycle phase "end" or chat state "final"
      if (msg.type === "event" && msg.event === "agent" &&
          msg.payload?.stream === "lifecycle" && msg.payload?.data?.phase === "end") {
        clearTimeout(timer);
        ws.off("message", handler);
        resolve(chunks.join(""));
      }
      if (msg.type === "event" && msg.event === "chat" &&
          msg.payload?.state === "final") {
        clearTimeout(timer);
        ws.off("message", handler);
        resolve(chunks.join(""));
      }
    };

    ws.on("message", handler);

    ws.send(JSON.stringify({
      type: "req",
      id: reqId,
      method: "chat.send",
      params: {
        sessionKey: `agent:main:${sessionId}`,
        message: text,
        idempotencyKey: reqId,
      },
    }));
  });
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

async function healthCheck() {
  try {
    const ws = await connectAndAuth(GATEWAY_URL, GATEWAY_TOKEN, 15000);
    ws.close();
    console.log(JSON.stringify({ available: true, error: null }));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({ available: false, error: err.message }));
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.argv[2] === "--health") {
    await healthCheck();
    return;
  }

  const prompt = process.env.SHERPA_TASK_PROMPT;
  const logFile = process.env.SHERPA_LOG_FILE;

  if (!prompt) { console.error("SHERPA_TASK_PROMPT is required"); process.exit(1); }
  if (!logFile) { console.error("SHERPA_LOG_FILE is required"); process.exit(1); }
  if (!GATEWAY_TOKEN) { console.error("OPENCLAW_GATEWAY_TOKEN is required"); process.exit(2); }

  const startTime = Date.now();

  try {
    const ws = await connectAndAuth(GATEWAY_URL, GATEWAY_TOKEN);
    const response = await chatSend(ws, SESSION_ID, prompt);
    ws.close();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const output =
      `# Worker Output\n\n` +
      `**Backend:** openclaw (protocol v3)\n` +
      `**Gateway:** ${GATEWAY_URL}\n` +
      `**Session:** ${SESSION_ID}\n` +
      `**Duration:** ${elapsed}s\n\n` +
      `---\n\n${response}\n`;

    fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
    fs.writeFileSync(logFile, output);

    console.log(`[openclaw] completed in ${elapsed}s -> ${logFile}`);
    process.exit(0);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[openclaw] failed after ${elapsed}s: ${error.message}`);

    if (logFile) {
      try {
        fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
        fs.writeFileSync(logFile, `# Worker Output\n\n**Error:** ${error.message}\n**Duration:** ${elapsed}s\n`);
      } catch { /* best effort */ }
    }

    process.exit(error.message.includes("timed out") ? 2 : 1);
  }
}

main();
