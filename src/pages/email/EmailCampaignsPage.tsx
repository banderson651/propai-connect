import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
}

const EmailCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('id, name, description, status, scheduled_at, created_at')
          .order('created_at', { ascending: false });
          
        if (error) {
          // Check if the error is about missing table - show a generic message
          if (error.message.includes('does not exist')) {
            setError('Email campaigns feature is currently being set up. Please try again later or contact your administrator.');
          } else {
            setError(error.message);
          }
        } else {
          setCampaigns(data || []);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <DashboardLayout>
      <div className="py-8 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8">Email Campaigns</h1>
        <div className="flex gap-4 mb-6">
          <Button asChild variant="outline"><Link to="/email/accounts">Manage Email Accounts</Link></Button>
          <Button asChild variant="outline"><Link to="/email/templates">Templates</Link></Button>
          <Button asChild><Link to="/email/campaigns/new">New Campaign</Link></Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-500 text-center py-8">Loading campaigns...</div>
            ) : error ? (
              <div className="text-gray-500 text-center py-8">{error}</div>
            ) : campaigns.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No campaigns found. Create your first campaign to get started.</div>
            ) : (
              <ul className="divide-y">
                {campaigns.map(camp => (
                  <li key={camp.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{camp.name}</h3>
                      {camp.description && <p className="text-sm text-gray-500">{camp.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        camp.status === 'draft' ? 'bg-gray-100' : 
                        camp.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                        camp.status === 'sending' ? 'bg-yellow-100 text-yellow-800' : 
                        camp.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100'
                      }`}>
                        {camp.status}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/email/campaigns/${camp.id}`)}>
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmailCampaignsPage;
