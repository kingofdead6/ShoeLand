import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";
import { Instagram, Facebook, Phone, Music2 } from "lucide-react"; // Music2 for TikTok

// 1. Define your store data configuration
const STORE_DATA = {
  "DDS.Piyou": {
    logo: "https://res.cloudinary.com/dwbjyx1bo/image/upload/v1764888332/IMG-20251204-WA0006_feaflc.jpg",
    phone: "0670767455",
    socials: [
      { type: "instagram", url: "https://www.instagram.com/dds_piyou?igsh=MXNicXE3bjFnbHYxcQ%3D%3D", label: "@dds.piyou" },
      { type: "facebook", url: "https://web.facebook.com/people/DDS-piyou/61556215403716/", label: "DDS.Piyou Officiel" },
    ]
  },
  "AB-Zone": {
    logo: "https://res.cloudinary.com/dwbjyx1bo/image/upload/v1766093846/589427618_17893469031365762_6597933128971757385_n_uuejf7.jpg",
    phone: "0676832233",
    socials: [
      { type: "instagram", url: "https://www.instagram.com/ab_zone05/", label: "@ab_zone05" },
      { type: "facebook", url: "https://www.facebook.com/share/1BhUSmq8yQ/", label: "AB-Zone" },
      { type: "tiktok", url: "https://www.tiktok.com/@abzone3", label: "@ab_zone3" },
    ]
  },
  "Tchingo Mima 2": {
    logo: "https://res.cloudinary.com/dwbjyx1bo/image/upload/v1766093846/360096255_260970476644613_6094150478767954017_n_bqjajp.jpg",
    phone: "0666 94 88 12",
    socials: [
      { type: "facebook", url: "https://www.facebook.com/share/1AWr9KbHSp/?mibextid=wwXIfr", label: "Tchingo Mima 2" },
    ]
  }
};

export default function Footer() {
  const { lang } = useContext(LanguageContext);
  const location = useLocation();
  const t = translations[lang];
  const isRTL = lang === "ar";

  // 2. Determine which store info to show
  // If we are on a specific store's page (e.g., via state), show only that one.
  // Otherwise, show all stores (default)
  const activeStoreName = location.state?.selectedStore;
  const displayedStores = activeStoreName ? [activeStoreName] : Object.keys(STORE_DATA);

  return (
    <footer className="bg-[#2d2a26] text-[#f5f0e8] py-16" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-gray-600 pb-2 inline-block">
              {isRTL ? "À propos" : "About Us"}
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {lang === "fr"
                ? "Chaussures premium pour hommes et femmes. Style, confort et élégance."
                : "أحذية فاخرة للرجال والنساء. أناقة وراحة في كل خطوة."}
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">{isRTL ? "روابط سريعة" : "Quick Links"}</h3>
            <ul className="space-y-4 text-lg">
              {t.navbar.items.map((item) => (
                <li key={item.link}>
                  <Link to={item.link} className="hover:text-white transition border-b border-transparent hover:border-[#f5f0e8]">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 & 4: Dynamic Stores Data */}
          {displayedStores.map((storeName) => {
            const store = STORE_DATA[storeName];
            if (!store) return null;

            return (
              <div key={storeName} className="space-y-6">
                <div className="flex items-center gap-3">
                  <img src={store.logo} alt={storeName} className="h-10 w-10 rounded-full object-cover border border-gray-500" />
                  <h3 className="text-xl font-bold">{storeName}</h3>
                </div>
                
                <ul className="space-y-3">
                  {/* Phone */}
                  {store.phone && (
                    <li className="flex items-center gap-3 text-gray-300 hover:text-white transition">
                      <Phone size={18} className="shrink-0" />
                      <a href={`tel:${store.phone}`}>{store.phone}</a>
                    </li>
                  )}

                  {/* Dynamic Social Links */}
                  {store.socials.map((social, idx) => (
                    <li key={idx}>
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition"
                      >
                        {social.type === "instagram" && <Instagram size={18} />}
                        {social.type === "facebook" && <Facebook size={18} />}
                        {social.type === "tiktok" && <Music2 size={18} />}
                        <span>{social.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} DDS.Piyou_AB-Zone Platform.{" "}
            {lang === "fr" ? "Tous droits réservés." : "كل الحقوق محفوظة."}
          </p>
        </div>
      </div>
    </footer>
  );
}