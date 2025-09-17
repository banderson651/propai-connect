import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  MessageSquare,
  Bot,
  Workflow,
  LineChart,
  Lock,
  CalendarClock,
  ServerCog,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const coreModules = [
  {
    title: 'Unified CRM Workspace',
    description:
      'Manage buyers, sellers, investors, and partners in a single source of truth with contextual insights at every step.',
    icon: Users,
    bullets: [
      'Smart contact enrichment with tags, lead sources, and relationship health indicators.',
      'Timeline view of calls, emails, meetings, and AI summarized notes.',
      'Segment audiences for automated nurture tracks and marketing campaigns.',
    ],
  },
  {
    title: 'Property Intelligence Hub',
    description:
      'Centralize listings, match qualified leads automatically, and publish polished property pages in minutes.',
    icon: Building2,
    bullets: [
      'Sync inventory from MLS, spreadsheets, or manual uploads with validation tooling.',
      'AI-powered buyer-to-property matching based on budget, preferences, and intent signals.',
      'Share branded microsites and public portfolios with real-time availability updates.',
    ],
  },
  {
    title: 'Communication Control Center',
    description:
      'Coordinate multichannel outreach, templates, and campaign reporting from one inbox.',
    icon: MessageSquare,
    bullets: [
      'Two-way WhatsApp Business, email, and SMS messaging with conversation history in context.',
      'Prebuilt and custom templates with merge fields for rapid personalization.',
      'Campaign dashboards that surface deliverability, open, and reply performance.',
    ],
  },
];

const automationHighlights = [
  'Workflow builder with branching logic, wait steps, and assignment rules.',
  'Predictive deal scoring that prioritizes opportunities likely to convert.',
  'Playbooks that trigger follow-ups when leads go cold or listings reach milestones.',
  'AI assistants that draft emails, create task checklists, and summarize conversations.',
];

const productivityHighlights = [
  'Shared team calendar that merges open houses, inspections, tasks, and reminders.',
  'Task pipelines with Kanban, list, calendar, and timeline views for flexible execution.',
  'Internal comments, mentions, and file attachments to keep deal rooms aligned.',
  'Agent performance dashboards with configurable KPIs and leaderboards.',
];

const integrations = [
  'Google Workspace & Microsoft 365 calendars, contacts, and email sync.',
  'Zapier, Make, and native webhooks for automating bespoke workflows.',
  'Supabase-backed data layer for secure, real-time collaboration.',
  'CSV/XLSX importers with deduplication, validation, and field mapping.',
];

const supportResources = [
  {
    title: 'Onboarding & Implementation',
    description:
      'Our customer success team configures PropAI to mirror your current pipeline, builds automation templates, and trains every user.',
  },
  {
    title: 'Knowledge Base & Webinars',
    description:
      'Live office hours, release notes, and deep-dive tutorials help your team stay ahead of new capabilities.',
  },
  {
    title: 'Priority Support',
    description:
      'Professional plans include < 2 hour first response SLAs. Enterprise plans bundle a dedicated success manager.',
  },
];

