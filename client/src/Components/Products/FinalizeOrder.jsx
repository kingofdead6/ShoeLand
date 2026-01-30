import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const [cartItems, setCartItems] = useState([]);
  const [availableWilayas, setAvailableWilayas] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    wilaya: "",
    desk: "",
    address: "",
    deliveryType: "desk",
    customerEmail: "",
  });

  // Load cart (all items)
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
    setCartItems(items);
  }, [navigate, t, isSuccess]);

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/delivery-areas`); // ← adjust endpoint if needed
        const { areas } = res.data;

        const filtered = areas
          .filter((a) => a.desks || a.priceHome > 0 || a.priceDesk > 0)
          .map((a) => ({
            wilaya: a.wilaya,
            priceHome: a.priceHome,
            priceDesk: a.priceDesk,
            desks: a.desks || [],
          }))
          .sort((a, b) => a.wilaya.localeCompare(b.wilaya));

        setAvailableWilayas(filtered);
      } catch (err) {
        toast.error(t.noDeliveryError || "Failed to load delivery areas");
        setAvailableWilayas([]);
      }
    };

    fetchWilayas();
  }, [t]);

  // Calculate delivery price
  useEffect(() => {
    if (form.wilaya && availableWilayas.length > 0) {
      const selected = availableWilayas.find((w) => w.wilaya === form.wilaya);
      if (selected) {
        setDeliveryPrice(
          form.deliveryType === "home" ? selected.priceHome : selected.priceDesk
        );
      }
    } else {
      setDeliveryPrice(null);
    }
  }, [form.wilaya, form.deliveryType, availableWilayas]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithDelivery = deliveryPrice !== null ? subtotal + deliveryPrice : null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0 || loading) return;

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
        deliveryPrice,
        items: cartItems,
      });

      // Clear entire cart after successful order
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(t.orderPlaced || "Order placed successfully!");
      setIsSuccess(true);

      // Redirect after delay
      setTimeout(() => {
        navigate("/products");
      }, 4500);
    } catch (err) {
      toast.error(err.response?.data?.message || t.orderFailed || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const desks = form.wilaya
    ? availableWilayas.find((w) => w.wilaya === form.wilaya)?.desks || []
    : [];

  // ────────────────────────────────────────────────
  //                SUCCESS SCREEN
  // ────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-5 sm:px-8 py-12"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-2xl w-full text-center border border-stone-100">
          <CheckCircle className="w-28 h-28 md:w-36 md:h-36 mx-auto text-green-600 mb-8 animate-bounce-short" />
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-950 mb-6">
            {t.successTitle || "Order Placed!"}
          </h1>
          <p className="text-lg md:text-xl text-stone-700 leading-relaxed">
            {t.successMessage ||
              "Your order has been successfully placed.<br/>We will contact you shortly."}
          </p>
          <p className="mt-10 text-lg text-stone-500 flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin"></span>
            {t.redirecting || "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  //                LOADING / MAIN FORM
  // ────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-light text-stone-600 animate-pulse">
          {t.loading || "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-24 px-5 sm:px-8 lg:px-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/cart" className="text-stone-600 hover:text-amber-800 transition">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-stone-950">
            {t.title || "Finalize Your Order"}
          </h1>
        </div>

        {/* Mobile sticky total + button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-2xl p-4 md:hidden z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-stone-600">{t.total}</p>
              <p className="text-2xl font-medium text-amber-700">
                {totalWithDelivery ? totalWithDelivery.toLocaleString() : subtotal.toLocaleString()} DA
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !form.wilaya ||
                (form.deliveryType === "desk" && desks.length > 0 && !form.desk)
              }
              className="px-8 py-4 bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? t.placingOrder : t.orderNow}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 lg:p-9">
              <form onSubmit={handleSubmit} className="space-y-7">
                <input
                  type="text"
                  placeholder={t.fullName || "Full Name"}
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                  className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none transition bg-white"
                />

                <input
                  type="tel"
                  placeholder={t.phone || "Phone Number"}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none transition bg-white"
                />

                <div>
                  <label className="block text-base font-medium text-stone-700 mb-3">
                    {t.wilayaLabel || "Delivery Wilaya"}
                  </label>
                  {availableWilayas.length === 0 ? (
                    <div className="text-center py-10 bg-amber-50/50 rounded-xl border border-amber-100">
                      <p className="text-amber-800 font-medium">
                        {t.noDelivery || "No delivery areas available at the moment"}
                      </p>
                    </div>
                  ) : (
                    <select
                      value={form.wilaya}
                      onChange={(e) => setForm({ ...form, wilaya: e.target.value, desk: "" })}
                      required
                      className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none transition bg-white cursor-pointer"
                    >
                      <option value="">{t.chooseWilaya || "Select Wilaya"}</option>
                      {availableWilayas.map((w) => (
                        <option key={w.wilaya} value={w.wilaya}>
                          {w.wilaya}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <p className="text-base font-medium text-stone-700 mb-4">{t.deliveryType || "Delivery Type"}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["desk", "home"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, deliveryType: type, desk: "" })}
                        className={`py-5 rounded-xl border-2 text-base font-medium transition-all ${
                          form.deliveryType === type
                            ? "bg-amber-700 border-amber-700 text-white shadow-md"
                            : "border-stone-200 hover:border-amber-500 text-stone-700"
                        }`}
                      >
                        {type === "home" ? t.home || "Home Delivery" : t.desk || "Desk Delivery"}
                      </button>
                    ))}
                  </div>
                </div>

                {form.deliveryType === "desk" && desks.length > 0 && (
                  <div>
                    <label className="block text-base font-medium text-stone-700 mb-3">
                      {t.selectDesk || "Select Delivery Desk"}
                    </label>
                    <select
                      value={form.desk}
                      onChange={(e) => setForm({ ...form, desk: e.target.value })}
                      required
                      className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none transition bg-white cursor-pointer"
                    >
                      <option value="">{t.chooseDesk || "Choose a desk"}</option>
                      {desks.map((desk, idx) => (
                        <option key={idx} value={desk.name}>
                          {desk.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.deliveryType === "home" && (
                  <textarea
                    placeholder={t.addressPlaceholder || "Full address (street, building, floor...)"}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none resize-none transition bg-white"
                  />
                )}

                {/* Optional email – uncomment if needed */}
                {/* <input
                  type="email"
                  placeholder={t.email || "Email (optional)"}
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full px-6 py-5 text-lg border border-stone-200 rounded-xl focus:border-amber-500 outline-none transition bg-white"
                /> */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !form.wilaya ||
                    (form.deliveryType === "desk" && desks.length > 0 && !form.desk)
                  }
                  className={`w-full py-6 text-xl font-medium rounded-xl transition-all shadow-sm
                    ${
                      loading || !form.wilaya || (form.deliveryType === "desk" && desks.length > 0 && !form.desk)
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-stone-900 hover:bg-amber-800 text-white hover:shadow-md active:scale-[0.98]"
                    }`}
                >
                  {loading ? t.placingOrder || "Placing Order..." : t.orderNow || "Place Order"}
                </button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 lg:p-9 sticky top-24">
              <h2 className="text-2xl font-light tracking-tight text-stone-950 mb-8">
                {t.orderSummary || "Order Summary"}
              </h2>

              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-5 pb-5 border-b border-stone-100 last:border-0 last:pb-0 items-center"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-stone-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-light text-stone-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-sm text-stone-600 mt-1">
                        {t.size || "Size"}: <strong>{item.size}</strong> × {item.quantity}
                      </p>
                    </div>
                    <span className="text-lg font-medium text-amber-700 whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()} DA
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-stone-200 space-y-5 text-lg">
                <div className="flex justify-between text-stone-700">
                  <span>{t.subtotal || "Subtotal"}</span>
                  <span className="font-medium">{subtotal.toLocaleString()} DA</span>
                </div>

                {deliveryPrice !== null && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>
                      {t.delivery || "Delivery"} {form.wilaya ? `(${form.wilaya})` : ""}
                    </span>
                    <span>{deliveryPrice.toLocaleString()} DA</span>
                  </div>
                )}

                {totalWithDelivery !== null && (
                  <div className="flex justify-between text-2xl font-medium pt-5 border-t border-stone-200">
                    <span>{t.total || "Total"}</span>
                    <span className="text-amber-700">{totalWithDelivery.toLocaleString()} DA</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}