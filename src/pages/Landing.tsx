import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  LineChart, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  ListChecks, 
  Zap, 
  ChevronRight, 
  Mail, 
  Phone
} from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Automatic feature cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 5);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-playfair overflow-hidden">
      <LandingHeader isScrolled={isScrolled} />
      <HeroSection />
      <FeaturesSection />
      {/* Add other sections as components */}
    </div>
  );
};

export default Landing;
