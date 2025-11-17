import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">EMS Response Metrics</h3>
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
            <Tooltip 
              formatter={(value) => [`${value} min`, 'Time']}
              labelFormatter={(label) => `Metric: ${label}`}
            />
            <Legend />
            <Bar dataKey="avg" name="Average" fill="#8884d8" />
            <Bar dataKey="median" name="Median" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2">Note: Time measurements in minutes</p>
    </div>
  );
};

export default EmsMetricsChart;