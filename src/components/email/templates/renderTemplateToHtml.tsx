import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  PropertyListingTemplate,
  OpenHouseInvitationTemplate,
  ClientFollowUpTemplate,
  MarketUpdateTemplate,
  TransactionCompleteTemplate,
  EmailTemplateProps,
} from '.';

const templates: Record<string, React.FC<EmailTemplateProps>> = {
  'property-listing': PropertyListingTemplate,
  'open-house': OpenHouseInvitationTemplate,
  'client-followup': ClientFollowUpTemplate,
  'market-update': MarketUpdateTemplate,
  'transaction-complete': TransactionCompleteTemplate,
};

type RenderTemplateOptions = {
  component: React.FC<EmailTemplateProps>;
  props: EmailTemplateProps;
} | {
  templateId: string;
  props: EmailTemplateProps;
};

export function renderTemplateToHtml(options: RenderTemplateOptions): string {
  let Component: React.FC<EmailTemplateProps>;
  
  if ('component' in options) {
    Component = options.component;
  } else {
    Component = templates[options.templateId];
    if (!Component) throw new Error(`Template ${options.templateId} not found`);
  }
  
  return renderToString(<Component {...('component' in options ? options.props : options.props)} />);
}
