import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  Edit, 
  Trash, 
  Mail, 
  Users, 
  Clock,
  FileText,
  Server
} from 'lucide-react';
import { Campaign } from '@/types/email';
import { 
  getCampaignById, 
  startCampaign, 
  pauseCampaign, 
  resumeCampaign, 
  stopCampaign, 
  deleteCampaign,
  getEmailAccountById,
  getEmailTemplateById 
} from '@/services/email';
import { useToast } from '@/hooks/use-toast';

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    data: campaign, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignById(id || ''),
    enabled: !!id
  });

  const { data: emailAccount } = useQuery({
    queryKey: ['emailAccount', campaign?.emailAccountId],
    queryFn: () => getEmailAccountById(campaign?.emailAccountId || ''),
    enabled: !!campaign?.emailAccountId
  });

  const { data: emailTemplate } = useQuery({
    queryKey: ['emailTemplate', campaign?.templateId],
    queryFn: () => getEmailTemplateById(campaign?.templateId || ''),
    enabled: !!campaign?.templateId
  });

  // Handler functions for campaign actions
  const handleStartCampaign = async () => {
    try {
      await startCampaign(id || '');
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

  const handlePauseCampaign = async () => {
    try {
      await pauseCampaign(id || '');
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

  const handleResumeCampaign = async () => {
    try {
      await resumeCampaign(id || '');
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

  const handleStopCampaign = async () => {
    try {
      await stopCampaign(id || '');
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

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaign(id || '');
      toast({
        title: "Campaign Deleted",
        description: "The email campaign has been deleted successfully.",
      });
      navigate('/email');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the campaign. Please try again.",
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
  const renderCampaignActions = () => {
    if (!campaign) return null;
    
    switch (campaign.status) {
      case 'draft':
      case 'scheduled':
        return (
          <Button onClick={handleStartCampaign}>
            <PlayCircle className="h-4 w-4 mr-1" /> Start
          </Button>
        );
      case 'running':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePauseCampaign}>
              <PauseCircle className="h-4 w-4 mr-1" /> Pause
            </Button>
            <Button variant="outline" onClick={handleStopCampaign}>
              <StopCircle className="h-4 w-4 mr-1" /> Stop
            </Button>
          </div>
        );
      case 'paused':
        return (
          <div className="flex space-x-2">
            <Button onClick={handleResumeCampaign}>
              <PlayCircle className="h-4 w-4 mr-1" /> Resume
            </Button>
            <Button variant="outline" onClick={handleStopCampaign}>
              <StopCircle className="h-4 w-4 mr-1" /> Stop
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Loading campaign details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
          <p className="mb-4">The campaign you're looking for doesn't exist or has been deleted.</p>
          <Button asChild>
            <Link to="/email">Back to Campaigns</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/email">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">{campaign.name}</h1>
        {renderStatusBadge(campaign.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle>Campaign Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-sm">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {campaign.startedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="font-medium text-sm">
                      {new Date(campaign.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {campaign.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="font-medium text-sm">
                      {new Date(campaign.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Sending Rate</p>
                  <p className="font-medium text-sm">
                    {campaign.sendingRate} emails/hour
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Total Recipients: {campaign.contactIds.length}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contacts">View Contacts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {emailTemplate ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Template Name</p>
                    <p className="font-medium">{emailTemplate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">{emailTemplate.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preview</p>
                    <div className="border rounded-md p-4 mt-2 text-sm max-h-60 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: emailTemplate.body }} />
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading template information...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> Email Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {emailAccount ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Account Name</p>
                    <p className="font-medium">{emailAccount.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{emailAccount.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Server Type</p>
                    <p className="font-medium">{emailAccount.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{emailAccount.status}</p>
                  </div>
                </div>
              ) : (
                <p>Loading account information...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle>Campaign Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {renderCampaignActions()}
                
                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-1" /> Edit Campaign
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteCampaign}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailPage;
