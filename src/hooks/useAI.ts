import { useState, useCallback } from 'react';
import { 
  AIMessage, 
  getAICompletion, 
  getResumeSuggestion, 
  getTextCompletion, 
  getATSFeedback,
  AIError
} from '@/services/aiService';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AIError | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const withLoading = async <T,>(
    callback: () => Promise<T>
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await callback();
    } catch (err) {
      const error = err as AIError;
      setError(error);
      console.error('AI Hook Error:', error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCompletion = useCallback(async (
    messages: AIMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
    } = {}
  ) => {
    return withLoading(async () => {
      const { data, error } = await getAICompletion(messages, options);
      if (error) throw error;
      return data;
    });
  }, []);

  const enhanceResumeSection = useCallback(async (
    section: string,
    currentContent: string,
    context: string = ''
  ) => {
    return withLoading(async () => {
      const { content, error } = await getResumeSuggestion(section, currentContent, context);
      if (error) throw error;
      return content;
    });
  }, []);

  const completeText = useCallback(async (
    text: string,
    context: string = ''
  ) => {
    return withLoading(async () => {
      const { completion, error } = await getTextCompletion(text, context);
      if (error) throw error;
      return completion;
    });
  }, []);

  const analyzeResume = useCallback(async (
    resumeContent: string,
    jobDescription: string = ''
  ) => {
    return withLoading(async () => {
      const { score, feedback, error } = await getATSFeedback(resumeContent, jobDescription);
      if (error) throw error;
      return { score, feedback };
    });
  }, []);

  return {
    // State
    isLoading,
    error,
    resetError,
    
    // Methods
    generateCompletion,
    enhanceResumeSection,
    completeText,
    analyzeResume,
  };
};

export default useAI;
