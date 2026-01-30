"use client";

import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

const ProductCarousel = ({ titleKey, reverse = false, endpoint }) => {
  const { lang } = useContext(LanguageContext);
  const tCarousel = translations[lang].productCarousel || {};
  const tHome = translations[lang].home || {};
  const isRTL = lang === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const titleMap = {
    trendingProducts: tHome.trendingProducts || "Trending Products",
    bestOffers: tHome.bestOffers || "Best Offers",
    specialOffers: tHome.specialOffers || "Special Offers",
    featuredMen: tCarousel.featuredMen || "Featured for Men",
    featuredWomen: tCarousel.featuredWomen || "Featured for Women",
    newArrivals: tCarousel.newArrivals || "New Arrivals",
  };

  const title = titleMap[titleKey] || titleKey;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/${endpoint}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(`Failed to load products for ${titleKey}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [endpoint, titleKey]);

  if (loading) {
    return (
      <section className="py-20 lg:py-28 px-5 sm:px-8 lg:px-12 bg-white" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-950 text-center mb-16">
            {title}
          </h2>
          <div className="text-center">
            <div className="text-3xl font-light text-amber-800/80 animate-pulse tracking-wide">
              {tCarousel.loading || "Loading collection..."}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-20 lg:py-28 px-5 sm:px-8 lg:px-12 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-950 text-center mb-16 lg:mb-20">
          {title}
        </h2>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          loop={products.length > 4}
          navigation
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            reverseDirection: reverse || isRTL,
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 32 },
            1280: { slidesPerView: 4, spaceBetween: 40 },
          }}
          className="!px-4 !pb-12"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <Link to={`/product/${product._id}`}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-500/50 transition-all duration-400 hover:shadow-xl hover:shadow-amber-100/30">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-light text-stone-800 line-clamp-2 min-h-[2.8em] leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xl sm:text-2xl font-medium text-amber-700 tracking-wide mt-2">
                      {product.price.toLocaleString()} DA
                    </p>

                    <button className="cursor-pointer mt-5 w-full py-3.5 bg-stone-900 hover:bg-amber-800 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                      {tCarousel.viewDetails || "View Details"}
                    </button>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default ProductCarousel;