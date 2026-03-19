"use client";

import { useState } from "react";

import { MissionDetailPane } from "@/components/studio/mission-detail-pane";
import type { TaskDetail } from "@/lib/studio/tasks";
import type { TaskEvent } from "@/lib/studio/task-events";

interface MissionDetailStandaloneProps {
  task: TaskDetail;
  events: TaskEvent[];
  defaultTab: string;
}

export function MissionDetailStandalone({
  task,
  events,
  defaultTab,
}: MissionDetailStandaloneProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <MissionDetailPane
      task={task}
      events={events}
      isStreaming={false}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
