import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function FAQ() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].faq;
  const isRTL = lang === "ar";

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#2d2a26]">
        {t.title}
      </h2>

      <div className="space-y-6">
        {t.items.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[#4c2a00]/5 to-transparent">
              <h3 className="text-lg md:text-xl font-semibold text-[#2d2a26] pr-4">
                {faq.question}
              </h3>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                className="text-3xl font-bold text-[#4c2a00]"
              >
                {openIndex === i ? "−" : "+"}
              </motion.span>
            </div>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 pt-3 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}