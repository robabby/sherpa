#!/usr/bin/env node

/**
 * scripts/backends/_ai-sdk-dispatch.mjs — Shared AI SDK dispatch logic.
 *
 * Called by per-provider wrappers (groq.mjs, google-ai.mjs, etc.)
 * Reads SHERPA_* env vars set by worker.sh.
 *
 * Exit codes: 0 = success, 1 = failure, 2 = provider unavailable
 */

import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Load .env.local from project root if env vars aren't already set
try {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const projectRoot = path.resolve(scriptDir, "../..");
  const envFile = path.join(projectRoot, ".env.local");
  const envContent = fs.readFileSync(envFile, "utf-8");
  for (const line of envContent.split("\n")) {
    if (line.startsWith("#") || !line.includes("=")) continue;
    const eqIdx = line.indexOf("=");
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local, rely on existing env */ }

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234";

const PROVIDERS = {
  groq: () => createGroq({ apiKey: process.env.GROQ_API_KEY }),
  google: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
  lmstudio: () => createOpenAICompatible({ name: "lmstudio", baseURL: `${LM_STUDIO_URL}/v1` }),
};

const DEFAULT_MODELS = {
  groq: "llama-3.3-70b-versatile",
  google: "gemini-2.5-flash",
  lmstudio: "default",
};

/**
 * Health check for an API backend.
 * Output: JSON { available, error }
 */
async function healthCheck(providerKey) {
  try {
    const factory = PROVIDERS[providerKey];
    if (!factory) {
      console.log(JSON.stringify({ available: false, error: `Unknown provider: ${providerKey}` }));
      process.exit(2);
    }
    factory();
    console.log(JSON.stringify({ available: true, error: null }));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({ available: false, error: err.message }));
    process.exit(2);
  }
}

/**
 * Run a task through the AI SDK.
 */
export async function runApiBackend(providerKey) {
  // Health check mode
  if (process.argv.includes("--health")) {
    await healthCheck(providerKey);
    return;
  }

  const prompt = process.env.SHERPA_TASK_PROMPT;
  const modelId = process.env.SHERPA_MODEL || DEFAULT_MODELS[providerKey] || "default";
  const logFile = process.env.SHERPA_LOG_FILE;

  if (!prompt) {
    console.error("SHERPA_TASK_PROMPT is required");
    process.exit(1);
  }
  if (!logFile) {
    console.error("SHERPA_LOG_FILE is required");
    process.exit(1);
  }

  const factory = PROVIDERS[providerKey];
  if (!factory) {
    console.error(`Unknown provider: ${providerKey}`);
    process.exit(2);
  }

  const startTime = Date.now();

  try {
    const provider = factory();
    const model = provider(modelId);

    const result = await generateText({
      model,
      prompt,
      maxTokens: 24576,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Write output in same format as lm-studio.mjs
    const output =
      `# Worker Output\n\n` +
      `**Provider:** ${providerKey}\n` +
      `**Model:** ${modelId}\n` +
      `**Duration:** ${elapsed}s\n` +
      `**Tokens:** input=${result.usage?.promptTokens ?? "?"}, output=${result.usage?.completionTokens ?? "?"}\n` +
      `**Finish reason:** ${result.finishReason ?? "unknown"}\n\n` +
      `---\n\n${result.text}\n`;

    fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
    fs.writeFileSync(logFile, output);

    console.log(`[ai-sdk:${providerKey}] completed in ${elapsed}s -> ${logFile}`);
    process.exit(0);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[ai-sdk:${providerKey}] failed after ${elapsed}s: ${error.message}`);

    // Write error to log file so the task board can show what went wrong
    if (logFile) {
      const errorOutput =
        `# Worker Output — FAILED\n\n` +
        `**Provider:** ${providerKey}\n` +
        `**Model:** ${modelId}\n` +
        `**Duration:** ${elapsed}s\n` +
        `**Error:** ${error.message}\n`;
      try {
        fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
        fs.writeFileSync(logFile, errorOutput);
      } catch { /* ignore write errors */ }
    }

    process.exit(1);
  }
}
