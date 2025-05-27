// Placeholder for campaign service
export const getCampaigns = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', name: 'Welcome Series', subject: 'Welcome!', body: '<p>Hello!</p>', senderEmailAccountId: 'acc1', contactListId: 'list1', status: 'Sent', sentAt: new Date().toISOString(), stats: { sent: 100, opened: 50, clicked: 10, bounced: 5 } },
    { id: '2', name: 'Product Update', subject: 'New Feature!', body: '<p>Check out our new feature!</p>', senderEmailAccountId: 'acc2', contactListId: 'list2', status: 'Draft', sentAt: null, stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 } },
    { id: '3', name: 'Holiday Promotion', subject: 'Special Offer', body: '<p>Happy holidays!</p>', senderEmailAccountId: 'acc1', contactListId: 'list1', status: 'Failed', sentAt: new Date().toISOString(), stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 } },
  ];
}; 