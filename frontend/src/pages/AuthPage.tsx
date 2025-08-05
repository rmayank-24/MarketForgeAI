import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AuthPage() {
  const { login, signup, error, isLoading, clearError } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const handleTabChange = (value) => {
    setActiveTab(value);
    clearError(); // Clear errors when switching tabs
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success;
    if (activeTab === 'login') {
      success = await login(email, password);
    } else {
      success = await signup(email, password);
      if (success) {
          alert("Signup successful! Please switch to the Login tab to sign in.");
          setActiveTab('login');
      }
    }
    if (success && activeTab === 'login') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h1 className="text-3xl font-bold text-gradient">MarketForge AI</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to access your AI-powered marketing tools
          </p>
        </div>

        {/* Auth Card */}
        <div className="gradient-border animate-glow">
          <Card className="bg-gradient-card border-0 shadow-card">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              {/* Login Form */}
              <TabsContent value="login" className="mt-0">
                <CardHeader className="pt-0">
                  <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="h-12 bg-muted/30 border-muted focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="h-12 bg-muted/30 border-muted focus:border-primary transition-smooth"
                      />
                    </div>
                    
                    {error && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-destructive text-sm text-center">{error}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold transition-smooth shadow-glow"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="mt-0">
                <CardHeader className="pt-0">
                  <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="h-12 bg-muted/30 border-muted focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="Create a password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="h-12 bg-muted/30 border-muted focus:border-primary transition-smooth"
                      />
                    </div>
                    
                    {error && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-destructive text-sm text-center">{error}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold transition-smooth shadow-glow"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>Powered by AI • Built for marketers</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;