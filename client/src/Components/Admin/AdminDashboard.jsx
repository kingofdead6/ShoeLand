// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function AdminDashboard() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].adminDashboard;
  const isRTL = lang === "ar";
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const titleRef = useRef(null);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error(t.loginRequired);
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
          setUserType(decoded.usertype);
        } else {
          toast.error(t.unauthorized);
          navigate("/login");
        }
      } catch (error) {
        toast.error(t.invalidToken);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    toast.success(t.logoutSuccess);
    navigate("/login");
  };

  const adminSections = [
    { path: "/admin/orders", title: t.manageOrders, description: t.manageOrdersDesc },
    { path: "/admin/products", title: t.manageProducts, description: t.manageProductsDesc },
  ];

  const superadminSections = [
    ...adminSections,
    { path: "/admin/users", title: t.manageUsers, description: t.manageUsersDesc },
    { path: "/admin/categories", title: t.manageCategories, description: t.manageCategoriesDesc },
    { path: "/admin/delivery-areas", title: t.manageDeliveryAreas, description: t.manageDeliveryAreasDesc },
  ];

  const sections = userType === "superadmin" ? superadminSections : adminSections;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-light text-gray-600">{t.loading}</p>
      </div>
    );
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="min-h-screen py-20 pt-32 "
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.h1
              ref={titleRef}
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-6xl font-extralight tracking-widest text-gray-900"
            >
              {userType === "superadmin" ? t.welcomeSuperAdmin : t.welcomeAdmin}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xl text-gray-600 font-light"
            >
              DDS.PIYOU — لوحة التحكم
            </motion.p>
          </div>

          {/* Dashboard Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group"
              >
                <Link to={section.path}>
                  <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-400 h-full flex flex-col justify-between border border-gray-100">
                    <div>
                      <h2 className="text-3xl font-medium text-gray-900 group-hover:text-black transition-colors">
                        {section.title}
                      </h2>
                      <p className="mt-5 text-gray-600 font-light leading-relaxed text-lg">
                        {section.description}
                      </p>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <span className="inline-flex items-center text-lg font-semibold text-gray-600 group-hover:text-black transition-all">
                        {t.manage}
                        <svg className={`w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform ${isRTL ? "mr-3 ml-0 rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Logout Button */}
          <div className="mt-24 text-center">
            <button
              onClick={handleLogout}
              className="cursor-pointer px-12 py-5 bg-red-600 text-white text-xl font-medium rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </motion.section>
    </>
  );
}