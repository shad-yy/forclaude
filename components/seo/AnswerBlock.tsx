/**
 * AnswerBlock — a visually-hidden-but-crawlable summary that leads every key page.
 * 
 * WHY: AI assistants (ChatGPT, Gemini, Perplexity) and voice search (Alexa, Siri)
 * extract the first substantive paragraph of a page. By placing a concise,
 * fact-dense summary at the top — styled as a visible "quick answer" card — we
 * give both humans and machines the answer first, before the interactive UI.
 *
 * The `.summary` CSS class is targeted by our SpeakableSpecification schema.
 */

interface AnswerBlockProps {
  /** The direct, one-sentence answer to the page's implied question */
  answer: string
  /** 2-4 supporting bullet points with key facts */
  facts?: string[]
  /** Optional className override */
  className?: string
}

export function AnswerBlock({ answer, facts, className }: AnswerBlockProps) {
  return (
    <div
      className={`summary bg-[#12121a]/80 border border-[#2a2a3a] rounded-2xl px-6 py-5 mb-8 ${className ?? ''}`}
      role="region"
      aria-label="Quick answer"
    >
      <p className="text-gray-200 text-base md:text-lg leading-relaxed font-medium">
        {answer}
      </p>
      {facts && facts.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-gray-400">
          {facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#00e676] mt-0.5 flex-shrink-0">✓</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
