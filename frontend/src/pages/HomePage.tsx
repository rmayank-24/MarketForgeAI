import React from 'react';
import { useAppStore } from '../state/store';
import ProductInputForm from '../components/ProductInputForm';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isLoading, error, launchKit, clearError } = useAppStore();

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-1 hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : launchKit ? (
          <ResultsDisplay />
        ) : (
          <div className="space-y-8">
            <ProductInputForm />
            
            {/* Feature highlights */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3 p-6 rounded-lg bg-card/30 border border-border/30">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold">Market Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Deep insights into your target market, competition, and positioning strategy
                  </p>
                </div>
                
                <div className="space-y-3 p-6 rounded-lg bg-card/30 border border-border/30">
                  <div className="w-12 h-12 mx-auto bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h3 className="font-semibold">Compelling Copy</h3>
                  <p className="text-sm text-muted-foreground">
                    Persuasive product descriptions and advertising copy that converts
                  </p>
                </div>
                
                <div className="space-y-3 p-6 rounded-lg bg-card/30 border border-border/30">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold">Social Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Ready-to-post social media content tailored to your audience
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;