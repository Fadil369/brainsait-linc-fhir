import { Badge } from "@/components/ui/badge";
import { Brain, Cloud, Activity, Globe } from "lucide-react";

export default function Header({ workerCount, agentCount }) {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a1628]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              BrainSAIT
            </h1>
            <span className="hidden text-[11px] text-cyan-400 md:inline font-mono">
              FHIR R4 · NPHIES · Cloudflare
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-6 border-cyan-500/30 bg-cyan-500/10 px-2 text-[11px] text-cyan-400">
            <Cloud className="mr-1 h-3 w-3" />
            {workerCount}
          </Badge>
          <Badge variant="outline" className="h-6 border-orange-500/30 bg-orange-500/10 px-2 text-[11px] text-orange-400">
            <Activity className="mr-1 h-3 w-3" />
            {agentCount}
          </Badge>
          <Badge variant="outline" className="h-6 border-green-500/30 bg-green-500/10 px-2 text-[11px] text-green-400">
            <Globe className="mr-1 h-3 w-3" />
            Live
          </Badge>
        </div>
      </div>
    </header>
  );
}
