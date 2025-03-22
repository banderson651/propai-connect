import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function AnalyticsOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    leads: [],
    properties: [],
    revenue: [],
    tasks: [],
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const startDate = subMonths(new Date(), 6);
      const data = await analyticsService.getOverviewMetrics(startDate);
      setMetrics(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const chartData = {
    labels: metrics.leads.map((_, index) => format(subMonths(new Date(), 5 - index), 'MMM yyyy')),
    datasets: [
      {
        label: 'Leads',
        data: metrics.leads,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Properties',
        data: metrics.properties,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Tasks',
        data: metrics.tasks,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: metrics.revenue.map((_, index) => format(subMonths(new Date(), 5 - index), 'MMM yyyy')),
    datasets: [
      {
        label: 'Revenue',
        data: metrics.revenue,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Key Metrics Trend</h3>
          <div className="h-64">
            <Line options={options} data={chartData} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Revenue Trend</h3>
          <div className="h-64">
            <Line options={options} data={revenueData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Average Lead Response Time</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">2.5 hours</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Property Viewing Rate</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">68%</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Task Completion Rate</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">85%</p>
        </div>
      </div>
    </div>
  );
} 