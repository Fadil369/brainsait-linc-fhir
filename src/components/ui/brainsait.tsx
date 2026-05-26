"use client";

import { cn } from "@/lib/utils";

interface BrainSAITContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function BrainSAITContainer({ children, className }: BrainSAITContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white/5 backdrop-blur-sm border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const agentColors: Record<string, string> = {
  orchestrator: "#2b6cb8",
  specialist: "#0ea5e9",
  core: "#0ea5e9",
  mcp: "#22c55e",
  gateway: "#a855f7",
  platform: "#f59e0b",
  compliance: "#ea580c",
  router: "#0ea5e9",
  bridge: "#64748b",
  admin: "#ef4444",
};

export const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    ready: "bg-green-500/10 text-green-400 border-green-500/30",
    "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    planned: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    active: "bg-green-500/10 text-green-400 border-green-500/30",
    operational: "bg-green-500/10 text-green-400 border-green-500/30",
    degraded: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  };
  return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/30";
};
