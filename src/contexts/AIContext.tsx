import React, { createContext, useContext, ReactNode } from 'react';
import { AIMessage } from '@/services/aiService';
import { useAI } from '@/hooks/useAI';

interface AIContextType extends ReturnType<typeof useAI> {
  // Add any additional context values here
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ai = useAI();

  return (
    <AIContext.Provider value={ai}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
