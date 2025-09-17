
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

interface LeadMetrics {
  sources: { name: string; count: number }[];
  status: { name: string; count: number }[];
  conversion: { rate: number; avgResponseTime: number };
}

export function LeadAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics>({
    sources: [],
    status: [],
    conversion: { rate: 0, avgResponseTime: 0 },
  });

  useEffect(() => {
    loadLeadMetrics();
  }, []);

  const loadLeadMetrics = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.getLeadMetrics();
      setLeadMetrics(data as LeadMetrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load lead analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading lead analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const sourceData = {
    labels: leadMetrics.sources.map(source => source.name),
    datasets: [
      {
        label: 'Leads by Source',
        data: leadMetrics.sources.map(source => source.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(139, 92, 246, 0.5)',
          'rgba(236, 72, 153, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: leadMetrics.status.map(status => status.name),
    datasets: [
      {
        label: 'Leads by Status',
        data: leadMetrics.status.map(status => status.count),
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
          <h3 className="text-sm font-medium text-slate-600 mb-2">Leads by Source</h3>
          <div className="h-64">
            <Bar options={options} data={sourceData} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Leads by Status</h3>
          <div className="h-64">
            <Bar options={options} data={statusData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Total Leads</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {leadMetrics.sources.reduce((acc, source) => acc + source.count, 0)}
          </p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Conversion Rate</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {leadMetrics.conversion.rate}%
          </p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Average Response Time</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {leadMetrics.conversion.avgResponseTime} hours
          </p>
        </div>
      </div>
    </div>
  );
}
