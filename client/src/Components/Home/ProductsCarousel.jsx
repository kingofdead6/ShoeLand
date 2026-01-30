import { useState, useEffect, useContext } from "react";
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
  const tCarousel = translations[lang].productCarousel;
  const tHome = translations[lang].home;
  const isRTL = lang === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const titleMap = {
    trendingProducts: tHome.trendingProducts,
    bestOffers: tHome.bestOffers,
    specialOffers: tHome.specialOffers,
    featuredMen: tCarousel.featuredMen,
    featuredWomen: tCarousel.featuredWomen,
    newArrivals: tCarousel.newArrivals,
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
      <section className="py-20 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <h2 className="text-4xl font-bold text-[#2d2a26] mb-10">{title}</h2>
        <p className="text-xl text-gray-600">{tCarousel.loading}</p>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-20 bg-[#f8f5f2]" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-4xl font-bold text-center mb-12 text-[#2d2a26]">
        {title}
      </h2>

      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={30}
        slidesPerView={4}
        loop={products.length > 4}
        navigation
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          reverseDirection: reverse || isRTL,
        }}
        dir={isRTL ? "rtl" : "ltr"}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="px-8"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <Link to={`/product/${product._id}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="overflow-hidden bg-gray-50">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-light mt-3 text-[#4c2a00]">
                    {product.price} DA
                  </p>
                  <button className="mt-5 w-full bg-black text-white py-3 rounded-xl hover:bg-[#6f5f4b] transition font-medium">
                    {tCarousel.viewDetails}
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ProductCarousel;
