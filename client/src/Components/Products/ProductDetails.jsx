"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

const SimilarProductsGrid = ({ currentProductId, category }) => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].productDetail || {};
  const isRTL = lang === "ar";

  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!currentProductId || !category) return;

      try {
        // Now correctly calls the /similar endpoint with id and category
        const res = await axios.get(
  `${API_BASE_URL}/products/similar?id=${currentProductId}&category=${encodeURIComponent(category)}`
);

        const filtered = res.data.filter(p => 
          p.images.some(img => img.sizes.length > 0)
        );

        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setSimilarProducts(shuffled.slice(0, 6));
      } catch (err) {
        console.error("Failed to load similar products");
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-2xl aspect-square" />
        ))}
      </div>
    );
  }

  if (similarProducts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {similarProducts.map(p => (
        <Link key={p._id} to={`/product/${p._id}`} className="group block">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img
                src={p.images[0]?.url || "/placeholder.jpg"}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5 md:p-6 text-center space-y-3">
              <h3 className="font-medium text-base md:text-lg line-clamp-2">{p.name}</h3>
              <p className="text-xl md:text-2xl font-light text-gray-800">{p.price} DA</p>
              <button className="cursor-pointer w-full py-3 rounded-lg text-sm bg-[#efe5ce] font-semibold border border-gray-400 text-gray-800 hover:bg-black hover:text-white transition-all duration-300">
                {t.viewDetails || "View Details"}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default function ProductDetailsPage() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].productDetail || {};
  const isRTL = lang === "ar";
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showAddedPopup, setShowAddedPopup] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const handleCartAdded = () => {
      setShowAddedPopup(true);
      setTimeout(() => setShowAddedPopup(false), 2500);
    };
    window.addEventListener("cartAdded", handleCartAdded);
    return () => window.removeEventListener("cartAdded", handleCartAdded);
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${id}`);
      const prod = res.data;

      setProduct(prod);

      const firstWithSizes = prod.images.findIndex(img => img.sizes.length > 0);
      setSelectedImageIndex(firstWithSizes >= 0 ? firstWithSizes : 0);
    } catch (err) {
      toast.error(t.notFound || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-2xl font-light text-gray-600">{t.loading || "Loading..."}</p>
      </div>
    );
  }

  if (!product || product.images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-xl text-gray-700 text-center">{t.notFound || "Product not found"}</p>
      </div>
    );
  }

  const selectedImage = product.images[selectedImageIndex];
  const availableSizes = selectedImage?.sizes.map(s => s.size) || [];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error(t.selectSize || "Please select a size");
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      store: product.store,
      price: product.price,
      image: selectedImage.url,
      modelImageIndex: selectedImageIndex,
      size: selectedSize,
      quantity: quantity,
      addedAt: new Date().toISOString(),
    };

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(
      item =>
        item.productId === cartItem.productId &&
        item.modelImageIndex === cartItem.modelImageIndex &&
        item.size === cartItem.size
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new CustomEvent("cartAdded"));

    toast.success(t.addedToCart || "Added to cart!");
    setQuantity(1);
  };

  return (
    <>
      <div className="min-h-screen pt-20 pb-20" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition text-sm md:text-base">
            <ArrowLeft size={20} /> {t.backToShop || "Back to Shop"}
          </Link>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images Section */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                <img
                  src={selectedImage?.url || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 md:h-[600px] lg:h-[700px] object-cover"
                />
              </div>

              {/* Model Thumbnails - Horizontal Scroll on Mobile */}
              {product.images.length > 1 && (
                <div className="overflow-x-auto pb-2 -mx-6 px-6">
                  <div className="flex gap-3 md:gap-4 min-w-max">
                    {product.images.map((img, i) => {
                      const hasSizes = img.sizes.length > 0;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedImageIndex(i);
                            setSelectedSize("");
                          }}
                          disabled={!hasSizes}
                          className={`cursor-pointer flex shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-4 transition-all touch-manipulation ${
                            selectedImageIndex === i
                              ? "border-black shadow-xl scale-105"
                              : "border-gray-300 hover:border-gray-500"
                          } ${!hasSizes ? "opacity-50 grayscale" : ""}`}
                        >
                          <img
                            src={img.url}
                            alt={`Model ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                    
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info & Order */}
            <div className="space-y-8">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-widest text-gray-600 font-light">
                  {product.store }
                </p>
                { product.store == 'AB-Zone' 
                  ? <p className="text-sm md:text-sm uppercase tracking-widest text-gray-600 font-light">0676832233</p>
                  : product.store == 'Tchingo Mima 2'
                  ? <p className="text-sm md:text-sm uppercase tracking-widest text-gray-600 font-light">0666948812</p>
                  : <p className="text-sm md:text-sm uppercase tracking-widest text-gray-600 font-light">0670767455</p>
                }
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mt-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-2xl sm:text-3xl font-light mt-4">{product.price} DA</p>
                <div className="text-sm text-gray-600 mt-4 space-y-1">
                  <p>• {product.category}</p>
                </div>
              </div>

              {/* Model Selection Hint */}
              <div className=" rounded-xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">
                  {t.selectModel || "Select Model"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t.selectModelHint || "Tap a model image above to view available sizes"}
                </p>
              </div>

              {/* Sizes */}
              {availableSizes.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                    {t.size || "Size"}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`cursor-pointer py-3 md:py-4 border-2 rounded-xl text-sm md:text-base font-medium transition-all touch-manipulation ${
                          selectedSize === size
                            ? "bg-black text-white border-black"
                            : "border-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                  <p className="text-red-700 font-medium text-center">
                    {t.noSizesAvailable || "No sizes available for this model"}
                  </p>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  {t.quantity || "Quantity"}
                </h3>
                <div className="flex items-center justify-center gap-8 rounded-xl p-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="cursor-pointer w-12 h-12 rounded-full bg-white border-2 border-gray-400 hover:bg-gray-200 transition text-2xl font-light touch-manipulation"
                  >
                    −
                  </button>
                  <span className="text-3xl font-light w-20 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="cursor-pointer w-12 h-12 rounded-full bg-white border-2 border-gray-400 hover:bg-gray-200 transition text-2xl font-light touch-manipulation"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="cursor-pointer w-full py-5 md:py-6 bg-black text-white text-lg md:text-xl font-medium rounded-xl hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-xl touch-manipulation"
              >
                {selectedSize ? t.addToCart || "Add to Cart" : t.selectSizeFirst || "Select a Size First"}
              </button>
            </div>
          </div>

          {/* Similar Products */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-12 md:mb-16">
              {t.youMightLike || "You Might Also Like"}
            </h2>
            <SimilarProductsGrid currentProductId={product._id} category={product.category} />
          </div>
        </div>

        {/* Mobile "Added to Cart" Popup */}
        <div
          className={`fixed inset-x-4 bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 md:hidden ${
            showAddedPopup ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <div className="bg-black text-white px-5 py-4 rounded-3xl shadow-2xl flex items-center gap-4 pointer-events-auto">
            <svg className="w-10 h-10 flex shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <p className="font-bold text-sm">{t.addedToCart || "Added to Cart!"}</p>
              <p className="text-xs opacity-90 truncate">
                {product.name} • {selectedSize} × {quantity}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white">
              <img src={selectedImage?.url} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Desktop Popup (unchanged) */}
        <div
          className={`hidden md:block fixed inset-x-0 bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ${
            showAddedPopup ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <div className="bg-black text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-6 max-w-lg mx-auto pointer-events-auto">
            <svg className="w-14 h-14 flex shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-bold text-lg">{t.addedToCart || "Added to Cart!"}</p>
              <p className="opacity-90">
                {product.name} • Size {selectedSize} × {quantity}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img src={selectedImage?.url} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}