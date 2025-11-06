"use client";
import React from "react";

interface QuickFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    upcoming: number;
    inProgress: number;
    completed: number;
    active: number;
  };
}

// Define the keys to match the state values
type TabKey = "all" | "Upcoming" | "InProgress" | "Completed" | "Active";

const tabs: { key: TabKey, label: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "Upcoming", label: "Upcoming" }, // Uses "Upcoming" (status from API)
  { key: "InProgress", label: "In Progress" },
  { key: "Active", label: "Active Timers" }, // Special key for isTimerActive
  { key: "Completed", label: "Completed" },
];

export const QuickFilterTabs: React.FC<QuickFilterTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  
  // Helper to get the correct count for each tab
  const getCount = (key: TabKey) => {
    switch(key) {
      case "all": return counts.all;
      case "Upcoming": return counts.upcoming;
      case "InProgress": return counts.inProgress;
      case "Completed": return counts.completed;
      case "Active": return counts.active;
      default: return 0;
    }
  };

  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = getCount(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold shadow-lg
                transform hover:scale-105 transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
                }
              `}
            >
              {tab.label}
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${
                  isActive
                    ? "bg-white text-blue-600"
                    : "bg-gray-200 text-gray-700"
                }
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};