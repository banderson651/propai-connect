
import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PropertyMetrics {
  types: { name: string; count: number }[];
  status: { name: string; count: number }[];
  priceRanges: { average: number };
  views: { date: string; count: number }[];
}

export function PropertyAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyMetrics, setPropertyMetrics] = useState<PropertyMetrics>({
    types: [],
    status: [],
    priceRanges: { average: 0 },
    views: [],
  });

  useEffect(() => {
    loadPropertyMetrics();
  }, []);

  const loadPropertyMetrics = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.getPropertyMetrics();
      setPropertyMetrics(data as PropertyMetrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load property analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading property analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const typeData = {
    labels: propertyMetrics.types.map(type => type.name),
    datasets: [
      {
        data: propertyMetrics.types.map(type => type.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(139, 92, 246, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: propertyMetrics.status.map(status => status.name),
    datasets: [
      {
        label: 'Properties by Status',
        data: propertyMetrics.status.map(status => status.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const viewsData = {
    labels: propertyMetrics.views.map(view => format(new Date(view.date), 'MMM dd')),
    datasets: [
      {
        label: 'Property Views',
        data: propertyMetrics.views.map(view => view.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Properties by Type</h3>
          <div className="h-64">
            <Doughnut options={doughnutOptions} data={typeData} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Properties by Status</h3>
          <div className="h-64">
            <Bar options={options} data={statusData} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">Property Views Trend</h3>
        <div className="h-64">
          <Bar options={options} data={viewsData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Total Properties</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {propertyMetrics.types.reduce((acc, type) => acc + type.count, 0)}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Average Price</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${propertyMetrics.priceRanges.average}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Total Views</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {propertyMetrics.views.reduce((acc, view) => acc + view.count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
