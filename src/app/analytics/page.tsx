import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckSquare,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { LeadAnalytics } from '@/components/analytics/LeadAnalytics';
import { PropertyAnalytics } from '@/components/analytics/PropertyAnalytics';
import { TaskAnalytics } from '@/components/analytics/TaskAnalytics';
import { CommunicationAnalytics } from '@/components/analytics/CommunicationAnalytics';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-2">Track performance and make data-driven decisions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500">Active leads this month</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Properties Listed</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500">Active listings</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">$0</div>
              <p className="text-xs text-slate-500">This month</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0%</div>
              <p className="text-xs text-slate-500">Lead to deal</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsOverview />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Lead Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadAnalytics />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Property Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyAnalytics />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-orange-600" />
                Task Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskAnalytics />
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-pink-600" />
              Communication Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommunicationAnalytics />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 