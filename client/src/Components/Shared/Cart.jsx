// src/pages/CartPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function CartPage() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].cart || {};
  const isRTL = lang === "ar";
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedStore, setSelectedStore] = useState(""); // Must be a specific store

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);

      // Extract unique stores
      const stores = [...new Set(items.map(item => item.store || "Unknown Store"))];
      setCartItems(items);

      // Auto-select if only one store
      if (stores.length === 1) {
        setSelectedStore(stores[0]);
      }
      // If multiple, leave empty so user must choose
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

  // Group items by store
  const itemsByStore = cartItems.reduce((acc, item) => {
    const store = item.store || "Unknown Store";
    if (!acc[store]) acc[store] = [];
    acc[store].push(item);
    return acc;
  }, {});

  const stores = Object.keys(itemsByStore);

  // Only show items from selected store
  const displayedItems = selectedStore ? itemsByStore[selectedStore] || [] : [];
  const subtotal = displayedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = displayedItems.reduce((sum, item) => sum + item.quantity, 0);

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
      })
    );
  };

  const removeItem = (productId, modelImageIndex, size) => {
    setCartItems(prev =>
      prev.filter(
        item =>
          !(item.productId === productId &&
            item.modelImageIndex === modelImageIndex &&
            item.size === size)
      )
    );
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 text-center " dir={isRTL ? "rtl" : "ltr"}>
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-700 hover:text-black mb-8 text-lg">
          <ArrowLeft size={22} /> {t.backToShop || "Back to Shop"}
        </Link>
        <h1 className="text-4xl md:text-5xl font-light mb-10 text-gray-900">
          {t.emptyCart || "Your cart is empty"}
        </h1>
        <Link
          to="/products"
          className="inline-block px-8 py-4 bg-black text-white rounded-xl text-lg font-medium hover:bg-gray-900 transition"
        >
          {t.continueShopping || "Continue Shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen  pt-30 pb-32 md:pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/products" className="text-gray-700 hover:text-black">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t.yourCart || "Your Cart"} ({cartItems.length} {cartItems.length === 1 ? t.item : t.items})
          </h1>
        </div>

        {/* Store Selection - REQUIRED */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t.selectStoreToProceed || "Select a store to proceed to checkout"}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
            {stores.map(store => (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`cursor-pointer px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex shrink-0 ${
                  selectedStore === store
                    ? "bg-black text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 hover:border-black"
                }`}
              >
                {store} ({itemsByStore[store].length} {itemsByStore[store].length === 1 ? t.item : t.items})
              </button>
            ))}
          </div>
        </div>

        {/* Show selected store items */}
        {selectedStore ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t.shoppingFrom || "Shopping from"}: <span className="text-[#4c2a00]">{selectedStore}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {displayedItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.modelImageIndex}-${item.size}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col sm:flex-row sm:items-center gap-6 p-6 hover:shadow-xl transition-shadow"
                  >
                    <Link to={`/product/${item.productId}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full sm:w-32 sm:h-32 h-48 object-cover rounded-xl hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{item.name}</h2>
                        <p className="text-gray-600 mt-2 text-sm">
                          {t.size}: <span className="font-medium">{item.size}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateQuantity(item.productId, item.modelImageIndex, item.size, -1)}
                          className="cursor-pointer w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition text-2xl font-light"
                        >
                          −
                        </button>
                        <span className="text-xl font-bold w-16 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.modelImageIndex, item.size, +1)}
                          className="cursor-pointer w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition text-2xl font-light"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex justify-between items-end sm:items-center">
                        <p className="text-2xl font-bold text-[#2d2a26]">
                          {(item.price * item.quantity).toLocaleString()} DA
                        </p>
                        <button
                          onClick={() => removeItem(item.productId, item.modelImageIndex, item.size)}
                          className="cursor-pointer text-red-600 hover:text-red-700 font-medium text-sm underline"
                        >
                          {t.remove || "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-24 lg:top-8">
                  <h3 className="text-2xl font-bold mb-6">{t.orderSummary || "Order Summary"}</h3>

                  <div className="space-y-5 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.subtotal || "Subtotal"}</span>
                      <span className="font-semibold">{subtotal.toLocaleString()} DA</span>
                    </div>

                    <div className="pt-5 border-t-2 border-gray-200">
                      <div className="flex justify-between text-2xl font-bold">
                        <span>{t.total || "Total"}</span>
                        <span>{subtotal.toLocaleString()} DA</span>
                      </div>
                    </div>
                  </div>
                   <Link
                     to="/checkout"
                     state={{ selectedStore }}
                   >
                   
                                     <button
                     className="cursor-pointer w-full mt-8 py-5 bg-black text-white text-xl font-medium rounded-xl hover:bg-gray-900 transition shadow-lg"
                   >
                     {t.proceedToCheckout || "Proceed to Checkout"}
                   </button>
                   </Link>


                  <Link
                    to="/products"
                    className="block text-center mt-5 text-gray-600 hover:text-black underline font-medium"
                  >
                    {t.continueShopping || "Continue Shopping"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Checkout */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 md:hidden z-40">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t.total || "Total"}</p>
                  <p className="text-2xl font-bold">{subtotal.toLocaleString()} DA</p>
                </div>
                <Link to="/checkout">
                  <button className="px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-900 transition">
                    {t.checkout || "Checkout"}
                  </button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          // No store selected yet
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 mb-8">
              {t.pleaseSelectStore || "Please select a store above to view your items and proceed to checkout"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}