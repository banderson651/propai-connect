
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication (this would be an API call in a real app)
    setTimeout(() => {
      // Demo account credentials check
      if ((email === 'user@propai.com' && password === 'demouser123') || 
          (email === 'admin@propai.com' && password === 'demoadmin123')) {
        
        // Store user info in localStorage (in a real app, you'd use a more secure method)
        const isAdmin = email === 'admin@propai.com';
        localStorage.setItem('user', JSON.stringify({ 
          email, 
          role: isAdmin ? 'admin' : 'user',
          name: isAdmin ? 'Admin User' : 'Demo User'
        }));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${isAdmin ? 'Admin' : 'Demo User'}!`,
        });
        
        // Redirect to dashboard
        navigate('/');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Try using the demo accounts.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 ml-2">PropAI</span>
          </div>
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">Demo Accounts:</p>
              <p className="text-xs text-blue-700 mt-1">User: user@propai.com / demouser123</p>
              <p className="text-xs text-blue-700">Admin: admin@propai.com / demoadmin123</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full mb-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
