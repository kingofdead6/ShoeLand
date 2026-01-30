import { useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function Hero() {
  const { lang } = useContext(LanguageContext);
  const textRef = useRef(null);

  const currentLang = translations[lang] ? lang : "fr";
  const isRTL = lang === "ar";

  // ✅ Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const slides = (translations[currentLang].hero.slides || []).map((slide, index) => ({
    ...slide,
    image: [
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1763723292/20251121_1205_Urban_Sneaker_Scene_simple_compose_01kak1akxmexe852vy960cq568_uzqxnu.png",
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1763722004/20251121_1145_Sleek_Urban_Sneakers_simple_compose_01kak08x72etqb9n66kcmgvyfj_proj2d.png",
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1763722303/20251121_1149_Urban_Fashion_Motion_simple_compose_01kak0bm1vf9kaf5nvk19bw3p4_qygsrt.png",
    ][index],
    link: index === 1 ? "/products/men" : index === 2 ? "/products/women" : undefined,
  }));

  useEffect(() => {
    gsap.fromTo(
      textRef.current,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out",
      }
    );
  }, [lang]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <Carousel
        autoPlay
        infiniteLoop
        interval={5000}
        showThumbs={false}
        showStatus={false}
        showArrows={true}      // ✅ always show arrows
        transitionTime={900}
        swipeable={false}      // ❌ disable swipe everywhere
        emulateTouch={false}   // ❌ disable touch dragging
        stopOnHover={false}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative min-h-screen w-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div
              className="relative z-10 flex h-full min-h-screen items-center px-6 md:px-20"
              style={{
                justifyContent: isRTL ? "flex-end" : "flex-start",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              <div
                ref={textRef}
                className={`max-w-xl text-white ${isRTL ? "text-right" : "text-left"}`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-6xl font-bold leading-tight"
                  style={{ fontFamily: isRTL ? "'Tajawal', 'Cairo', sans-serif" : "inherit" }}
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mt-4 text-lg md:text-xl text-gray-200"
                >
                  {slide.subtitle}
                </motion.p>

                {slide.button && slide.link && (
                  <motion.a
                    href={slide.link}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block mt-8 bg-white text-black px-8 py-3 text-sm font-semibold uppercase tracking-wide rounded-full shadow-lg hover:bg-gray-200 transition"
                  >
                    {slide.button}
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
