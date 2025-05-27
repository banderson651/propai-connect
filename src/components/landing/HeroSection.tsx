import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Animated blob background */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 z-0">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-100 animate-blob opacity-70"></div>
      </div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 z-0">
        <div className="w-[500px] h-[500px] rounded-full bg-purple-100 animate-blob animation-delay-2000 opacity-70"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl animate-fade-in">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
              #1 Real Estate CRM
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Transform Your <span className="text-indigo-600">Real Estate</span> Business with AI
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              The all-in-one CRM platform designed specifically for real estate professionals.
              Manage contacts, properties, and sales pipelines with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto hover:scale-105 transition-all">
                  Start 14-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 w-full sm:w-auto">
                  See Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-indigo-${(i+3)*100}`}></div>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-indigo-700">1,000+</span> real estate professionals trust PropAI
              </p>
            </div>
          </div>
          
          <div className="relative z-10 animate-scale-in animation-delay-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transform rotate-3 scale-105 opacity-20 animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                alt="Dashboard Preview" 
                className="rounded-lg shadow-xl relative z-10"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sales increased</p>
                    <p className="text-lg font-bold text-green-600">+27%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 