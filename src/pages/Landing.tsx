
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
      {/* Header */}
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
            <a href="#solutions" className="text-indigo-800 hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#pricing" className="text-indigo-800 hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-indigo-800 hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#contact" className="text-indigo-800 hover:text-indigo-600 transition-colors">Contact</a>
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

      {/* Hero Section with animated blob */}
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

      {/* Features Section */}
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

      {/* Interactive Feature Showcase */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
              Specialized Solutions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need In One Place
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              PropAI brings together all the tools you need to manage your real estate business effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-4">
                <button 
                  className={`w-full text-left px-6 py-4 rounded-lg transition ${activeFeature === 0 ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveFeature(0)}
                >
                  <div className="flex items-start gap-4">
                    <Calendar className={`h-6 w-6 ${activeFeature === 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className={`text-lg font-medium ${activeFeature === 0 ? 'text-indigo-700' : 'text-slate-700'}`}>Task & Calendar Management</h3>
                      <p className={`${activeFeature === 0 ? 'text-slate-600' : 'text-slate-500'}`}>Never miss a follow-up with integrated task management and calendar sync.</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  className={`w-full text-left px-6 py-4 rounded-lg transition ${activeFeature === 1 ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveFeature(1)}
                >
                  <div className="flex items-start gap-4">
                    <LineChart className={`h-6 w-6 ${activeFeature === 1 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className={`text-lg font-medium ${activeFeature === 1 ? 'text-indigo-700' : 'text-slate-700'}`}>Sales Analytics</h3>
                      <p className={`${activeFeature === 1 ? 'text-slate-600' : 'text-slate-500'}`}>Track performance metrics and gain insights to optimize your sales process.</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  className={`w-full text-left px-6 py-4 rounded-lg transition ${activeFeature === 2 ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveFeature(2)}
                >
                  <div className="flex items-start gap-4">
                    <ListChecks className={`h-6 w-6 ${activeFeature === 2 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className={`text-lg font-medium ${activeFeature === 2 ? 'text-indigo-700' : 'text-slate-700'}`}>Sales Pipeline</h3>
                      <p className={`${activeFeature === 2 ? 'text-slate-600' : 'text-slate-500'}`}>Visualize and manage your sales process with customizable pipeline stages.</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  className={`w-full text-left px-6 py-4 rounded-lg transition ${activeFeature === 3 ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveFeature(3)}
                >
                  <div className="flex items-start gap-4">
                    <Zap className={`h-6 w-6 ${activeFeature === 3 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className={`text-lg font-medium ${activeFeature === 3 ? 'text-indigo-700' : 'text-slate-700'}`}>Marketing Automation</h3>
                      <p className={`${activeFeature === 3 ? 'text-slate-600' : 'text-slate-500'}`}>Automate your marketing efforts with triggered campaigns and sequences.</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  className={`w-full text-left px-6 py-4 rounded-lg transition ${activeFeature === 4 ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveFeature(4)}
                >
                  <div className="flex items-start gap-4">
                    <LayoutDashboard className={`h-6 w-6 ${activeFeature === 4 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className={`text-lg font-medium ${activeFeature === 4 ? 'text-indigo-700' : 'text-slate-700'}`}>Customizable Dashboard</h3>
                      <p className={`${activeFeature === 4 ? 'text-slate-600' : 'text-slate-500'}`}>Personalize your dashboard to focus on what matters most to your business.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-100 rounded-2xl transform -rotate-1 scale-105 opacity-50"></div>
              <div className="relative bg-white shadow-xl rounded-xl overflow-hidden">
                {activeFeature === 0 && (
                  <div className="animate-scale-in">
                    <img src="https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                      alt="Task Management" 
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">Smart Task Management</h4>
                      <p className="text-slate-600">Keep track of all your tasks, reminders, and appointments in one place with intelligent prioritization.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 1 && (
                  <div className="animate-scale-in">
                    <img src="https://images.unsplash.com/photo-1535957998253-26ae1ef29506?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                      alt="Sales Analytics" 
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">Data-Driven Insights</h4>
                      <p className="text-slate-600">Visualize key metrics and trends to make better decisions based on real-time data.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 2 && (
                  <div className="animate-scale-in">
                    <img src="https://images.unsplash.com/photo-1543286386-2e659306cd6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                      alt="Sales Pipeline" 
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">Visual Pipeline Management</h4>
                      <p className="text-slate-600">Drag and drop leads through your customized sales stages to close more deals efficiently.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 3 && (
                  <div className="animate-scale-in">
                    <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                      alt="Marketing Automation" 
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">Smart Automation Rules</h4>
                      <p className="text-slate-600">Set up triggers and actions to automate repetitive tasks and marketing sequences.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 4 && (
                  <div className="animate-scale-in">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1015&q=80" 
                      alt="Customizable Dashboard" 
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">Personalized Workspace</h4>
                      <p className="text-slate-600">Customize your dashboard widgets and layouts to focus on the metrics that matter most to you.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Blob decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 z-0">
          <div className="w-[300px] h-[300px] rounded-full bg-purple-100 mix-blend-multiply animate-blob"></div>
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 z-0">
          <div className="w-[250px] h-[250px] rounded-full bg-indigo-100 mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-indigo-600 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to transform your real estate business?</h3>
                <p className="mb-6">Schedule a free demo with our product specialists to see how PropAI can help you:</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 flex-shrink-0" />
                    <span>Close more deals with AI-powered insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 flex-shrink-0" />
                    <span>Save 5+ hours per week on administrative tasks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 flex-shrink-0" />
                    <span>Increase customer satisfaction and retention</span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-indigo-200" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-indigo-200" />
                    <span>contact@propai.com</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Request a Demo</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <Input placeholder="John Smith" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input type="email" placeholder="john@example.com" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <Input placeholder="+1 (555) 123-4567" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <Textarea placeholder="Tell us about your business needs..." className="w-full h-24" />
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Schedule Demo
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-4">
                    By submitting this form, you agree to our <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of real estate professionals who are already using PropAI to grow their business.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105 transition-all">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-indigo-500" />
                <span className="text-2xl font-bold text-white">PropAI</span>
              </div>
              <p className="text-slate-400">
                The all-in-one CRM platform for real estate professionals.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">CRM</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Client Portal</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-6 text-center">
            <p>© 2023 PropAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
