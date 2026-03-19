import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const logsDir = path.join(PROJECT_ROOT, "docs/tasks/logs");
  const eventsFile = path.join(logsDir, `${taskId}-events.ndjson`);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          // Controller may be closed
        }
      };

      // 1. Send existing events
      let lastSize = 0;
      if (fs.existsSync(eventsFile)) {
        const content = fs.readFileSync(eventsFile, "utf-8");
        lastSize = Buffer.byteLength(content, "utf-8");
        for (const line of content.split("\n").filter(Boolean)) {
          try {
            send("task-event", JSON.parse(line));
          } catch {
            /* skip malformed */
          }
        }
      }
      send("control", { type: "caught-up" });

      // 2. Watch for new events (debounced)
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      let watcher: fs.FSWatcher | null = null;
      let closed = false;

      const closeStream = () => {
        if (closed) return;
        closed = true;
        if (debounceTimer) clearTimeout(debounceTimer);
        watcher?.close();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const readNewLines = () => {
        if (closed) return;
        try {
          if (!fs.existsSync(eventsFile)) return;
          const stat = fs.statSync(eventsFile);
          if (stat.size <= lastSize) return;

          const fd = fs.openSync(eventsFile, "r");
          const buf = Buffer.alloc(stat.size - lastSize);
          fs.readSync(fd, buf, 0, buf.length, lastSize);
          fs.closeSync(fd);
          lastSize = stat.size;

          const newContent = buf.toString("utf-8");
          for (const line of newContent.split("\n").filter(Boolean)) {
            try {
              const parsed = JSON.parse(line);
              send("task-event", parsed);

              // Check for terminal status
              if (parsed.event === "status_changed") {
                const to = parsed.to ?? parsed.data?.to;
                if (["completed", "failed", "reviewed"].includes(to)) {
                  send("control", { type: "done" });
                  closeStream();
                  return;
                }
              }
            } catch {
              /* skip malformed */
            }
          }
        } catch {
          // File read error — non-fatal
        }
      };

      const startWatching = () => {
        try {
          watcher = fs.watch(eventsFile, { persistent: false }, () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(readNewLines, 100);
          });
          watcher.on("error", () => {
            /* ignore watch errors */
          });
        } catch {
          // File doesn't exist yet — poll until it does
          const pollInterval = setInterval(() => {
            if (closed) {
              clearInterval(pollInterval);
              return;
            }
            if (fs.existsSync(eventsFile)) {
              clearInterval(pollInterval);
              readNewLines();
              startWatching();
            }
          }, 2000);
        }
      };

      startWatching();

      // 3. Cleanup on client disconnect
      request.signal.addEventListener("abort", closeStream);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
