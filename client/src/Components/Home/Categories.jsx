// src/Components/Home/Categories.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function Categories() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].categories;
  const isRTL = lang === "ar";

  return (
    <section
      className="w-full min-h-screen flex flex-col md:flex-row" // Stack on mobile, row on md+
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Men Category */}
      <a
        href="/products/men"
        className="relative w-full md:w-1/2 h-96 md:h-screen group overflow-hidden flex items-center justify-center"
      >
        <img
          src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1763718178/download_vkvghk.jpg"
          alt={t.men}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Text */}
        <h2 className="relative z-10 text-white font-extrabold tracking-wider drop-shadow-2xl text-center px-6
          text-5xl sm:text-6xl md:text-7xl lg:text-8xl
          leading-tight"
        >
          {t.men}
        </h2>

        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </a>

      {/* Women Category */}
      <a
        href="/products/women"
        className="relative w-full md:w-1/2 h-96 md:h-screen group overflow-hidden flex items-center justify-center"
      >
        <img
          src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1763718178/Stunning_Casual_Outfits_With_Jeans_muvbnp.jpg"
          alt={t.women}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Text */}
        <h2 className="relative z-10 text-white font-extrabold tracking-wider drop-shadow-2xl text-center px-6
          text-5xl sm:text-6xl md:text-7xl lg:text-8xl
          leading-tight"
        >
          {t.women}
        </h2>

        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </a>
    </section>
  );
}