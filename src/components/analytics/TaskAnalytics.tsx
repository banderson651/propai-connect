
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

interface TaskMetrics {
  status: { name: string; count: number }[];
  priority: { name: string; count: number }[];
  completion: { date: string; rate: number }[];
  overdue: number;
}

export function TaskAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics>({
    status: [],
    priority: [],
    completion: [],
    overdue: 0,
  });

  useEffect(() => {
    loadTaskMetrics();
  }, []);

  const loadTaskMetrics = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.getTaskMetrics();
      setTaskMetrics(data as TaskMetrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load task analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading task analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const statusData = {
    labels: taskMetrics.status.map(status => status.name),
    datasets: [
      {
        label: 'Tasks by Status',
        data: taskMetrics.status.map(status => status.count),
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

  const priorityData = {
    labels: taskMetrics.priority.map(priority => priority.name),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: taskMetrics.priority.map(priority => priority.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(16, 185, 129, 0.5)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const completionData = {
    labels: taskMetrics.completion.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Task Completion Rate',
        data: taskMetrics.completion.map(item => item.rate),
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
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Tasks by Status</h3>
          <div className="h-64">
            <Bar options={options} data={statusData} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Tasks by Priority</h3>
          <div className="h-64">
            <Bar options={options} data={priorityData} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">Task Completion Rate Trend</h3>
        <div className="h-64">
          <Line options={lineOptions} data={completionData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Total Tasks</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {taskMetrics.status.reduce((acc, status) => acc + status.count, 0)}
          </p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Completion Rate</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {taskMetrics.completion[taskMetrics.completion.length - 1]?.rate || 0}%
          </p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600">Overdue Tasks</h4>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {taskMetrics.overdue}
          </p>
        </div>
      </div>
    </div>
  );
}