const tableOfContents = [
  { id: 'overview', label: 'Overview' },
  { id: 'core-modules', label: 'Core Modules' },
  { id: 'automation', label: 'Automation & AI' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'analytics', label: 'Analytics & Reporting' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'security', label: 'Security & Compliance' },
  { id: 'pricing', label: 'Pricing & Plans' },
  { id: 'support', label: 'Support & Resources' },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              <BookOpen className="h-4 w-4" />
              PropAI Product Guide
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">PropAI Documentation</h1>
              <p className="text-lg text-slate-600">
                Discover how to launch, automate, and scale your real estate operations with PropAI. This documentation outlines the platform architecture, day-to-day workflows, and best practices for teams of any size.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to homepage
                </Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link to="/register">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                <Link to="/#contact">
                  Talk to sales
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">On this page</p>
              <nav className="space-y-3 text-sm text-slate-600">
                {tableOfContents.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="block rounded-md px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-16">
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Overview</h2>
              <p className="text-slate-600 leading-relaxed">
                PropAI is an AI-powered CRM built specifically for real estate organizations. It unifies contact management, property intelligence, marketing automation, and revenue analytics in a single workspace. Teams leverage PropAI to reduce manual data entry, accelerate deal flow, and deliver consistent client experiences.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">Who is PropAI for?</p>
                  <p className="text-sm text-slate-600">
                    Residential brokerages, commercial teams, property developers, leasing agencies, and hybrid teams managing high-velocity deal pipelines.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">What problems does it solve?</p>
                  <p className="text-sm text-slate-600">
                    Fragmented client data, slow lead response times, manual marketing tasks, and lack of visibility into performance metrics across teams and listings.
                  </p>
                </div>
              </div>
            </section>

            <section id="core-modules" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Core Modules</h2>
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {coreModules.map(({ title, description, icon: Icon, bullets }) => (
                  <article key={title} className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{description}</p>
                    <ul className="space-y-3">
                      {bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="automation" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Automation &amp; AI</h2>
              <p className="text-slate-600 leading-relaxed">
                PropAI combines workflow automation with machine intelligence to move deals forward around the clock. Automations can be triggered by lead actions, property milestones, task updates, or incoming communications, ensuring timely engagement without manual intervention.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 text-indigo-600">
                    <Bot className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">AI Copilot</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Draft personalized outreach, summarize lengthy conversations, and surface the next best action directly from the PropAI assistant.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 text-indigo-600">
                    <Workflow className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Automation Builder</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Chain together triggers, conditions, assignments, and notifications to orchestrate complex deal playbooks with a visual editor.
                  </p>
                </div>
              </div>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {automationHighlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild variant="link" className="text-indigo-600">
                  <Link to="/automation">
                    Explore automation workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>

            <section id="productivity" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Productivity &amp; Collaboration</h2>
              <p className="text-slate-600 leading-relaxed">
                Keep everyone aligned with shared calendars, collaborative task boards, and rich deal workspaces. PropAI surfaces responsibilities, deadlines, and blockers so your team can maintain momentum from first touch through closing.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {productivityHighlights.map((highlight) => (
                  <div key={highlight} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                      <CalendarClock className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Workflow Insight</span>
                    </div>
                    <p className="text-sm text-slate-600">{highlight}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="analytics" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Analytics &amp; Reporting</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <LineChart className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Insight Engine</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Create dashboards that track revenue forecasts, agent performance, marketing attribution, and inventory velocity. Break down results by team, market, property type, or campaign, and export reports directly to Excel or share live links with leadership.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    Pipeline analytics with stage conversion, average days on market, and lost reason trends.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    Marketing source attribution from lead capture through closed deals.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    Downloadable CSV and XLSX exports with configurable field selections.
                  </li>
                </ul>
              </div>
            </section>

            <section id="getting-started" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Getting Started</h2>
              <ol className="space-y-4 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">1. Create your workspace.</span> <Link to="/register" className="text-indigo-600 hover:text-indigo-700">Sign up</Link> for a 14-day trial or invite your team via single sign-on.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">2. Import contacts and listings.</span> Use the <Link to="/contacts" className="text-indigo-600 hover:text-indigo-700">contact manager</Link> and <Link to="/properties" className="text-indigo-600 hover:text-indigo-700">property hub</Link> to upload CSVs or sync external systems.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">3. Configure automations.</span> Head to the <Link to="/automation" className="text-indigo-600 hover:text-indigo-700">automation studio</Link> to activate lead routing, nurture flows, and reminders.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">4. Launch communications.</span> Connect inboxes in <Link to="/email/accounts" className="text-indigo-600 hover:text-indigo-700">email settings</Link> and reuse <Link to="/email/templates" className="text-indigo-600 hover:text-indigo-700">templates</Link> for consistent outreach.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">5. Monitor results.</span> Visit the <Link to="/analytics" className="text-indigo-600 hover:text-indigo-700">analytics workspace</Link> to track adoption, opportunity velocity, and campaign ROI.
                </li>
              </ol>
            </section>

            <section id="integrations" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Integrations</h2>
              <p className="text-slate-600 leading-relaxed">
                PropAI connects with the tools your team already uses. Configure integrations under <Link to="/settings" className="text-indigo-600 hover:text-indigo-700">Settings → Integrations</Link>.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {integrations.map((item) => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">
                    <ServerCog className="mb-2 h-4 w-4 text-indigo-600" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="security" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Security &amp; Compliance</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-indigo-600 mb-3">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Enterprise-grade protection</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  PropAI is built on a secure architecture with granular access controls, audit logs, and encrypted data flows. Enterprise plans include custom data residency options and security reviews.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    Role-based permissions and team-level visibility filters.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    SOC 2-aligned operational controls with annual penetration testing.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    Encryption in transit (TLS 1.2+) and at rest (AES-256) for all customer data.
                  </li>
                </ul>
              </div>
            </section>

            <section id="pricing" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Pricing &amp; Plans</h2>
              <p className="text-slate-600 leading-relaxed">
                PropAI offers flexible tiers for solo agents through nationwide brokerages. Compare features and seat limits on the <Link to="/#pricing" className="text-indigo-600 hover:text-indigo-700">pricing section</Link> of the homepage, or reach out to our team for tailored enterprise proposals.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                  <Link to="/register">
                    Choose a plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  <Link to="/#contact">
                    Request pricing breakdown
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>

            <section id="support" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Support &amp; Resources</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {supportResources.map(({ title, description }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 text-indigo-600">
                      <LifeBuoy className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
                    </div>
                    <p className="text-sm text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <Button asChild variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50">
                  <Link to="/#contact">
                    Contact support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="link" className="text-indigo-600">
                  <Link to="/login">
                    Log in to submit a ticket
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documentation;
