// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...', { username });
      
      const response = await authService.login({ username, password });
      
      console.log('✅ Login successful:', response);
      
      toast.success('Welcome back!', {
        description: 'Redirecting to dashboard...'
      });

      // Small delay to show the toast
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); // Force reload to update auth state
      }, 500);

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      toast.error('Login failed', {
        description: error.response?.data?.detail || 'Invalid username or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-3xl">PS</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to PlayStudy
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            {/* Test Credentials Display */}
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-1">Test Account:</p>
              <p className="text-muted-foreground">Username: ifthikaraliseyed</p>
              <p className="text-muted-foreground">Password: Thisiscool@123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}