#!/usr/bin/env node

/**
 * LM Studio backend — calls the OpenAI-compatible API at LM Studio.
 *
 * Health check:
 *   node scripts/backends/lm-studio.mjs --health
 *   Outputs JSON { available, responseMs, models, error } and exits.
 *
 * Task execution:
 *   Env vars (set by worker.sh):
 *     SHERPA_TASK_PROMPT  — full prompt text (worker.sh already resolved context)
 *     SHERPA_MODEL        — model name (optional, defaults to "default")
 *     SHERPA_LOG_FILE     — path to write output
 *     LM_STUDIO_URL      — base URL (default http://localhost:1234)
 *
 * Exit codes: 0 = success, 1 = failure, 2 = LM Studio unavailable
 */

import fs from "fs";

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234";

const SYSTEM_PROMPT =
  "You are an agent. Complete the task described below. " +
  "Be thorough, precise, and follow all constraints exactly.";

async function healthCheck() {
  const start = Date.now();
  try {
    const res = await fetch(`${LM_STUDIO_URL}/v1/models`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const models = (data.data || []).map((m) => m.id);
    console.log(
      JSON.stringify({ available: true, responseMs: Date.now() - start, models, error: null }),
    );
    process.exit(0);
  } catch (err) {
    console.log(
      JSON.stringify({ available: false, responseMs: Date.now() - start, models: [], error: err.message }),
    );
    process.exit(2);
  }
}

async function callLmStudio(model, prompt) {
  const res = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(900_000), // 15 minutes
    body: JSON.stringify({
      model: model || "default",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 24576,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`LM Studio API error: ${res.status} ${res.statusText}`),
      { statusCode: res.status, responseBody: body },
    );
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    finishReason: data.choices?.[0]?.finish_reason ?? null,
    usage: data.usage ?? {},
    model: data.model ?? model,
  };
}

async function main() {
  // Health check mode
  if (process.argv[2] === "--health") {
    await healthCheck();
    return; // healthCheck exits, but guard anyway
  }

  // Read env vars
  const prompt = process.env.SHERPA_TASK_PROMPT;
  const model = process.env.SHERPA_MODEL || "default";
  const logFile = process.env.SHERPA_LOG_FILE;

  if (!prompt) {
    console.error("SHERPA_TASK_PROMPT is required");
    process.exit(1);
  }
  if (!logFile) {
    console.error("SHERPA_LOG_FILE is required");
    process.exit(1);
  }

  // Verify LM Studio is reachable before the expensive call
  try {
    await fetch(`${LM_STUDIO_URL}/v1/models`, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(`LM Studio unavailable at ${LM_STUDIO_URL}`);
    process.exit(2);
  }

  const startTime = Date.now();

  try {
    const result = await callLmStudio(model, prompt);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Strip <think>...</think> blocks (Qwen thinking mode)
    const cleaned = result.content.replace(/<think>[\s\S]*?<\/think>\s*/g, "");

    // Write output
    const output =
      `# Worker Output\n\n` +
      `**Model:** ${result.model}\n` +
      `**Duration:** ${elapsed}s\n` +
      `**Tokens:** input=${result.usage.prompt_tokens ?? "?"}, output=${result.usage.completion_tokens ?? "?"}\n` +
      `**Finish reason:** ${result.finishReason ?? "unknown"}\n\n` +
      `---\n\n${cleaned}\n`;

    fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
    fs.writeFileSync(logFile, output);

    console.log(`[lm-studio] completed in ${elapsed}s -> ${logFile}`);
    process.exit(0);
  } catch (error) {
    console.error(`[lm-studio] failed: ${error.message}`);
    process.exit(1);
  }
}

main();
