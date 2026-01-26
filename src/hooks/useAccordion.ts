import { useState } from 'react';

export const useAccordion = (initialOpenIndex: number | null = null) => {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return {
    openIndex,
    toggleAccordion,
  };
};