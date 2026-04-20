"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "No. Your 24-hour free trial requires no credit card or payment details. Just sign up and start watching immediately."
  },
  {
    q: "How long does setup take?",
    a: "Most customers are watching live TV within 5 minutes. We provide step-by-step guides for every device."
  },
  {
    q: "Can I watch on multiple screens?",
    a: "Yes. Starter supports 1 screen, Sports Fan supports 2 screens, and Ultimate supports 4 screens simultaneously."
  },
  {
    q: "What sports channels are included?",
    a: "All Sky Sports channels, TNT Sports 1-4, beIN Sports 1-7, Eurosport 1-2, Premier Sports, UFC Fight Pass, NFL Game Pass, NBA League Pass, and more."
  },
  {
    q: "Is there a contract?",
    a: "No contract. Cancel any time before your next billing date. No cancellation fees."
  },
  {
    q: "What happens after the 24-hour trial?",
    a: "Nothing happens automatically. We will contact you to confirm if you want to continue. You choose your plan and pay only when you're ready."
  },
  {
    q: "Which countries can I watch from?",
    a: "Anywhere in the world. No regional restrictions or VPN needed."
  },
  {
    q: "How do I get support?",
    a: "WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 30 minutes."
  }
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex justify-between items-center p-5 text-left cursor-pointer transition-colors hover:bg-[#12121a]/50"
            >
              <span className="font-bold text-white text-sm">{faq.q}</span>
              {isOpen ? (
                <Minus className="w-5 h-5 text-[#00e676] flex-shrink-0 ml-4" />
              ) : (
                <Plus className="w-5 h-5 text-[#00e676] flex-shrink-0 ml-4" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 pt-0 text-gray-400 text-sm">
                {faq.a}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
