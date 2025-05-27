import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyStats {
  month: string;
  properties: number;
  leads: number;
  value: number;
}

interface MonthlyTrendsChartProps {
  data: MonthlyStats[];
}

export const MonthlyTrendsChart = ({ data }: MonthlyTrendsChartProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="properties" stroke="#8884d8" name="Properties" />
              <Line type="monotone" dataKey="leads" stroke="#82ca9d" name="Leads" />
              <Line type="monotone" dataKey="value" stroke="#ffc658" name="Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 