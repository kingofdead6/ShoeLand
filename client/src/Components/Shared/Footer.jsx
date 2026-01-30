"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";
import { Instagram, Facebook, Phone, Music2 } from "lucide-react";

// Single store configuration (choose your default store here)
const STORE = {
  name: "ShoeLand",
  logo: "https://res.cloudinary.com/dygwvtddd/image/upload/v1769784192/9715bf9b-4037-4f18-9011-8097b42d0b57_tmszjq.jpg",
  phone: "",
  socials: [
    { type: "instagram", url: "https://www.instagram.com/dds_piyou?igsh=MXNicXE3bjFnbHYxcQ%3D%3D", label: "" },
    { type: "facebook", url: "https://web.facebook.com/people/DDS-piyou/61556215403716/", label: "DDS.Piyou Officiel" },
  ],
};

export default function Footer() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang] || {};
  const isRTL = lang === "ar";

  const navbarItems = t.navbar?.items || [];

  return (
    <footer className="bg-white border-t border-stone-200 py-16 lg:py-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={STORE.logo}
                alt={STORE.name}
                className="h-12 w-12 rounded-full object-cover shadow-sm"
              />
              <h3 className="text-2xl font-light tracking-tight text-stone-950">
                {STORE.name}
              </h3>
            </div>

            <p className="text-base text-stone-600 leading-relaxed">
              {lang === "fr"
                ? "Chaussures premium pour hommes et femmes. Style, confort et élégance."
                : "أحذية فاخرة للرجال والنساء. أناقة وراحة في كل خطوة."}
            </p>

            {/* Phone */}
            <div className="flex items-center gap-3 text-stone-700 hover:text-amber-800 transition">
              <Phone size={20} />
              <a href={`tel:${STORE.phone}`} className="text-lg font-medium">
                {STORE.phone}
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-light tracking-wide text-stone-900">
              {isRTL ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-4">
              {navbarItems.map((item) => (
                <li key={item.link}>
                  <Link
                    to={item.link}
                    className="text-stone-600 hover:text-amber-800 transition text-base"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social Media */}
          <div className="space-y-6">
            <h4 className="text-xl font-light tracking-wide text-stone-900">
              {isRTL ? "تابعنا" : "Follow Us"}
            </h4>
            <ul className="space-y-4">
              {STORE.socials.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-stone-600 hover:text-amber-800 transition text-base"
                  >
                    {social.type === "instagram" && <Instagram size={20} />}
                    {social.type === "facebook" && <Facebook size={20} />}
                    {social.type === "tiktok" && <Music2 size={20} />}
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact / Extra Info (optional) */}
          <div className="space-y-6">
            <h4 className="text-xl font-light tracking-wide text-stone-900">
              {isRTL ? "اتصل بنا" : "Contact Us"}
            </h4>
            <p className="text-stone-600 text-base leading-relaxed">
              {lang === "fr"
                ? "Pour toute question ou commande, contactez-nous directement."
                : "لأي استفسار أو طلب، تواصلوا معنا مباشرة."}
            </p>
            <div className="flex items-center gap-3 text-stone-700">
              <Phone size={20} />
              <span className="text-lg font-medium">{STORE.phone}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-10 border-t border-stone-200 text-center text-stone-500 text-sm">
          <p>
            © {new Date().getFullYear()} {STORE.name}.{" "}
            {lang === "fr" ? "Tous droits réservés." : "كل الحقوق محفوظة."}
          </p>
        </div>
      </div>
    </footer>
  );
}