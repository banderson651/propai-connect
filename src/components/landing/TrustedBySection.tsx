import { Building2, Landmark, ShieldCheck, Briefcase, HomeIcon } from 'lucide-react';

const partners = [
  { name: 'Skyline Realty Group', icon: Building2 },
  { name: 'Prime Estates', icon: HomeIcon },
  { name: 'Global Property Advisors', icon: Briefcase },
  { name: 'Urban Shield Insurance', icon: ShieldCheck },
  { name: 'Landmark Finance', icon: Landmark },
];

export const TrustedBySection = () => {
  return (
    <section id="trusted" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-indigo-50/70 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
            Trusted by Industry Leaders
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Built for Top Performing Real Estate Teams
          </h2>
          <p className="text-lg text-slate-600">
            PropAI powers growth for agencies, brokers, and developers across the globe.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {partners.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="group flex flex-col items-center justify-center gap-3 bg-secondary rounded-xl p-6 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold text-slate-700 text-center group-hover:text-indigo-700">
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
