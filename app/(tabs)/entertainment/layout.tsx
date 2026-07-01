import { EntertainmentTabs } from "@/components/entertainment-tabs";

export default function EntertainmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6">
      <EntertainmentTabs />
      {children}
    </div>
  );
}
