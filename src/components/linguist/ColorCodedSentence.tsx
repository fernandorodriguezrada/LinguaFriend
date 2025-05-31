
'use client';

import type { SentencePart, ExtendedAnalyzeSentenceOutput } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColorCodedSentenceProps {
  sentenceParts: SentencePart[];
  wordAnalysis: ExtendedAnalyzeSentenceOutput['wordAnalysis'];
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
  { label: 'Contracción', identifier: 'contraction', className: 'text-pastel-rose', bgColorClass: 'bg-pastel-rose' },
  { label: 'Puntuación', identifier: 'punctuation', className: 'text-foreground/70', bgColorClass: 'bg-foreground/10' },
  { label: 'Otro', identifier: 'other', className: 'text-foreground', bgColorClass: 'bg-muted' },
];

// Helper function to map detailed role from wordAnalysis to simplified role for coloring
const mapDetailedRoleToSimplifiedRole = (detailedRole: string): string => {
  const roleLower = detailedRole.toLowerCase();
  // Order might matter if there's overlap; check more specific or common terms.
  // Prioritizing English terms if present in parentheses.
  if (/\(adverb/.test(roleLower) || roleLower.startsWith('adverbio')) return 'adverb';
  if (/\(verb/.test(roleLower) || roleLower.startsWith('verbo')) return 'verb';
  if (/\(noun/.test(roleLower) || roleLower.startsWith('sustantivo')) return 'noun';
  if (/\(adjective/.test(roleLower) || roleLower.startsWith('adjetivo')) return 'adjective';
  if (/\(pronoun/.test(roleLower) || roleLower.startsWith('pronombre')) return 'pronoun';
  if (/\(preposition/.test(roleLower) || roleLower.startsWith('preposici')) return 'preposition';
  if (/\(conjunction/.test(roleLower) || roleLower.startsWith('conjunci')) return 'conjunction';
  if (/\(determiner/.test(roleLower) || roleLower.startsWith('determinante')) return 'determiner';
  if (/\(interjection/.test(roleLower) || roleLower.startsWith('interjecci')) return 'interjection';
  
  return 'other'; // Fallback
};

const getRoleColorClass = (
  part: SentencePart,
  wordAnalysis: ExtendedAnalyzeSentenceOutput['wordAnalysis']
): string => {
  let roleForColoring = part.role.toLowerCase(); // Default to role from sentenceParts

  // For words (not punctuation or contractions already identified by sentenceParts),
  // try to get a more accurate role from wordAnalysis.
  if (roleForColoring !== 'punctuation' && roleForColoring !== 'contraction') {
    const analyzedWordEntry = wordAnalysis.find(
      (wa) => wa.word.toLowerCase() === part.text.toLowerCase()
    );

    if (analyzedWordEntry && analyzedWordEntry.role) {
      const mappedRole = mapDetailedRoleToSimplifiedRole(analyzedWordEntry.role);
      if (mappedRole !== 'other') { 
        roleForColoring = mappedRole;
      }
    }
  }
  
  const mapping = grammarColorMapping.find(m => roleForColoring === m.identifier);
  return mapping ? `${mapping.className} font-medium` : 'text-foreground font-medium';
};

export function ColorCodedSentence({ sentenceParts, wordAnalysis }: ColorCodedSentenceProps) {
  if (!sentenceParts || sentenceParts.length === 0) {
    return null;
  }

  return (
    <p className="text-lg leading-relaxed bg-muted/30 p-3 rounded-md shadow-inner">
      {sentenceParts.map((part, index) => (
        <span key={index} className={cn(getRoleColorClass(part, wordAnalysis), 'transition-colors duration-300 ease-in-out')}>
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
