import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface EmsMetricsChartProps {
  data: {
    timeToScene?: number;
    timeToHospital?: number;
    totalTime?: number;
  }[];
  isLoading?: boolean;
}

const EmsMetricsChart: React.FC<EmsMetricsChartProps> = ({ data, isLoading }) => {
  // Mock data for now since we don't have actual EMS metrics yet
  const mockData = [
    { name: 'Time to Scene', avg: 12.5, median: 10, range: '5-25' },
    { name: 'Time to Hospital', avg: 22.3, median: 20, range: '15-45' },
    { name: 'Total Response', avg: 34.8, median: 30, range: '20-70' },
  ];

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading EMS metrics...</p>
        </div>
      </div>
    );
  }

  // Custom tooltip to explain FHIR paths
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold">{`Metric: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="capitalize">
              {`${entry.name}: ${entry.value} min`}
              {entry.name === 'avg' && (
                <span className="block text-xs text-gray-500">FHIR Path: Calculated from emergency service timestamps</span>
              )}
              {entry.name === 'median' && (
                <span className="block text-xs text-gray-500">FHIR Path: Calculated from emergency service timestamps</span>
              )}
            </p>
          ))}
          <p className="text-xs text-blue-500 mt-2">Note: Data is simulated for demonstration purposes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-4">EMS Response Metrics</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                <strong>Average/Median:</strong> Time calculations from emergency service timestamps<br />
                <strong>Note:</strong> This chart currently displays simulated data based on PH Road Safety IG metrics
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="avg" name="Average" fill="#8884d8" />
            <Bar dataKey="median" name="Median" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2">Note: Time measurements in minutes (simulated data)</p>
    </div>
  );
};

export default EmsMetricsChart;