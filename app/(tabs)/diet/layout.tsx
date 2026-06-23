import { DietTabs } from "@/components/diet-tabs";

export default function DietLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6">
      <DietTabs />
      {children}
    </div>
  );
}
