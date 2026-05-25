import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="px-8">
      <TabsList className="h-auto w-full justify-start gap-0 border-b border-white/10 bg-transparent p-0">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="flex flex-col items-center gap-0.5 rounded-none border-b-2 border-transparent px-5 py-3.5 text-xs font-normal text-gray-500 data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 data-[state=active]:shadow-none"
          >
            <span className="font-medium">{t.label}</span>
            <span className="text-[10px] opacity-60" dir="rtl">
              {t.arabic}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
