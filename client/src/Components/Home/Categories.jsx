"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function Categories() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].categories || {};
  const isRTL = lang === "ar";

  const categories = [
    {
      key: "men",
      title: t.men || "Men's Collection",
      image:
        "https://res.cloudinary.com/dygwvtddd/image/upload/v1769783237/673abace-cfc0-4482-aafd-e96cd1d25a5c_p47xg4.jpg",
      link: "/products/men",
    },
    {
      key: "women",
      title: t.women || "Women's Collection",
      image:
        "https://res.cloudinary.com/dygwvtddd/image/upload/v1769783343/image.jpg_lx8ttu.jpg",
      link: "/products/women",
    },
  ];

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row" dir={isRTL ? "rtl" : "ltr"}>
      {categories.map((cat) => (
        <Link
          key={cat.key}
          to={cat.link}
          className="relative flex-1 group overflow-hidden flex items-center justify-center transition-all duration-400 hover:flex-[1.08]"
        >
          <img
            src={cat.image}
            alt={cat.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Very subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 group-hover:from-black/50 transition-all duration-500" />

          {/* Text centered */}
          <div className="relative z-10 text-center px-6">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white drop-shadow-2xl">
              {cat.title}
            </h2>
          </div>
        </Link>
      ))}
    </section>
  );
}