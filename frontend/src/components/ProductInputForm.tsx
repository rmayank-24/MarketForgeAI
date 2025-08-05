// src/components/ProductInputForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/state/store';
import { Sparkles, Send } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const ProductInputForm: React.FC = () => {
  const [productIdea, setProductIdea] = useState('');
  const [contextFile, setContextFile] = useState<File | null>(null);
  const { generateLaunchKit, isLoading } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateLaunchKit(productIdea, contextFile);
  };

  const isValidInput = productIdea.trim().length >= 10;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="gradient-border animate-glow">
        <div className="bg-gradient-card">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl font-bold">
                Describe Your Product Idea
              </CardTitle>
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground">
              Share your product concept and watch our AI craft a comprehensive marketing strategy
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="e.g., A smart water bottle that tracks hydration levels throughout the day, syncs with fitness apps, and reminds users to drink water based on their activity level and weather conditions..."
                  className="min-h-[120px] resize-none bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {productIdea.length > 0 && (
                      productIdea.length < 10 
                        ? `${10 - productIdea.length} more characters needed`
                        : '✓ Ready to generate'
                    )}
                  </span>
                  <span>{productIdea.length}/500</span>
                </div>
              </div>

              <FileUpload onFileChange={setContextFile} disabled={isLoading} />
              
              <Button
                type="submit"
                disabled={!isValidInput || isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Generate Launch Kit
                  </div>
                )}
              </Button>
            </form>
            
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Market Analysis
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Product Copy
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Marketing Materials
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ProductInputForm;
