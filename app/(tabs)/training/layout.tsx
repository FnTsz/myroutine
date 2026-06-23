import { TrainingTabs } from "@/components/training-tabs";

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl space-y-6">
      <TrainingTabs />
      {children}
    </div>
  );
}
