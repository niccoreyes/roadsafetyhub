import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
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
            <Tooltip />
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