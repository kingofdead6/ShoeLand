"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LanguageContext } from "../Components/context/LanguageContext";
import { translations } from "../../translations";

export default function NotFound() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang]?.notFound || translations["fr"]?.notFound || {};
  const isRTL = lang === "ar";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 bg-white text-center"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Animated 404 Number */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-8xl sm:text-9xl lg:text-[12rem] font-light tracking-tighter text-stone-400 mb-6"
      >
        404
      </motion.div>

      {/* Main Message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-stone-950 mb-4"
      >
        {t.title || "Page Not Found"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-lg sm:text-xl text-stone-600 max-w-2xl mb-10 leading-relaxed"
      >
        {t.message ||
          "The page you're looking for doesn't exist or has been moved. Let's get you back to shopping!"}
      </motion.p>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link
          to="/products"
          className="inline-flex items-center px-10 py-5 bg-stone-900 hover:bg-amber-800 text-white text-lg font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {t.backToCollection || "Back to Collection"}
        </Link>
      </motion.div>

      {/* Optional subtle decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-amber-100/30 to-transparent pointer-events-none"
      />
    </div>
  );
}