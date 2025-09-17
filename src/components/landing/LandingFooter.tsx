import { Link } from 'react-router-dom';
import { Building2, Facebook, Linkedin, Twitter } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 pt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-indigo-400" />
              <span className="text-xl font-bold">PropAI</span>
            </div>
            <p className="text-sm text-slate-300">
              Intelligent CRM built for modern real estate teams. Automate follow-ups, prioritize leads, and close deals faster.
            </p>
            <div className="flex gap-3">
              {[Facebook, Linkedin, Twitter].map((Icon) => (
                <a
                  key={Icon.displayName ?? Icon.name}
                  href="https://propai.com"
                  aria-label={`PropAI on ${(Icon.displayName ?? Icon.name)}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-indigo-500 hover:text-indigo-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Platform</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="hover:text-indigo-300 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-indigo-300 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-indigo-300 transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-indigo-300 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Resources</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/login" className="hover:text-indigo-300 transition-colors">
                  Customer login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-300 transition-colors">
                  Start free trial
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="hover:text-indigo-300 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-indigo-300 transition-colors">
                  Support center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Stay Updated</p>
            <p className="text-sm text-slate-300 mb-4">
              Subscribe to our newsletter for product updates, growth insights, and customer stories.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>© {new Date().getFullYear()} PropAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-indigo-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-300 transition-colors">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-indigo-300 transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
