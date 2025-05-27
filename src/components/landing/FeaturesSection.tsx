import { Link } from 'react-router-dom';
import { CheckCircle2, Users, Building2, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 bg-slate-50 relative overflow-hidden">
      {/* Blob decoration */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -ml-40 z-0">
        <div className="w-[300px] h-[300px] rounded-full bg-indigo-50 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Features That Drive Results
          </h2>
          <p className="text-xl text-slate-600">
            Our comprehensive toolset helps you streamline operations, nurture leads, and close more deals with less effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Contact Management</h3>
            <p className="text-slate-600 mb-4">
              Centralize client data with smart tagging and track all interactions in one place.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>AI-powered lead qualification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Interaction history tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Customizable contact fields</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <Building2 className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Property Integration</h3>
            <p className="text-slate-600 mb-4">
              Manage your property listings and connect them with potential buyers seamlessly.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Property listing management</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>AI-powered matching algorithm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Virtual tours integration</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Communication Hub</h3>
            <p className="text-slate-600 mb-4">
              Keep all your client communications in one place and never miss an opportunity.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>WhatsApp Business integration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Email campaign automation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Template management</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Explore All Features <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}; 