import { Card } from "./ui/card";
import { ArrowUp } from "@phosphor-icons/react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
}

export function StatsCard({ title, value, change }: StatsCardProps) {
  return (
    <Card className="p-6">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-3xl font-bold">{value}</p>
      <div className="flex items-center text-sm text-green-500">
        <ArrowUp className="w-4 h-4 mr-1" />
        <span>{change}</span>
      </div>
    </Card>
  );
}