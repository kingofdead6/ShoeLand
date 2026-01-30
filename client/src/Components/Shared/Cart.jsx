"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function CartPage() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].cart || {};
  const isRTL = lang === "ar";

  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (productId, modelImageIndex, size, change) => {
    setCartItems(prev =>
      prev.map(item => {
        if (
          item.productId === productId &&
          item.modelImageIndex === modelImageIndex &&
          item.size === size
        ) {
          const newQty = item.quantity + change;
          return newQty >= 1 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity >= 1)
    );
  };

  const removeItem = (productId, modelImageIndex, size) => {
    setCartItems(prev =>
      prev.filter(
        item =>
          !(
            item.productId === productId &&
            item.modelImageIndex === modelImageIndex &&
            item.size === size
          )
      )
    );
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-5 sm:px-8 lg:px-12 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-800 mb-10 text-lg font-light tracking-wide transition-colors"
        >
          <ArrowLeft size={22} />
          {t.backToShop || "Back to Collection"}
        </Link>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-950 mb-10">
          {t.emptyCart || "Your cart is empty"}
        </h1>

        <Link
          to="/products"
          className="inline-block px-10 py-4 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          {t.continueShopping || "Continue Shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-24" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/products" className="cursor-pointer text-stone-600 hover:text-amber-800 transition">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-stone-950">
            {t.yourCart || "Your Cart"} ({cartItems.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <div
                key={`${item.productId}-${item.modelImageIndex}-${item.size}`}
                className="group bg-white rounded-2xl border border-stone-100 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 sm:p-6">
                  <Link to={`/product/${item.productId}`} className="shrink-0">
                    <div className="w-full sm:w-32 aspect-square overflow-hidden rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 space-y-5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-light text-stone-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-base text-stone-600 mt-1.5">
                        {t.size || "Size"}: <span className="font-medium text-stone-800">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.modelImageIndex, item.size, -1)}
                        className="cursor-pointer w-11 h-11 rounded-xl border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-700 transition text-2xl flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-xl font-medium w-12 text-center text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.modelImageIndex, item.size, 1)}
                        className="cursor-pointer w-11 h-11 rounded-xl border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-700 transition text-2xl flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xl sm:text-2xl font-medium text-amber-700 tracking-wide">
                        {(item.price * item.quantity).toLocaleString()} DA
                      </p>
                      <button
                        onClick={() => removeItem(item.productId, item.modelImageIndex, item.size)}
                        className="cursor-pointer text-sm text-stone-500 hover:text-amber-800 transition underline"
                      >
                        {t.remove || "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 lg:p-8 sticky top-24">
              <h3 className="text-2xl font-light tracking-tight text-stone-950 mb-8">
                {t.orderSummary || "Order Summary"}
              </h3>

              <div className="space-y-6 text-lg">
                <div className="flex justify-between text-stone-700">
                  <span>{t.subtotal || "Subtotal"}</span>
                  <span className="font-medium">{subtotal.toLocaleString()} DA</span>
                </div>
                <div className="pt-6 border-t border-stone-200">
                  <div className="flex justify-between text-2xl font-medium text-stone-950">
                    <span>{t.total || "Total"}</span>
                    <span className="text-amber-700">{subtotal.toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block mt-10">
                <button className="cursor-pointer w-full py-5 bg-stone-900 hover:bg-amber-800 text-white text-lg font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                  {t.proceedToCheckout || "Proceed to Checkout"}
                </button>
              </Link>

              <Link
                to="/products"
                className="cursor-pointer block text-center mt-6 text-stone-600 hover:text-amber-800 transition text-base font-light"
              >
                {t.continueShopping || "Continue Shopping"}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-2xl p-4 md:hidden z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">{t.total || "Total"}</p>
              <p className="text-2xl font-medium text-amber-700">
                {subtotal.toLocaleString()} DA
              </p>
            </div>
            <Link to="/checkout">
              <button className="px-8 py-4 bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-medium transition shadow-sm">
                {t.checkout || "Checkout"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}