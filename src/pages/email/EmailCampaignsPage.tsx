import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  Loader2 
} from 'lucide-react';
import { Campaign } from '@/types/email';
import { getCampaigns, startCampaign, pauseCampaign, resumeCampaign, stopCampaign } from '@/services/email/campaignService';
import { useToast } from '@/components/ui/use-toast';

const EmailCampaignsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('campaigns');

  const { 
    data: campaigns = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns
  });

  // Handler functions for campaign actions
  const handleStartCampaign = async (id: string) => {
    try {
      await startCampaign(id);
      refetch();
      toast({
        title: "Campaign Started",
        description: "The email campaign has been started successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await pauseCampaign(id);
      refetch();
      toast({
        title: "Campaign Paused",
        description: "The email campaign has been paused successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause the campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResumeCampaign = async (id: string) => {
    try {
      await resumeCampaign(id);
      refetch();
      toast({
        title: "Campaign Resumed",
        description: "The email campaign has been resumed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume the campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopCampaign = async (id: string) => {
    try {
      await stopCampaign(id);
      refetch();
      toast({
        title: "Campaign Stopped",
        description: "The email campaign has been stopped successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop the campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-yellow-500">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Helper function to render campaign action buttons
  const renderCampaignActions = (campaign: Campaign) => {
    switch (campaign.status) {
      case 'draft':
      case 'scheduled':
        return (
          <Button size="sm" className="h-8" onClick={() => handleStartCampaign(campaign.id)}>
            <PlayCircle className="h-4 w-4 mr-1" /> Start
          </Button>
        );
      case 'running':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="h-8" onClick={() => handlePauseCampaign(campaign.id)}>
              <PauseCircle className="h-4 w-4 mr-1" /> Pause
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => handleStopCampaign(campaign.id)}>
              <StopCircle className="h-4 w-4 mr-1" /> Stop
            </Button>
          </div>
        );
      case 'paused':
        return (
          <div className="flex space-x-2">
            <Button size="sm" className="h-8" onClick={() => handleResumeCampaign(campaign.id)}>
              <PlayCircle className="h-4 w-4 mr-1" /> Resume
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => handleStopCampaign(campaign.id)}>
              <StopCircle className="h-4 w-4 mr-1" /> Stop
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your email marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/email/campaigns/new">
              <Plus className="h-4 w-4 mr-1" /> New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="campaigns" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 gap-2 w-full max-w-md">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="accounts">
            <Link to="/email/accounts" className="flex w-full h-full items-center justify-center">
              Email Accounts
            </Link>
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Link to="/email/templates" className="flex w-full h-full items-center justify-center">
              Templates
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Campaigns Yet</h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first email campaign.
                </p>
                <Button asChild>
                  <Link to="/email/campaigns/new">
                    <Plus className="h-4 w-4 mr-1" /> Create Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {campaigns.map(campaign => (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>
                        <Link to={`/email/campaigns/${campaign.id}`} className="hover:underline">
                          {campaign.name}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {renderStatusBadge(campaign.status)}
                        <span className="text-sm text-gray-500">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderCampaignActions(campaign)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Sent</p>
                        <p className="text-lg font-semibold">{campaign.stats.sent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivered</p>
                        <p className="text-lg font-semibold">{campaign.stats.delivered}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Opened</p>
                        <p className="text-lg font-semibold">{campaign.stats.opened} ({campaign.stats.openRate}%)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Clicked</p>
                        <p className="text-lg font-semibold">{campaign.stats.clicked} ({campaign.stats.clickRate}%)</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/email/campaigns/${campaign.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default EmailCampaignsPage;
