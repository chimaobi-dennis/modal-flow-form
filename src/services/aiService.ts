import axios, { AxiosError } from 'axios';

// Types
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: AIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
export interface AIError {
  message: string;
  status?: number;
  data?: any;
}

// Configuration (JoJAPI)
const JOJ_API_KEY = import.meta.env.VITE_JOJ_API_KEY || import.meta.env.VITE_JOJAPI_KEY || '';

// Create axios instance with JoJAPI config
const api = axios.create({
  baseURL: 'https://arejz.jojapi.net',
  headers: {
    'Content-Type': 'application/json',
    'X-JoJAPI-Key': JOJ_API_KEY,
  },
  timeout: 30000, // 30 seconds
});

// Default model used across the app
export const DEFAULT_MODEL = 'gpt-5';

// Interface for the new API response format
interface NewAIResponse {
  result: string;
  response: string;
  id: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Get AI completion from the API
 * @param messages Array of message objects with role and content
 * @param options Additional options for the completion
 * @returns Promise with the AI response or error
 */
export const getAICompletion = async (
  messages: AIMessage[],
  options: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
  } = {}
): Promise<{ data?: AIResponse; error?: AIError }> => {
  try {
    // Transform messages to the Claude API format
    const transformedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await api.post<any>('/chat/completions', {
      model: options.model || DEFAULT_MODEL,
      messages: transformedMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens || 500,
      stream: options.stream ?? false,
    });

    // Normalize various possible RapidAPI wrappers to our AIResponse shape
    const d: any = response.data || {};
    const choices = Array.isArray(d.choices) ? d.choices : [];
    const contentFromChoices = choices[0]?.message?.content;
    const content = typeof contentFromChoices === 'string'
      ? contentFromChoices
      : (typeof d.response === 'string' ? d.response : '');

    const transformedResponse: AIResponse = {
      id: d.id || 'claude_' + Date.now(),
      object: 'chat.completion',
      created: d.created || Math.floor(Date.now() / 1000),
      model: d.model || (options.model || DEFAULT_MODEL),
      choices: [{
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      }],
      usage: d.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
    return { data: transformedResponse };
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData: AIError = {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };
    console.error('AI Service Error:', error);
    return { error: errorData };
  }
};

/**
 * List available models from JoJAPI
 */
export const listModels = async (): Promise<{ models?: any; error?: AIError }> => {
  try {
    const res = await api.get('/models');
    return { models: res.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData: AIError = {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };
    return { error: errorData };
  }
};

/**
 * Get resume section suggestions
 * @param section The resume section being edited (e.g., 'summary', 'experience')
 * @param currentContent The current content of the section
 * @param context Additional context (e.g., job description, resume content)
 * @returns Promise with the suggested content or error
 */
export const getResumeSuggestion = async (
  section: string,
  currentContent: string,
  context: string = ''
): Promise<{ content?: string; error?: AIError }> => {
  const systemPrompt = `You are an expert resume writer. Provide concise, professional suggestions for the ${section} section.`;

  const userPrompt = `Current ${section} content: "${currentContent}"
  ${context ? `\nAdditional context: ${context}` : ''}
  \nPlease improve this section to be more impactful and ATS-friendly.`;

  const { data, error } = await getAICompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    max_tokens: 300,
    temperature: 0.5, // Lower temperature for more focused suggestions
  });

  if (error) return { error };
  return { content: data?.choices[0]?.message?.content };
};

/**
 * @param context Additional context for better completion
 * @returns Promise with the completed text or error
 */
export const getTextCompletion = async (
  text: string,
  context: string = ''
): Promise<{ completion?: string; error?: AIError }> => {
  try {
    const response = await getAICompletion([
      {
        role: 'system',
        content: 'You are a helpful AI assistant that provides concise and accurate text completions.'
      },
      {
        role: 'user',
        content: context ? `${context}\n\n${text}` : text,
      },
    ], {
      temperature: 0.3, // Lower temperature for more focused completions
      max_tokens: 200,
    });

    if (response.error) {
      return { error: response.error };
    }

    return { completion: response.data?.choices[0]?.message?.content };
  } catch (error) {
    console.error('Text Completion Error:', error);
    return { error: { message: 'Failed to get text completion' } };
  }
};

/**
 * Get up to 3 short suggestions for the current answer input.
 */
export const getTextSuggestions = async (
  text: string,
  context: string = ''
): Promise<{ suggestions?: string[]; error?: AIError }> => {
  try {
    const { data, error } = await getAICompletion([
      { role: 'system', content: 'You provide up to 3 short alternative phrasings as a JSON array of strings, no explanations.' },
      { role: 'user', content: `${context ? context + '\n\n' : ''}Current answer: ${text}\n\nReturn ONLY JSON array of up to 3 concise suggestions.` },
    ], { temperature: 0.4, max_tokens: 120 });
    if (error) return { error };
    const raw = data?.choices[0]?.message?.content || '[]';
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed.map(String).slice(0, 3) : [];
      return { suggestions: arr };
    } catch {
      // fallback: split lines
      const arr = raw.split('\n').map(s => s.replace(/^[\-\*\d+\.\s]+/, '').trim()).filter(Boolean).slice(0, 3);
      return { suggestions: arr };
    }
  } catch (e) {
    return { error: { message: 'Failed to get suggestions' } };
  }
};

/**
 * Get ATS score and feedback for a resume
 * @param resumeContent The resume content to analyze
 * @param jobDescription Optional job description for targeted feedback
 * @returns Promise with ATS analysis results
 */
