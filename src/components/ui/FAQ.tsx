import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FAQ({ faqs, title = "Frequently Asked Questions" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {title && (
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          {title}
        </h2>
      )}
      
      <div className="flex flex-col border border-border-base bg-bg-surface rounded-md overflow-hidden divide-y divide-border-base/50 shadow-small">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="flex flex-col">
              {/* Question Trigger Accordion Button */}
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-5 py-4 text-left font-bold text-text-primary flex items-center justify-between hover:bg-bg-base transition-smooth group focus-visible:outline-none"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-btn-${idx}`}
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-text-muted group-hover:text-primary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Answer Content Wrapper */}
              <div
                id={`faq-answer-${idx}`}
                role="region"
                aria-labelledby={`faq-btn-${idx}`}
                className={`accordion-content ${isOpen ? 'max-h-96 border-t border-border-base/30' : 'max-h-0'}`}
              >
                <p className="p-5 text-sm leading-relaxed text-text-secondary bg-bg-base/30">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { FAQ };
