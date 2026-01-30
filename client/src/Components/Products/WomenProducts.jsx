"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function WomenProductsPage() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].womenPage || {};
  const f = translations[lang].filters || {};
  const isRTL = lang === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(t.allShoes || "All Categories");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const productsPerPage = 9;

  // Fetch only women's & unisex featured products
  useEffect(() => {
    const fetchWomenProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/featured`);
        const allFeatured = res.data;

        // Filter for women & unisex + showOnProductsPage
        const womenProducts = allFeatured.filter(
          (p) => p.showOnProductsPage && (p.gender === "female" || p.gender === "unisex")
        );

        setProducts(womenProducts);

        // Extract unique categories
        const uniqueCategories = [...new Set(womenProducts.map((p) => p.category).filter(Boolean))];

        setAvailableCategories([
          { _id: "all", name: t.allShoes || "All Categories" },
          ...uniqueCategories.map((name) => ({ _id: name, name })),
        ]);
      } catch (err) {
        toast.error(t.error || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchWomenProducts();
  }, [lang]);

  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    if (selectedCategory !== (t.allShoes || "All Categories")) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    return filtered;
  }, [products, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const clearFilters = () => {
    setSelectedCategory(t.allShoes || "All Categories");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = selectedCategory !== (t.allShoes || "All Categories");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl font-light text-amber-800/80 animate-pulse tracking-wide">
          {t.loading || "Loading collection..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-30 pb-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-950">
          {t.title || "Women's Collection"}
        </h1>
        <p className="mt-4 text-xl text-stone-600">
          {filteredProducts.length} {t.items || "pieces"}
        </p>
      </div>

      {/* Mobile Filter Button */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mt-8 md:hidden">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full py-4 bg-white border border-stone-200 rounded-xl font-medium flex items-center justify-center gap-2.5 hover:border-amber-600/60 hover:shadow-md transition-all"
        >
          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h18M3 12h18M3 20h18" />
            <circle cx="9" cy="12" r="2" fill="currentColor" />
          </svg>
          {f.title || "Filters"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mt-12">
        <div className="flex gap-12 xl:gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 lg:w-80 shrink-0 space-y-12">
            {availableCategories.length > 1 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-5">
                  {f.category || "Category"}
                </h3>
                <div className="space-y-3">
                  {availableCategories.map((cat) => (
                    <label
                      key={cat._id}
                      className={`flex items-center gap-3 cursor-pointer text-base transition-all duration-200 ${
                        selectedCategory === cat.name
                          ? "text-amber-800 font-medium"
                          : "text-stone-600 hover:text-stone-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.name}
                        onChange={() => {
                          setSelectedCategory(cat.name);
                          setCurrentPage(1);
                        }}
                        className="w-4.5 h-4.5 accent-amber-700"
                      />
                      <span className="tracking-wide">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3.5 mt-6 bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {f.clearAll || "Clear Filters"}
              </button>
            )}
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {displayedProducts.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-3xl font-light text-stone-500">
                  {t.noProducts || "No products found"}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-8 text-amber-800 underline text-xl hover:text-amber-700 transition"
                >
                  {t.viewFullCollection || "View full collection"}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {displayedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-500/50 transition-all duration-400 hover:shadow-xl hover:shadow-amber-100/30"
                    >
                      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || "/placeholder.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </Link>

                      <div className="p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-light text-stone-800 line-clamp-2 min-h-[1.8em] leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xl sm:text-2xl font-medium text-amber-700 tracking-wide">
                          {product.price.toLocaleString()} DA
                        </p>

                        <Link to={`/product/${product._id}`}>
                          <button className="cursor-pointer mt-4 w-full py-3.5 bg-stone-900 hover:bg-amber-800 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                            {t.viewDetails || "View Details"}
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-3 mt-16 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 bg-white border border-stone-300 text-stone-700 rounded-xl disabled:opacity-50 hover:border-stone-400 transition"
                    >
                      {f.previous || "Previous"}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`w-11 h-11 rounded-xl text-sm font-medium transition-all ${
                          n === currentPage
                            ? "bg-amber-700 text-white shadow-md"
                            : "bg-white border border-stone-200 text-stone-700 hover:border-amber-500 hover:text-amber-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 bg-white border border-stone-300 text-stone-700 rounded-xl disabled:opacity-50 hover:border-stone-400 transition"
                    >
                      {f.next || "Next"}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsFilterOpen(false)} />

          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[82vh] overflow-y-auto shadow-2xl border-t border-stone-200">
            <div className="p-6 pb-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-semibold text-stone-900">{f.title || "Filters"}</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-3 hover:bg-stone-100 rounded-full transition">
                  <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-12">
                {availableCategories.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-5">
                      {f.category || "Category"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setCurrentPage(1);
                          }}
                          className={`py-3.5 px-5 rounded-2xl text-sm font-medium transition-all border ${
                            selectedCategory === cat.name
                              ? "bg-amber-700 border-amber-600 text-white shadow-md"
                              : "bg-white border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-800"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    clearFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full py-4 bg-stone-900 hover:bg-amber-800 text-white rounded-2xl font-medium transition shadow-md"
                >
                  {f.clearAll || "Clear All Filters"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}