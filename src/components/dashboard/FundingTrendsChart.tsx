import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Mock chart data by month
const mockChartDataByMonth = [
  { name: 'Jan', 'Equipment & Vehicles': 350000, 'Real Estate': 650000, 'General Funding': 200000 },
  { name: 'Feb', 'Equipment & Vehicles': 580000, 'Real Estate': 980000, 'General Funding': 340000 },
  { name: 'Mar', 'Equipment & Vehicles': 420000, 'Real Estate': 820000, 'General Funding': 260000 },
  {
    name: 'Apr',
    'Equipment & Vehicles': 620000,
    'Real Estate': 1100000,
    'General Funding': 480000,
  },
  {
    name: 'May',
    'Equipment & Vehicles': 790000,
    'Real Estate': 1350000,
    'General Funding': 560000,
  },
  {
    name: 'Jun',
    'Equipment & Vehicles': 680000,
    'Real Estate': 1250000,
    'General Funding': 570000,
  },
];

// Mock chart data by quarters
const mockChartDataByQuarter = [
  {
    name: 'Q1 2022',
    'Equipment & Vehicles': 1350000,
    'Real Estate': 2450000,
    'General Funding': 800000,
  },
  {
    name: 'Q2 2022',
    'Equipment & Vehicles': 1580000,
    'Real Estate': 2580000,
    'General Funding': 940000,
  },
  {
    name: 'Q3 2022',
    'Equipment & Vehicles': 1720000,
    'Real Estate': 2620000,
    'General Funding': 1060000,
  },
  {
    name: 'Q4 2022',
    'Equipment & Vehicles': 1950000,
    'Real Estate': 2800000,
    'General Funding': 1180000,
  },
  {
    name: 'Q1 2023',
    'Equipment & Vehicles': 2100000,
    'Real Estate': 3100000,
    'General Funding': 1250000,
  },
  {
    name: 'Q2 2023',
    'Equipment & Vehicles': 2250000,
    'Real Estate': 3250000,
    'General Funding': 1350000,
  },
];

// Mock chart data by year
const mockChartDataByYear = [
  {
    name: '2018',
    'Equipment & Vehicles': 4500000,
    'Real Estate': 8200000,
    'General Funding': 3100000,
  },
  {
    name: '2019',
    'Equipment & Vehicles': 5200000,
    'Real Estate': 8900000,
    'General Funding': 3400000,
  },
  {
    name: '2020',
    'Equipment & Vehicles': 4800000,
    'Real Estate': 8100000,
    'General Funding': 3200000,
  },
  {
    name: '2021',
    'Equipment & Vehicles': 6100000,
    'Real Estate': 9500000,
    'General Funding': 3800000,
  },
  {
    name: '2022',
    'Equipment & Vehicles': 7200000,
    'Real Estate': 10500000,
    'General Funding': 4200000,
  },
  {
    name: '2023',
    'Equipment & Vehicles': 8100000,
    'Real Estate': 12000000,
    'General Funding': 4600000,
  },
];

// Custom tooltip formatter
const formatTooltipValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom Y-axis tick formatter
const formatYAxisTick = (value: number) => {
  return `$${value / 1000}k`;
};

export const FundingTrendsChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Select the data based on the timeframe
  const chartData = () => {
    switch (timeframe) {
      case 'monthly':
        return mockChartDataByMonth;
      case 'quarterly':
        return mockChartDataByQuarter;
      case 'yearly':
        return mockChartDataByYear;
      default:
        return mockChartDataByMonth;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Funding Trends</h3>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-l-md ${
              timeframe === 'monthly'
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium ${
              timeframe === 'quarterly'
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
          <button
            type="button"
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-r-md ${
              timeframe === 'yearly'
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip formatter={(value: number) => formatTooltipValue(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Equipment & Vehicles"
              stroke="rgba(16, 185, 129, 1)"
              strokeWidth={2}
              dot={{ fill: 'rgba(16, 185, 129, 1)' }}
            />
            <Line
              type="monotone"
              dataKey="Real Estate"
              stroke="rgba(79, 70, 229, 1)"
              strokeWidth={2}
              dot={{ fill: 'rgba(79, 70, 229, 1)' }}
            />
            <Line
              type="monotone"
              dataKey="General Funding"
              stroke="rgba(245, 158, 11, 1)"
              strokeWidth={2}
              dot={{ fill: 'rgba(245, 158, 11, 1)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FundingTrendsChart;
