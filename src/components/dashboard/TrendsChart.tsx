import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface TrendsChartProps {
  data: {
    date: string;
    encounters: number;
    fatalities: number;
    injuries: number;
  }[];
  isLoading?: boolean;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, isLoading }) => {
  // Mock data for now
  const mockData = [
    { date: 'Jan', encounters: 45, fatalities: 3, injuries: 42 },
    { date: 'Feb', encounters: 52, fatalities: 2, injuries: 50 },
    { date: 'Mar', encounters: 48, fatalities: 4, injuries: 44 },
    { date: 'Apr', encounters: 60, fatalities: 2, injuries: 58 },
    { date: 'May', encounters: 55, fatalities: 1, injuries: 54 },
    { date: 'Jun', encounters: 62, fatalities: 3, injuries: 59 },
  ];

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trend data...</p>
        </div>
      </div>
    );
  }

  // Custom tooltip to explain FHIR paths
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="capitalize">
              {`${entry.name}: ${entry.value}`}
              {entry.name === 'encounters' && (
                <span className="block text-xs text-gray-500">FHIR Path: Encounter resource count</span>
              )}
              {entry.name === 'fatalities' && (
                <span className="block text-xs text-gray-500">FHIR Path: Encounter.hospitalization.dischargeDisposition matching death codes</span>
              )}
              {entry.name === 'injuries' && (
                <span className="block text-xs text-gray-500">FHIR Path: Condition resource count with traffic-related SNOMED codes</span>
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
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                <strong>Encounters:</strong> Count of FHIR Encounter resources<br />
                <strong>Fatalities:</strong> Encounters with death disposition codes<br />
                <strong>Injuries:</strong> Conditions with traffic-related SNOMED codes<br />
                <strong>Note:</strong> This chart currently displays simulated data
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="encounters" stroke="#8884d8" name="Encounters" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="fatalities" stroke="#ff4444" name="Fatalities" />
            <Line type="monotone" dataKey="injuries" stroke="#00c851" name="Injuries" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;