export const getATSFeedback = async (
  resumeContent: string,
  jobDescription: string = ''
): Promise<{ score?: number; feedback?: string[]; error?: AIError }> => {
  const systemPrompt = 'You are an expert ATS (Applicant Tracking System) analyzer. Provide a score from 0-100 and specific feedback for improvement.';

  const userPrompt = `Analyze this resume for ATS optimization:\n\n${resumeContent}\n\n${jobDescription
      ? `Target Job Description:\n${jobDescription}\n\nProvide specific feedback on how to tailor the resume for this job.`
      : 'Provide general ATS optimization feedback.'
    }\n\nFormat your response as a JSON object with "score" (0-100) and "feedback" (array of strings).`;

  const { data, error } = await getAICompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    max_tokens: 500,
    temperature: 0.3, // Lower temperature for more factual analysis
  });

  if (error) return { error };

  try {
    const result = JSON.parse(data?.choices[0]?.message?.content || '{}');
    return {
      score: result.score,
      feedback: Array.isArray(result.feedback) ? result.feedback : [],
    };
  } catch (e) {
    console.error('Failed to parse ATS feedback:', e);
    return { error: { message: 'Failed to parse ATS feedback' } };
  }
};

export default {
  getAICompletion,
  getResumeSuggestion,
  getTextCompletion,
  getTextSuggestions,
  getATSFeedback,
};

// New helpers for Other Document Services
/**
 * Generate 10 tailored questions for a given document type.
 * Returns a string array of questions.
 */
export const getDocumentQuestions = async (
  documentType: string
): Promise<{ questions?: string[]; error?: AIError }> => {
  const systemPrompt = 'You are an expert academic and professional writing assistant.';
  const userPrompt = `The user selected the following document type: "${documentType}".
Generate exactly 10 short, specific, non-overlapping questions that will gather all the necessary background details to write an excellent ${documentType}.
Guidelines:
- Keep each question concise (max ~120 characters)
- Prefer concrete details (achievements, metrics, timelines, names)
- Cover motivation, background, achievements, impact, goals, requirements
- Return ONLY a JSON array of strings (no explanations).`;

  const { data, error } = await getAICompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { max_tokens: 500, temperature: 0.6 }
  );

  if (error) return { error };
  const raw = data?.choices[0]?.message?.content || '[]';
  try {
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed) ? parsed.map(String).slice(0, 10) : [];
    return { questions };
  } catch (e) {
    // Fallback: try to split lines if not valid JSON
    const fallback = raw
      .split('\n')
      .map(s => s.replace(/^[-*\d+\.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 10);
    if (fallback.length) return { questions: fallback };
    return { error: { message: 'Failed to parse questions' } };
  }
};

/**
 * Generate 4-6 tailored questions using provided background context.
 */
export const getScopedDocumentQuestions = async (
  documentType: string,
  context: string,
  count: number = 6,
): Promise<{ questions?: string[]; error?: AIError }> => {
  const n = Math.max(4, Math.min(6, Math.round(count)));
  const systemPrompt = 'You are an expert academic and professional writing assistant.';
  const userPrompt = `The user selected document type: "${documentType}".
Use the following background details to propose ${n} specific, non-overlapping questions that will help write this ${documentType}.
Return ONLY a JSON array of strings.

Background:
${context}`;

  const { data, error } = await getAICompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { max_tokens: 500, temperature: 0.6 }
  );
  if (error) return { error };
  const raw = data?.choices[0]?.message?.content || '[]';
  try {
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed) ? parsed.map(String).slice(0, n) : [];
    return { questions };
  } catch {
    const fallback = raw
      .split('\n')
      .map(s => s.replace(/^[\-*\d+\.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, n);
    if (fallback.length) return { questions: fallback };
    return { error: { message: 'Failed to parse scoped questions' } };
  }
};

/**
 * Generate document content from Q&A answers and settings.
 */
export const generateDocumentFromQA = async (
  params: {
    documentType: string;
    answers: Array<{ question: string; answer: string }>;
    tone?: string;
    wordCount?: number | string;
    templateName?: string;
    additionalRequirements?: string;
  }
): Promise<{ content?: string; error?: AIError }> => {
  const targetWords = typeof params.wordCount === 'string' ? parseInt(params.wordCount) : (params.wordCount || 1000);
  const systemPrompt = 'You are a world-class writing assistant. Produce clear, compelling, and well-structured prose.';
  const qaBlock = params.answers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');
  const userPrompt = `Write a ${params.documentType} using the following Q&A details.
Tone: ${params.tone || 'formal'}
Target length: ~${targetWords} words
Template (if relevant): ${params.templateName || 'default'}
Additional requirements: ${params.additionalRequirements || 'None'}

Details:\n${qaBlock}

Instructions:
- Organize into coherent paragraphs with an engaging introduction and strong conclusion
- Maintain consistent tone and voice
- Incorporate concrete specifics from answers; avoid generic filler
- Do NOT include headings unless typical for this document type
- Output plain text paragraphs separated by blank lines.`;

  const { data, error } = await getAICompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { max_tokens: 1500, temperature: 0.7 }
  );
  if (error) return { error };
  return { content: data?.choices[0]?.message?.content || '' };
};

export const otherDocAI = {
  getDocumentQuestions,
  getScopedDocumentQuestions,
  generateDocumentFromQA,
  getTextCompletion,
};
