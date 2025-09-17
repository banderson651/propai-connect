import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeaderProps {
  isScrolled: boolean;
}

export const LandingHeader = ({ isScrolled }: LandingHeaderProps) => {
  return (
    <header className={`fixed w-full px-4 py-4 transition-all duration-300 z-50 ${
      isScrolled ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <span className="text-2xl font-bold text-indigo-900">PropAI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-indigo-800 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#trusted" className="text-indigo-800 hover:text-indigo-600 transition-colors">Trusted by</a>
          <a href="#pricing" className="text-indigo-800 hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#testimonials" className="text-indigo-800 hover:text-indigo-600 transition-colors">Testimonials</a>
          <a href="#contact" className="text-indigo-800 hover:text-indigo-600 transition-colors">Contact</a>
          <Link to="/documentation" className="text-indigo-800 hover:text-indigo-600 transition-colors">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}; 
