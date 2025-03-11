
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, Building2, DollarSign } from 'lucide-react';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
];

const stats = [
  { label: 'Total Leads', value: '3,456', icon: Users, change: '+12.5%' },
  { label: 'Active Properties', value: '245', icon: Building2, change: '+5.2%' },
  { label: 'Revenue', value: '$124.5k', icon: DollarSign, change: '+8.1%' },
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, John Doe</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 glass-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span>{stat.change} from last month</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 glass-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Generation Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
