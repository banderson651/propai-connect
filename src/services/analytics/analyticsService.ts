
// This is a mock service for analytics data
// In a real application, this would fetch data from your backend

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getOverviewMetrics(startDate: Date): Promise<{
    leads: number[];
    properties: number[];
    revenue: number[];
    tasks: number[];
  }> {
    // This would normally fetch from an API
    return {
      leads: [12, 19, 15, 23, 28, 35],
      properties: [8, 11, 13, 15, 14, 19],
      revenue: [12000, 18500, 22000, 25000, 28000, 32000],
      tasks: [23, 31, 28, 35, 42, 49],
    };
  }

  public async getLeadMetrics(): Promise<{
    sources: { name: string; count: number }[];
    status: { name: string; count: number }[];
    conversion: { rate: number; avgResponseTime: number };
  }> {
    // This would normally fetch from an API
    return {
      sources: [
        { name: 'Website', count: 42 },
        { name: 'Referral', count: 28 },
        { name: 'Social Media', count: 35 },
        { name: 'Direct', count: 19 },
        { name: 'Other', count: 8 },
      ],
      status: [
        { name: 'New', count: 32 },
        { name: 'Contacted', count: 25 },
        { name: 'Qualified', count: 18 },
        { name: 'Lost', count: 12 },
      ],
      conversion: {
        rate: 65,
        avgResponseTime: 2.5,
      },
    };
  }

  public async getPropertyMetrics(): Promise<{
    types: { name: string; count: number }[];
    status: { name: string; count: number }[];
    priceRanges: { average: number };
    views: { date: string; count: number }[];
  }> {
    // Generate last 7 days for property views
    const views = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString(),
        count: Math.floor(Math.random() * 50) + 10,
      };
    });

    return {
      types: [
        { name: 'Apartment', count: 35 },
        { name: 'House', count: 28 },
        { name: 'Commercial', count: 12 },
        { name: 'Land', count: 7 },
      ],
      status: [
        { name: 'For Sale', count: 45 },
        { name: 'For Rent', count: 38 },
        { name: 'Sold', count: 22 },
        { name: 'Reserved', count: 8 },
      ],
      priceRanges: {
        average: 350000,
      },
      views,
    };
  }

  public async getTaskMetrics(): Promise<{
    status: { name: string; count: number }[];
    priority: { name: string; count: number }[];
    completion: { date: string; rate: number }[];
    overdue: number;
  }> {
    // Generate last 7 days for completion rate
    const completion = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString(),
        rate: Math.floor(Math.random() * 30) + 60, // Random between 60-90%
      };
    });

    return {
      status: [
        { name: 'Pending', count: 28 },
        { name: 'In Progress', count: 35 },
        { name: 'Completed', count: 42 },
        { name: 'Overdue', count: 12 },
      ],
      priority: [
        { name: 'High', count: 18 },
        { name: 'Medium', count: 32 },
        { name: 'Low', count: 25 },
      ],
      completion,
      overdue: 12,
    };
  }

  public async getCommunicationMetrics(): Promise<{
    channels: { name: string; count: number }[];
    responseTime: { date: string; time: number }[];
    engagement: { date: string; rate: number }[];
    volume: number;
  }> {
    // Generate last 7 days for response time and engagement
    const responseTime = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString(),
        time: Math.floor(Math.random() * 30) + 10, // Random between 10-40 minutes
      };
    });

    const engagement = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString(),
        rate: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
      };
    });

    return {
      channels: [
        { name: 'Email', count: 120 },
        { name: 'Phone', count: 85 },
        { name: 'WhatsApp', count: 95 },
        { name: 'In Person', count: 42 },
      ],
      responseTime,
      engagement,
      volume: 342, // Total communications
    };
  }

  public async getRevenueData(startDate: Date, endDate: Date): Promise<any[]> {
    // Mock revenue data
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      data.push({
        date: new Date(currentDate),
        amount: Math.floor(Math.random() * 5000) + 1000,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }

  public async getMonthlyRevenue(): Promise<any[]> {
    // Mock monthly revenue for the last 6 months
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      data.push({
        date: month,
        amount: Math.floor(Math.random() * 50000) + 10000,
      });
    }
    
    return data;
  }
}
