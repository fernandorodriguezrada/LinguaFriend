
'use client';

import type { SentencePart } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColorCodedSentenceProps {
  sentenceParts: SentencePart[];
}

export const grammarColorMapping = [
  { label: 'Verbo', identifier: 'verb', className: 'text-pastel-pink', bgColorClass: 'bg-pastel-pink' },
  { label: 'Sustantivo', identifier: 'noun', className: 'text-pastel-green', bgColorClass: 'bg-pastel-green' },
  { label: 'Adjetivo', identifier: 'adjective', className: 'text-pastel-yellow', bgColorClass: 'bg-pastel-yellow' },
  { label: 'Adverbio', identifier: 'adverb', className: 'text-pastel-purple', bgColorClass: 'bg-pastel-purple' },
  { label: 'Pronombre', identifier: 'pronoun', className: 'text-pastel-blue', bgColorClass: 'bg-pastel-blue' },
  { label: 'Preposición', identifier: 'preposition', className: 'text-pastel-orange', bgColorClass: 'bg-pastel-orange' },
  { label: 'Conjunción', identifier: 'conjunction', className: 'text-pastel-gray', bgColorClass: 'bg-pastel-gray' },
  { label: 'Determinante', identifier: 'determiner', className: 'text-pastel-teal', bgColorClass: 'bg-pastel-teal' },
  { label: 'Interjección', identifier: 'interjection', className: 'text-pastel-lime', bgColorClass: 'bg-pastel-lime' },
  { label: 'Puntuación', identifier: 'punctuation', className: 'text-foreground/70', bgColorClass: 'bg-foreground/10' },
  { label: 'Otro', identifier: 'other', className: 'text-foreground', bgColorClass: 'bg-muted' },
];

const getRoleColorClass = (role: string): string => {
  const normalizedRole = role.toLowerCase();
  const mapping = grammarColorMapping.find(m => normalizedRole.includes(m.identifier));
  return mapping ? `${mapping.className} font-medium` : 'text-foreground font-medium';
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
          {index < sentenceParts.length - 1 && 
           !sentenceParts[index+1].role.toLowerCase().includes('punctuation') &&
           !part.role.toLowerCase().includes('punctuation') && 
           part.text !== ' ' 
           ? ' ' 
           : ''}
        </span>
      ))}
    </p>
  );
}

export function GrammarLegend() {
  const legendItems = grammarColorMapping.filter(item => item.identifier !== 'other');

  return (
    <div className="mt-3 p-3 border rounded-lg shadow bg-card/50">
      <h4 className="text-sm font-semibold mb-2 text-card-foreground font-headline">Leyenda de Colores:</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
        {legendItems.map((item) => (
          <div key={item.identifier} className="flex items-center">
            <span
              className={cn('h-3 w-3 rounded-full mr-2 shrink-0', item.bgColorClass)}
              aria-hidden="true"
            />
            <span className={cn(item.className, 'font-medium')}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
