import { type FormEvent } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const ContactSection = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-indigo-50/70 via-white to-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
              Let’s Talk
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Real Estate Operations?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Tell us about your team, and we’ll show you how PropAI can automate manual work, surface revenue opportunities, and streamline collaboration.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <a href="mailto:hello@propai.com" className="text-indigo-600 hover:text-indigo-700">
                    hello@propai.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <a href="tel:+14085551234" className="text-indigo-600 hover:text-indigo-700">
                    +1 (408) 555-1234
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Office</p>
                  <p className="text-slate-600">575 Market Street, Suite 2100, San Francisco, CA</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Hours</p>
                  <p className="text-slate-600">Monday - Friday, 9am to 6pm PST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 lg:p-10">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Contact our team</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <Input id="name" name="name" placeholder="Alex Johnson" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Work email
                  </label>
                  <Input id="email" type="email" name="email" placeholder="alex@company.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium text-slate-700">
                  Company name
                </label>
                <Input id="company" name="company" placeholder="Company Inc." required />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">
                  What can we help you with?
                </label>
                <Textarea id="message" name="message" rows={4} placeholder="Tell us about your goals" required />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Request a demo
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
