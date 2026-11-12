import { StatsCard } from "./StatsCard";
import { TrendChart } from "./TrendChart";

export function AnalyticsView() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard title="Total Presentations" value="1,254" change="+20.1% from last month" />
        <StatsCard title="Total Views" value="8,921" change="+12.5% from last month" />
        <StatsCard title="Avg. Engagement" value="72%" change="+5.2% from last month" />
      </div>
      <TrendChart />
    </div>
  );
}