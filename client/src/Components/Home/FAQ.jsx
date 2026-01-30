"use client";

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function FAQ() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].faq || {};
  const isRTL = lang === "ar";

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="min-h-screen pt-24 pb-20 px-5 sm:px-8 lg:px-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-950">
            {t.title || "Frequently Asked Questions"}
          </h1>
          <p className="mt-4 text-xl text-stone-600">
            {t.subtitle || "Find answers to the most common questions"}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {t.items?.map((faq, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-stone-100 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/30 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {/* Question Header */}
              <div className="flex justify-between items-center p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-light text-stone-900 pr-6 leading-tight">
                  {faq.question}
                </h3>

                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-2xl sm:text-3xl font-light text-amber-700 flex-shrink-0"
                >
                  {openIndex === index ? "−" : "+"}
                </motion.span>
              </div>

              {/* Answer Content */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-8 pb-8 pt-2">
                      <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Optional: No FAQs message */}
        {(!t.items || t.items.length === 0) && (
          <div className="text-center py-20">
            <p className="text-2xl font-light text-stone-500">
              {t.noQuestions || "No questions available at the moment"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}