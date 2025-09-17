import { CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    frequency: 'per month',
    description: 'Perfect for solo agents getting started with automation.',
    features: [
      'Up to 2 team seats',
      '1,000 contact records',
      'Automated lead capture',
      'Email and WhatsApp templates',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$129',
    frequency: 'per month',
    description: 'Scale your team with advanced AI insights and analytics.',
    features: [
      'Up to 10 team seats',
      'Unlimited contacts',
      'Sales pipeline automation',
      'Predictive deal scoring',
      'Priority support',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Let’s Talk',
    frequency: 'custom pricing',
    description: 'Tailored solutions for national brokerages and developers.',
    features: [
      'Unlimited team seats',
      'Dedicated success manager',
      'Custom AI workflows',
      'Onboarding & training',
      'Advanced security controls',
    ],
    cta: 'Speak to Sales',
    highlighted: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-indigo-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
            Flexible Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose the Plan That Grows With You
          </h2>
          <p className="text-lg text-slate-600">
            No hidden fees. Cancel anytime. Upgrade or downgrade as your team evolves.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                plan.highlighted
                  ? 'border-indigo-600 shadow-xl bg-white'
                  : 'border-slate-200 bg-white shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-6 right-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  <Zap className="w-4 h-4" />
                  Most popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.frequency}</span>
                </div>
                <p className="text-slate-600 mb-8">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                  variant={plan.highlighted ? 'default' : 'secondary'}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
