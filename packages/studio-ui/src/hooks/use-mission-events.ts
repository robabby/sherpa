"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface MissionEvent {
  timestamp: string;
  event: string;
  taskSlug: string;
  data: Record<string, unknown>;
}

interface UseMissionEventsResult {
  events: MissionEvent[];
  isStreaming: boolean;
}

export function useMissionEvents(
  taskId: string | null,
  taskStatus: string | null,
  staticEvents: MissionEvent[],
): UseMissionEventsResult {
  const [events, setEvents] = useState<MissionEvent[]>(staticEvents);
  const [isStreaming, setIsStreaming] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const taskIdRef = useRef(taskId);
  taskIdRef.current = taskId;

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Sync static events when they change (new task selected, non-dispatched)
  useEffect(() => {
    if (taskStatus !== "dispatched") {
      setEvents(staticEvents);
    }
  }, [staticEvents, taskStatus]);

  useEffect(() => {
    cleanup();

    if (!taskId || taskStatus !== "dispatched") {
      return;
    }

    // Open SSE connection for dispatched tasks
    setEvents([]);
    setIsStreaming(true);

    const es = new EventSource(`/api/stream/tasks/${taskId}`);
    esRef.current = es;

    es.addEventListener("task-event", (e: MessageEvent) => {
      // Only process if still viewing the same task
      if (taskIdRef.current !== taskId) return;
      try {
        const parsed = JSON.parse(e.data as string) as Record<string, unknown>;
        const event: MissionEvent = {
          timestamp:
            (parsed.timestamp as string) ?? (parsed.ts as string) ?? "",
          event: parsed.event as string,
          taskSlug: taskId,
          data: parsed,
        };
        setEvents((prev) => [...prev, event]);
      } catch {
        /* skip */
      }
    });

    es.addEventListener("control", (e: MessageEvent) => {
      try {
        const { type } = JSON.parse(e.data as string) as { type: string };
        if (type === "done") {
          cleanup();
        }
      } catch {
        /* skip */
      }
    });

    es.addEventListener("error", () => {
      // EventSource will auto-reconnect for transient errors.
      // If permanently failed, just stop streaming UI indicator.
      // The static events from server render are still valid.
      cleanup();
    });

    return cleanup;
  }, [taskId, taskStatus, cleanup]);

  return { events, isStreaming };
}
