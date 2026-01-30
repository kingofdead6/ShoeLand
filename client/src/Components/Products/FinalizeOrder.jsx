import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function FinalizeOrder() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].checkout || {};
  const isRTL = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [currentStore, setCurrentStore] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [availableWilayas, setAvailableWilayas] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New success state

  const selectedStoreFromCart = location.state?.selectedStore;

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    wilaya: "",
    desk: "",
    address: "",
    deliveryType: "desk",
    customerEmail: "",
  });

  // Load Cart and Store Data
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart || savedCart === "[]") {
      if (!isSuccess) {
        toast.error(t.emptyCart || "Your cart is empty");
        navigate("/cart");
      }
      return;
    }

    const items = JSON.parse(savedCart);
    const grouped = items.reduce((acc, item) => {
      const store = item.store || "Unknown";
      if (!acc[store]) acc[store] = [];
      acc[store].push(item);
      return acc;
    }, {});

    const stores = Object.keys(grouped);

    if (stores.length === 0) {
      navigate("/cart");
      return;
    }

    if (stores.length > 1) {
      if (!selectedStoreFromCart || !grouped[selectedStoreFromCart]) {
        toast.info(t.selectOneStore || "Please select one store to proceed");
        navigate("/cart");
        return;
      }
      setCurrentStore(selectedStoreFromCart);
      setStoreItems(grouped[selectedStoreFromCart]);
    } else {
      setCurrentStore(stores[0]);
      setStoreItems(grouped[stores[0]]);
    }
    setCartItems(items);
  }, [navigate, t, isSuccess, selectedStoreFromCart]);

  // Fetch Delivery Areas
  useEffect(() => {
    if (!currentStore) return;

    const fetchWilayas = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/delivery-areas?store=${encodeURIComponent(currentStore)}`
        );
        const { areas } = res.data;
        const filtered = areas
          .filter(a => a.desks || a.priceHome > 0 || a.priceDesk > 0)
          .map(a => ({
            wilaya: a.wilaya,
            priceHome: a.priceHome,
            priceDesk: a.priceDesk,
            desks: a.desks || []
          }))
          .sort((a, b) => a.wilaya.localeCompare(b.wilaya));

        setAvailableWilayas(filtered);
      } catch (err) {
        toast.error(t.noDeliveryError || "Failed to load delivery areas");
        setAvailableWilayas([]);
      }
    };

    fetchWilayas();
  }, [currentStore, t]);

  // Handle Delivery Pricing
  useEffect(() => {
    if (form.wilaya && availableWilayas.length > 0) {
      const selected = availableWilayas.find(w => w.wilaya === form.wilaya);
      if (selected) {
        setDeliveryPrice(form.deliveryType === "home" ? selected.priceHome : selected.priceDesk);
      }
    } else {
      setDeliveryPrice(null);
    }
  }, [form.wilaya, form.deliveryType, availableWilayas]);

  const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithDelivery = deliveryPrice !== null ? subtotal + deliveryPrice : null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (storeItems.length === 0 || loading) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/orders/create`, {
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim() || null,
        phone: form.phone.trim(),
        wilaya: form.wilaya,
        address: form.deliveryType === "home" ? form.address.trim() : null,
        desk: form.deliveryType === "desk" ? form.desk : null,
        deliveryType: form.deliveryType,
        store: currentStore,
        deliveryPrice,
        items: storeItems,
      });

      // Manage Cart Updates
      const remainingCart = cartItems.filter(item => item.store !== currentStore);
      if (remainingCart.length > 0) {
        localStorage.setItem("cart", JSON.stringify(remainingCart));
        toast.success(t.orderPlacedOneStore || "Order placed! Items from other stores remain.");
      } else {
        localStorage.removeItem("cart");
        toast.success(t.orderPlaced || "Order placed successfully!");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      
      // Trigger Success Screen
      setIsSuccess(true);

      // Redirect after 5 seconds to let them see the confirmation
      setTimeout(() => {
        if (remainingCart.length > 0) {
          navigate("/cart");
        } else {
          navigate("/products");
        }
      }, 5000);

    } catch (err) {
      toast.error(err.response?.data?.message || t.orderFailed || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const desks = form.wilaya ? (availableWilayas.find(w => w.wilaya === form.wilaya)?.desks || []) : [];

  // SUCCESS VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 " dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-2xl w-full text-center border border-gray-100">
          <CheckCircle className="w-28 h-28 md:w-36 md:h-36 mx-auto text-green-600 mb-8 animate-bounce-short" />
          <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
            {t.successTitle || "Order Placed!"}
          </h1>
          <div 
            className="text-lg md:text-xl text-gray-700 leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{
              __html: (t.successMessage || "Your order from <strong>{store}</strong> has been placed.<br/>We will contact you soon.")
                .replace("{store}", `<strong>${currentStore}</strong>`)
            }}
          />
          {cartItems.filter(i => i.store !== currentStore).length > 0 && (
            <p className="mt-8 text-lg text-orange-600 font-medium">
              {t.remainingItems || "You still have items from other stores in your cart."}
            </p>
          )}
          <p className="text-gray-400 mt-10 text-lg flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
            {t.redirecting || "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // LOADING VIEW
  if (!currentStore && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600 animate-pulse">{t.loading || "Loading..."}</p>
      </div>
    );
  }

  // MAIN FORM VIEW
  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-20 px-6 " dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-gray-700 hover:text-black transition">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t.title || "Finalize Order"} — {currentStore}
          </h1>
        </div>

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black shadow-2xl p-5 md:hidden z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">{t.total}</p>
              <p className="text-2xl font-bold">
                {totalWithDelivery ? totalWithDelivery.toLocaleString() : subtotal.toLocaleString()} DA
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.wilaya || (form.deliveryType === "desk" && desks.length > 0 && !form.desk)}
              className="px-10 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 disabled:bg-gray-400 transition"
            >
              {loading ? t.placingOrder : t.orderNow}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-7">
              <input
                type="text"
                placeholder={t.fullName || "Full Name"}
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                required
                className="w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition bg-gray-50 focus:bg-white"
              />

              <input
                type="tel"
                placeholder={t.phone || "Phone Number"}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition bg-gray-50 focus:bg-white"
              />

              <div>
                <label className="block text-lg font-bold mb-3">
                  {t.wilayaLabel?.replace("{store}", currentStore) || `Delivery Wilaya (${currentStore})`}
                </label>
                {availableWilayas.length === 0 ? (
                  <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-600 font-semibold text-lg">
                      {t.noDelivery?.replace("{store}", currentStore) || `No delivery available `}
                    </p>
                  </div>
                ) : (
                  <select
                    value={form.wilaya}
                    onChange={e => setForm({ ...form, wilaya: e.target.value, desk: "" })}
                    required
                    className="cursor-pointer w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition bg-gray-50"
                  >
                    <option value="">{t.chooseWilaya || "Choose Wilaya"}</option>
                    {availableWilayas.map(w => (
                      <option key={w.wilaya} value={w.wilaya}>{w.wilaya}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <p className="text-lg font-bold mb-5">{t.deliveryType || "Delivery Type"}</p>
                <div className="grid grid-cols-2 gap-4">
                  {["desk", "home"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, deliveryType: type, desk: "" })}
                      className={`cursor-pointer py-6 rounded-2xl border-4 text-xl font-bold transition-all ${
                        form.deliveryType === type
                          ? "bg-black text-white border-black shadow-lg"
                          : "border-gray-100 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {type === "home" ? (t.home || "Home") : (t.desk || "Desk")}
                    </button>
                  ))}
                </div>
              </div>

              {form.deliveryType === "desk" && desks.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-lg font-bold mb-3">{t.selectDesk || "Select Delivery Desk"}</label>
                  <select
                    value={form.desk}
                    onChange={e => setForm({ ...form, desk: e.target.value })}
                    required
                    className="cursor-pointer w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition bg-gray-50"
                  >
                    <option value="">{t.chooseDesk || "Choose a desk"}</option>
                    {desks.map((desk, idx) => (
                      <option key={idx} value={desk.name}>{desk.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.deliveryType === "home" && (
                <textarea
                  placeholder={t.addressPlaceholder || "Full address (street, building, floor...)"}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none resize-none transition bg-gray-50 focus:bg-white"
                />
              )}
{/*
              <input
                type="email"
                placeholder={t.email || "Email (optional)"}
                value={form.customerEmail}
                onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full px-6 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition bg-gray-50 focus:bg-white"
              />
              */}
              <button
                type="submit"
                disabled={loading || !form.wilaya || (form.deliveryType === "desk" && desks.length > 0 && !form.desk)}
                className={`hidden md:block w-full py-6 text-2xl font-bold rounded-2xl transition shadow-xl
                  ${loading || !form.wilaya || (form.deliveryType === "desk" && desks.length > 0 && !form.desk)
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-black text-white hover:bg-gray-900 cursor-pointer active:scale-[0.98]"
                  }`}
              >
                {loading ? t.placingOrder || "Placing Order..." : t.orderNow || "Place Order"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8">{t.orderSummary || "Order Summary"}</h2>
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {storeItems.map((item, i) => (
                <div key={i} className="flex gap-5 pb-6 border-b border-gray-50 last:border-0 items-center">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg line-clamp-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm">Size: <strong>{item.size}</strong> × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-xl">{(item.price * item.quantity).toLocaleString()} DA</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t-2 border-gray-100 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-gray-500">{t.subtotal || "Subtotal"}</span>
                <span className="font-semibold">{subtotal.toLocaleString()} DA</span>
              </div>
              {deliveryPrice !== null && (
                <div className="flex justify-between text-green-600 font-bold text-lg">
                  <span>{t.delivery || "Delivery"} ({form.wilaya})</span>
                  <span>{deliveryPrice} DA</span>
                </div>
              )}
              {totalWithDelivery !== null && (
                <div className="flex justify-between text-3xl font-bold pt-6 border-t-2 border-gray-100">
                  <span>{t.total || "Total"}</span>
                  <span className="text-black">{totalWithDelivery.toLocaleString()} DA</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}