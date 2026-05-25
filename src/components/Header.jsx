import { Badge } from "@/components/ui/badge";
import { Brain, Cloud, Activity } from "lucide-react";

export default function Header({ workerCount, agentCount }) {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a1628]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-lg shadow-lg shadow-blue-600/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              BrainSAIT · LINC Agent Unification
            </h1>
            <p className="font-mono text-xs text-cyan-400">
              InterSystems FHIR R4 · NPHIES · Cloudflare Edge · OID 1.3.6.1.4.1.61026
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Cloud className="mr-1 h-3 w-3" />
            {workerCount} Workers Found
          </Badge>
          <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-400">
            <Activity className="mr-1 h-3 w-3" />
            {agentCount} LINC Agents
          </Badge>
        </div>
      </div>
    </header>
  );
}
