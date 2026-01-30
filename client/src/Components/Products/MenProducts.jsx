"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

const ALL_STORES = ['DDS.Piyou', 'AB-Zone', 'Tchingo Mima 2'];

export default function MenProductsPage() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].menPage || {};
  const f = translations[lang].filters || {};
  const isRTL = lang === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStore, setSelectedStore] = useState("DDS.Piyou"); // Default: DDS.Piyou
  const [selectedCategory, setSelectedCategory] = useState(t.allShoes || "All Categories");
  const [maxPrice, setMaxPrice] = useState(100000);

  const [availableStores, setAvailableStores] = useState([]);     // Only stores with products
  const [availableCategories, setAvailableCategories] = useState([]); // Only categories with products

  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const productsPerPage = 9;

  // Fetch men's & unisex products from featured
  useEffect(() => {
    const fetchMenProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/featured`);
        const allFeatured = res.data;

        // Filter for men & unisex products only
        const menProducts = allFeatured.filter(
          p => p.showOnProductsPage && (p.gender === "male" || p.gender === "unisex")
        );

        setProducts(menProducts);

        // Extract available stores & categories from men's products
        const uniqueStores = [...new Set(menProducts.map(p => p.store))].filter(Boolean);
        const uniqueCategories = [...new Set(menProducts.map(p => p.category))];

        setAvailableStores(uniqueStores);
        setAvailableCategories([
          { _id: "all", name: t.allShoes || "All Categories" },
          ...uniqueCategories.map(cat => ({ _id: cat, name: cat }))
        ]);

        // Set max price dynamically
        if (menProducts.length > 0) {
          const highest = Math.max(...menProducts.map(p => p.price));
          setMaxPrice(Math.ceil(highest / 1000) * 1000);
        }
      } catch (err) {
        toast.error(t.error || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchMenProducts();
  }, [lang, t.allShoes, t.error]);

  // Apply filters
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Store filter
    if (selectedStore && selectedStore !== "all") {
      filtered = filtered.filter(p => p.store === selectedStore);
    }

    // Category filter
    if (selectedCategory !== (t.allShoes || "All Categories")) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(p => p.price <= maxPrice);

    return filtered;
  }, [products, selectedStore, selectedCategory, maxPrice, t.allShoes]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const clearFilters = () => {
    setSelectedStore("DDS.Piyou");
    setSelectedCategory(t.allShoes || "All Categories");
    if (products.length > 0) {
      const highest = Math.max(...products.map(p => p.price));
      setMaxPrice(Math.ceil(highest / 1000) * 1000);
    }
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const hasActiveFilters =
    selectedStore !== "DDS.Piyou" ||
    selectedCategory !== (t.allShoes || "All Categories") ||
    maxPrice < 100000;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-light text-gray-700">{t.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20 pb-10" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900">{t.title || "Men's Collection"}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {filteredProducts.length} {t.items || "items"}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="max-w-7xl mx-auto px-6 mt-6 md:hidden">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="cursor-pointer w-full py-4 bg-white border border-black rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {f.title || "Filters"}
            {hasActiveFilters && (
              <span className="ml-2 px-2.5 py-1 text-xs bg-black text-white rounded-full font-medium">
                {[
                  selectedStore !== "DDS.Piyou",
                  selectedCategory !== (t.allShoes || "All Categories"),
                  maxPrice < 100000
                ].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="flex gap-8 lg:gap-16">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-[300px] shrink-0 space-y-10 py-4">
              {/* Store Filter */}
              {availableStores.length > 1 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-widest uppercase border-b border-black pb-3">
                    {f.store || "Store"}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {availableStores.map(store => (
                      <li key={store}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="store"
                            checked={selectedStore === store}
                            onChange={() => setSelectedStore(store)}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="group-hover:underline underline-offset-4">
                            {store}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Filter */}
              {availableCategories.length > 1 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-widest uppercase border-b border-black pb-3">
                    {f.category || "Category"}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {availableCategories.map(cat => (
                      <li key={cat._id}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === cat.name}
                            onChange={() => setSelectedCategory(cat.name)}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="group-hover:underline underline-offset-4">
                            {cat.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

        

              <button
                onClick={clearFilters}
                className="cursor-pointer w-full py-3 border border-black hover:bg-black hover:text-white transition rounded font-medium"
              >
                {f.clearAll || "Clear All Filters"}
              </button>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {displayedProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-2xl md:text-3xl font-light text-gray-600">
                    {t.noProducts || "No products found"}
                  </p>
                  <button onClick={clearFilters} className="cursor-pointer mt-6 text-black underline text-lg">
                    {t.viewAll || "View all products"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                    {displayedProducts.map(product => (
                      <div
                        key={product._id}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link to={`/product/${product._id}`} className="cursor-pointer block relative">
                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            <img
                              src={product.images[0]?.url || "/placeholder.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        </Link>

                        <div className="p-4 sm:p-6 flex flex-col gap-2">
                          <h3 className="text-sm sm:text-lg font-light text-gray-600 leading-tight line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xl sm:text-2xl font-light tracking-wide text-gray-800">
                            {product.price.toLocaleString()} DA
                          </p>
                          <Link to={`/product/${product._id}`} className="cursor-pointer mt-2">
                            <button className="cursor-pointer w-full py-3 rounded-lg text-sm bg-[#efe5ce] font-semibold border border-gray-400 text-gray-800 hover:bg-black hover:text-white transition-all duration-300">
                              {t.viewDetails || "View Details"}
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-3 mt-12 flex-wrap">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="cursor-pointer px-5 py-3 border border-black disabled:opacity-40 hover:bg-black hover:text-white transition rounded"
                      >
                        {f.previous || "Previous"}
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          onClick={() => setCurrentPage(n)}
                          className={`cursor-pointer w-10 h-10 rounded-full text-sm font-medium transition
                            ${n === currentPage ? "bg-black text-white" : "hover:bg-gray-200"}
                          `}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer px-5 py-3 border border-black disabled:opacity-40 hover:bg-black hover:text-white transition rounded"
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsFilterOpen(false)} />

            <div className="fixed inset-x-0 bottom-0 z-50">
              <div className="bg-white rounded-t-3xl shadow-2xl max-h-[88vh] overflow-y-auto">
                <div className="flex justify-center pt-5 pb-2">
                  <div className="w-14 h-1.5 bg-gray-300 rounded-full" />
                </div>

                <div className="p-6 pb-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-medium">{f.title || "Filters"}</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-10">
                    {/* Store Filter - Mobile */}
                    {availableStores.length > 1 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-800">
                          {f.store || "Store"}
                        </h3>
                        <div className="relative">
                          <select
                            value={selectedStore}
                            onChange={e => setSelectedStore(e.target.value)}
                            className="w-full appearance-none bg-white border-2 border-black rounded-xl px-5 py-4 text-base font-medium focus:outline-none"
                          >
                            {availableStores.map(store => (
                              <option key={store} value={store}>{store}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Filter - Mobile */}
                    {availableCategories.length > 1 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-800">
                          {f.category || "Category"}
                        </h3>
                        <div className="relative">
                          <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full appearance-none bg-white border-2 border-black rounded-xl px-5 py-4 text-base font-medium focus:outline-none"
                          >
                            {availableCategories.map(cat => (
                              <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

               

                    <button
                      onClick={clearFilters}
                      className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition shadow-lg mt-8"
                    >
                      {f.clearAll || "Clear All Filters"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}