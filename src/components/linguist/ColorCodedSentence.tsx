
'use client';

import React, { useState } from 'react';
import type { SentencePart, ExtendedAnalyzeSentenceOutput } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { GrammarHelpModal } from './GrammarHelpModal';

export interface GrammarTermDetail {
  label: string; // e.g., "Verbo"
  identifier: string; // e.g., "verb"
  title: string; // e.g., "Verbo (Verb)"
  definition: string;
  example: string;
  className: string; // Tailwind text color class for legend, e.g., 'text-pastel-pink'
  bgColorClass: string; // Tailwind background color class, e.g., 'bg-pastel-pink'
}

const grammarTermsDetails: GrammarTermDetail[] = [
  { label: 'Verbo', identifier: 'verb', title: 'Verbo (Verb)', definition: 'Palabra que expresa acción, estado o existencia.', example: '"run" (correr), "be" (ser/estar).', className: 'text-pastel-pink', bgColorClass: 'bg-pastel-pink' },
  { label: 'Sustantivo', identifier: 'noun', title: 'Sustantivo (Noun)', definition: 'Nombra personas, lugares, cosas o ideas. Puede ser propio (Mary, London) o común (dog, city).', example: '"book" (libro), "love" (amor).', className: 'text-pastel-green', bgColorClass: 'bg-pastel-green' },
  { label: 'Adjetivo', identifier: 'adjective', title: 'Adjetivo (Adjective)', definition: 'Describe o modifica sustantivos.', example: '"happy" (feliz), "blue" (azul).', className: 'text-pastel-yellow', bgColorClass: 'bg-pastel-yellow' },
  { label: 'Adverbio', identifier: 'adverb', title: 'Adverbio (Adverb)', definition: 'Modifica verbos, adjetivos u otros adverbios. Indica modo, tiempo, lugar, etc.', example: '"quickly" (rápidamente), "very" (muy).', className: 'text-pastel-purple', bgColorClass: 'bg-pastel-purple' },
  { label: 'Pronombre', identifier: 'pronoun', title: 'Pronombre (Pronoun)', definition: 'Reemplaza a un sustantivo para evitar repetición.', example: '"he" (él), "they" (ellos), "it" (eso).', className: 'text-pastel-blue', bgColorClass: 'bg-pastel-blue' },
  { label: 'Preposición', identifier: 'preposition', title: 'Preposición (Preposition)', definition: 'Muestra relación entre palabras (tiempo, espacio, dirección).', example: '"in" (en), "on" (sobre), "with" (con).', className: 'text-pastel-orange', bgColorClass: 'bg-pastel-orange' },
  { label: 'Conjunción', identifier: 'conjunction', title: 'Conjunción (Conjunction)', definition: 'Une palabras, frases o cláusulas.', example: '"and" (y), "but" (pero), "because" (porque).', className: 'text-pastel-gray', bgColorClass: 'bg-pastel-gray' },
  { label: 'Determinante', identifier: 'determiner', title: 'Determinante (Determiner)', definition: 'Introduce sustantivos (artículos, posesivos, demostrativos, etc.).', example: '"the" (el/la), "this" (este), "some" (algunos).', className: 'text-pastel-teal', bgColorClass: 'bg-pastel-teal' },
  { label: 'Interjección', identifier: 'interjection', title: 'Interjección (Interjection)', definition: 'Expresión breve que transmite emoción o reacción.', example: '"Wow!" (¡Guau!), "Ouch!" (¡Ay!).', className: 'text-pastel-lime', bgColorClass: 'bg-pastel-lime' },
  { label: 'Contracción', identifier: 'contraction', title: 'Contracción (Contraction)', definition: 'Forma acortada de dos palabras (sujeto + verbo o verbo + negación).', example: '"I’m" (I am), "don’t" (do not).', className: 'text-pastel-rose', bgColorClass: 'bg-pastel-rose' },
  { label: 'Puntuación', identifier: 'punctuation', title: 'Puntuación (Punctuation)', definition: 'Símbolos que organizan el texto y clarifican su significado.', example: '"." (punto), "," (coma), "?" (signo de interrogación).', className: 'text-muted-foreground', bgColorClass: 'bg-muted-foreground' },
  { label: 'Otro', identifier: 'other', title: 'Otro (Other)', definition: 'Palabras o frases que no encajan en las categorías anteriores o cuya función es mixta/específica.', example: 'N/A', className: 'text-foreground', bgColorClass: 'bg-muted' },
];


interface ColorCodedSentenceProps {
  sentenceParts: SentencePart[];
  wordAnalysis: ExtendedAnalyzeSentenceOutput['wordAnalysis'];
}

// Helper function to map detailed role from wordAnalysis to simplified role for coloring
const mapDetailedRoleToSimplifiedRole = (detailedRole: string): string => {
  const roleLower = detailedRole.toLowerCase();
  if (/\(adverb/.test(roleLower) || roleLower.startsWith('adverbio')) return 'adverb';
  if (/\(verb/.test(roleLower) || roleLower.startsWith('verbo')) return 'verb';
  if (/\(noun/.test(roleLower) || roleLower.startsWith('sustantivo')) return 'noun';
  if (/\(adjective/.test(roleLower) || roleLower.startsWith('adjetivo')) return 'adjective';
  if (/\(pronoun/.test(roleLower) || roleLower.startsWith('pronombre')) return 'pronoun';
  if (/\(preposition/.test(roleLower) || roleLower.startsWith('preposici')) return 'preposition';
  if (/\(conjunction/.test(roleLower) || roleLower.startsWith('conjunci')) return 'conjunction';
  if (/\(determiner/.test(roleLower) || roleLower.startsWith('determinante')) return 'determiner';
  if (/\(interjection/.test(roleLower) || roleLower.startsWith('interjecci')) return 'interjection';
  
  return 'other';
};

const getRoleColorClass = (
  part: SentencePart,
  wordAnalysis: ExtendedAnalyzeSentenceOutput['wordAnalysis']
): string => {
  let roleForColoring = part.role.toLowerCase(); 

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
  
  const mapping = grammarTermsDetails.find(m => roleForColoring === m.identifier);
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const legendItems = grammarTermsDetails.filter(item => item.identifier !== 'other');

  return (
    <>
      <div className="mt-3 p-3 border rounded-lg shadow bg-card/50 relative">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-card-foreground font-headline">Leyenda de Colores:</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHelpModalOpen(true)}
            className="h-7 w-7 p-0.5 hover:scale-110 transition-transform duration-150 ease-in-out"
            aria-label="Ayuda de términos gramaticales"
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Button>
        </div>
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
      <GrammarHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        terms={grammarTermsDetails.filter(term => term.identifier !== 'punctuation' && term.identifier !== 'other')} // Exclude Punctuation and Other from detailed modal view for now
      />
    </>
  );
}
