import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        {/* Main spinner */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent/50 rounded-full animate-spin animate-glow" 
             style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          🧠 AI is working its magic...
        </p>
        <p className="text-sm text-muted-foreground">
          Crafting your personalized marketing launch kit
        </p>
      </div>
      
      {/* Progress indicator dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;