import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function CommunicationAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [communicationMetrics, setCommunicationMetrics] = useState({
    channels: [],
    responseTime: [],
    engagement: [],
    volume: [],
  });

  useEffect(() => {
    loadCommunicationMetrics();
  }, []);

  const loadCommunicationMetrics = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.getCommunicationMetrics();
      setCommunicationMetrics(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load communication analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading communication analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const channelData = {
    labels: communicationMetrics.channels.map(channel => channel.name),
    datasets: [
      {
        label: 'Messages by Channel',
        data: communicationMetrics.channels.map(channel => channel.count),
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

  const responseTimeData = {
    labels: communicationMetrics.responseTime.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Average Response Time (minutes)',
        data: communicationMetrics.responseTime.map(item => item.time),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const engagementData = {
    labels: communicationMetrics.engagement.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Engagement Rate',
        data: communicationMetrics.engagement.map(item => item.rate),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
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

  const lineOptions = {
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
          <h3 className="text-sm font-medium text-slate-600 mb-2">Messages by Channel</h3>
          <div className="h-64">
            <Bar options={options} data={channelData} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Response Time Trend</h3>
          <div className="h-64">
            <Line options={lineOptions} data={responseTimeData} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">Engagement Rate Trend</h3>
        <div className="h-64">
          <Line options={lineOptions} data={engagementData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Total Messages</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {communicationMetrics.channels.reduce((acc, channel) => acc + channel.count, 0)}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Avg Response Time</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {communicationMetrics.responseTime[communicationMetrics.responseTime.length - 1]?.time || 0} min
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Engagement Rate</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {communicationMetrics.engagement[communicationMetrics.engagement.length - 1]?.rate || 0}%
          </p>
        </div>
      </div>
    </div>
  );
} 