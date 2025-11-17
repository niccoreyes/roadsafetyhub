import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InjuryBarChartProps {
  data: Record<string, number>;
  isLoading?: boolean;
}

export function InjuryBarChart({ data, isLoading }: InjuryBarChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    category: name,
    count: value,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Injury Classification</CardTitle>
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
        <CardTitle>Injury Classification</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis 
              dataKey="category" 
              type="category"
              stroke="hsl(var(--foreground))"
              fontSize={10}
              width={150}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--chart-2))" 
              name="Cases"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
