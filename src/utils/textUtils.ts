/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export const truncate = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Capitalizes the first letter of each word in a string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formats a date string to a more readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Present';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short',
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Calculates the duration between two dates in years and months
 */
export const calculateDuration = (startDate: string, endDate?: string): string => {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                (end.getMonth() - start.getMonth());
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`);
  
  return parts.join(' ') || '0 mos';
};

/**
 * Extracts keywords from text for ATS optimization
 */
export const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // Remove special characters and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .split(/\s+/);
  
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'to', 'of', 'in', 'for', 'on', 'with', 'as', 'by', 'at', 'from', 'up', 'about', 'into',
    'over', 'after', 'under', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs'
  ]);
  
  // Count word frequencies
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and get top 20
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
};

/**
 * Calculates reading time for text
 */
export const calculateReadingTime = (text: string, wordsPerMinute = 200): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};
