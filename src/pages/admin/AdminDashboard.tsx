
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, Activity, Clock, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for admin dashboard
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@propai.com', role: 'user', status: 'active', lastActive: '2023-06-15T10:30:00Z', properties: 5, contacts: 28, emailsSent: 124 },
  { id: '2', name: 'Jane Smith', email: 'jane@propai.com', role: 'admin', status: 'active', lastActive: '2023-06-15T14:45:00Z', properties: 12, contacts: 85, emailsSent: 356 },
  { id: '3', name: 'Robert Johnson', email: 'robert@propai.com', role: 'user', status: 'inactive', lastActive: '2023-05-20T09:15:00Z', properties: 3, contacts: 15, emailsSent: 67 },
  { id: '4', name: 'Lisa Brown', email: 'lisa@propai.com', role: 'user', status: 'active', lastActive: '2023-06-14T16:20:00Z', properties: 8, contacts: 42, emailsSent: 213 },
  { id: '5', name: 'Michael Davis', email: 'michael@propai.com', role: 'user', status: 'active', lastActive: '2023-06-15T11:10:00Z', properties: 6, contacts: 37, emailsSent: 178 },
];

const activityData = [
  { day: 'Mon', logins: 24, newProperties: 5, newContacts: 12, emailsSent: 86 },
  { day: 'Tue', logins: 18, newProperties: 3, newContacts: 8, emailsSent: 64 },
  { day: 'Wed', logins: 29, newProperties: 7, newContacts: 15, emailsSent: 92 },
  { day: 'Thu', logins: 32, newProperties: 4, newContacts: 10, emailsSent: 78 },
  { day: 'Fri', logins: 27, newProperties: 6, newContacts: 14, emailsSent: 105 },
  { day: 'Sat', logins: 14, newProperties: 2, newContacts: 5, emailsSent: 43 },
  { day: 'Sun', logins: 10, newProperties: 1, newContacts: 3, emailsSent: 28 },
];

const userDistributionData = [
  { name: 'Active Users', value: 75 },
  { name: 'Inactive Users', value: 25 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const recentActivities = [
  { id: 1, user: 'John Doe', activity: 'Added a new property', time: '10 minutes ago' },
  { id: 2, user: 'Jane Smith', activity: 'Sent 15 emails in campaign "Summer Listings"', time: '25 minutes ago' },
  { id: 3, user: 'Lisa Brown', activity: 'Updated contact information', time: '1 hour ago' },
  { id: 4, user: 'Michael Davis', activity: 'Created a new email template', time: '2 hours ago' },
  { id: 5, user: 'Robert Johnson', activity: 'Logged in after 26 days', time: '3 hours ago' },
];

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor user activity and system metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total Users</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{mockUsers.length}</p>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-500">+12.5%</span> from last month
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Active Now</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2">3</p>
            <div className="text-sm text-gray-500 mt-2">
              Users currently online
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">New Today</h3>
              <User className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold mt-2">2</p>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-500">+100%</span> from yesterday
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Avg. Session</h3>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mt-2">12m</p>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-red-500">-2.3%</span> from last week
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">User Activity (Last 7 Days)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins" />
                      <Line type="monotone" dataKey="emailsSent" stroke="#10b981" name="Emails Sent" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">New Content Created</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Bar dataKey="newProperties" name="New Properties" fill="#f59e0b" />
                      <Bar dataKey="newContacts" name="New Contacts" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">User Distribution</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
                <div className="space-y-4 max-h-[250px] overflow-y-auto">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 border-b border-gray-100">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-xs text-gray-500">{activity.activity}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">All Users</h3>
                <div className="w-72">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Contacts</TableHead>
                      <TableHead>Emails Sent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>{user.properties}</TableCell>
                        <TableCell>{user.contacts}</TableCell>
                        <TableCell>{user.emailsSent}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">User Activity Log</h3>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => {
                  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
                  const activities = [
                    'logged in',
                    'created a new property',
                    'updated a contact',
                    'sent an email campaign',
                    'viewed a property',
                    'generated a lead',
                    'updated profile',
                  ];
                  const activity = activities[Math.floor(Math.random() * activities.length)];
                  const timeAgo = Math.floor(Math.random() * 120) + 1;
                  
                  return (
                    <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{activity}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo} minutes ago</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
