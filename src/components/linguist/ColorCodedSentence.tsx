
'use client';

import type { SentencePart } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColorCodedSentenceProps {
  sentenceParts: SentencePart[];
}

const getRoleColorClass = (role: string): string => {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes('verb')) return 'text-pastel-pink font-medium';
  if (normalizedRole.includes('noun')) return 'text-pastel-green font-medium';
  if (normalizedRole.includes('adjective')) return 'text-pastel-yellow font-medium';
  if (normalizedRole.includes('adverb')) return 'text-pastel-purple font-medium';
  if (normalizedRole.includes('pronoun')) return 'text-pastel-blue font-medium';
  if (normalizedRole.includes('preposition')) return 'text-pastel-orange font-medium';
  if (normalizedRole.includes('conjunction')) return 'text-pastel-gray font-medium';
  if (normalizedRole.includes('determiner')) return 'text-pastel-teal font-medium';
  if (normalizedRole.includes('interjection')) return 'text-pastel-lime font-medium';
  if (normalizedRole.includes('punctuation')) return 'text-foreground/70';
  return 'text-foreground'; // Default color
};

export function ColorCodedSentence({ sentenceParts }: ColorCodedSentenceProps) {
  if (!sentenceParts || sentenceParts.length === 0) {
    return null;
  }

  return (
    <p className="text-lg leading-relaxed bg-muted/30 p-3 rounded-md shadow-inner">
      {sentenceParts.map((part, index) => (
        <span key={index} className={cn(getRoleColorClass(part.role), 'transition-colors duration-300 ease-in-out')}>
          {part.text}
          {/* Add space after each part unless it's the last part or next is punctuation */}
          {index < sentenceParts.length - 1 && 
           !sentenceParts[index+1].role.toLowerCase().includes('punctuation') &&
           !part.role.toLowerCase().includes('punctuation') && // also don't add space if current IS punctuation that normally attaches
           part.text !== ' ' /* Don't add extra space if part itself is a space */
           ? ' ' 
           : ''}
        </span>
      ))}
    </p>
  );
}
