"use client";

import React, { useContext, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";
import { Link } from "react-router-dom";

export default function Hero() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].hero || {};
  const isRTL = lang === "ar";

  const videoRef = useRef(null);

  const videoSrc = "https://res.cloudinary.com/dygwvtddd/video/upload/v1769783724/3627-172488393_greetm.mp4"; 

  const mainTitle = t.mainTitle || "Discover Your Style";
  const mainSubtitle = t.mainSubtitle || "Premium sneakers & urban fashion";
  const buttonText = t.shopNow || "Shop Now";
  const buttonLink = "/products";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch(() => {
        console.log("Autoplay prevented by browser policy");
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-stone-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Subtle overlay – keeps text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl w-full text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white drop-shadow-2xl"
          >
            {mainTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-5 sm:mt-8 text-lg sm:text-xl md:text-2xl text-stone-100 max-w-3xl mx-auto drop-shadow-lg"
          >
            {mainSubtitle}
          </motion.p>

          {buttonText && buttonLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9 }}
              className="mt-10"
            >
              <Link
                to={buttonLink}
                className="inline-block px-10 py-5 bg-stone-900 hover:bg-amber-800 text-white text-lg sm:text-xl font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {buttonText}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}