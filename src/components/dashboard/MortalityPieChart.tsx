import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MortalityPieChartProps {
  expired: number;
  survived: number;
  isLoading?: boolean;
}

const COLORS = {
  expired: "hsl(var(--destructive))",
  survived: "hsl(var(--success))",
};

export function MortalityPieChart({ expired, survived, isLoading }: MortalityPieChartProps) {
  const chartData = [
    { name: "Expired", value: expired },
    { name: "Survived", value: survived },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mortality Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mortality Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === "Expired" ? COLORS.expired : COLORS.survived} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
