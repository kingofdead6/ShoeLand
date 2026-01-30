"use client";

import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";
import { X } from "lucide-react";


// Beautiful status colors with borders
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
  in_delivery: "bg-purple-100 text-purple-800 border border-purple-300",
  reached: "bg-green-100 text-green-800 border border-green-300",
  canceled: "bg-red-100 text-red-800 border border-red-300",
};

export default function AdminOrders() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].adminOrders;
  const isRTL = lang === "ar";

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (selectedStore !== "all") {
      result = result.filter(o => o.store === selectedStore);
    }

    if (selectedStatus !== "all") {
      result = result.filter(o => o.status === selectedStatus);
    }

    if (sortBy === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_high")
      result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));

    setFiltered(result);
  }, [orders, selectedStore, selectedStatus, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error(t.errorGeneric || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    if (order.status === newStatus) return;

    // Optimistic update
    setOrders(prev =>
      prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.order) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? res.data.order : o))
        );
        // Update selected order if modal is open
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data.order);
        }
      }

      toast.success(t.statusUpdated || "Statut mis à jour !");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(t.updateFailed || "Échec de la mise à jour");
      fetchOrders(); // rollback
    }
  };

  // Get the next logical status
  const getNextStatus = (current) => {
    if (current === "pending") return "confirmed";
    if (current === "confirmed") return "in_delivery";
    if (current === "in_delivery") return "reached";
    return null;
  };

  // Get label for next action
  const getNextActionLabel = (current) => {
    if (current === "pending") return t.actions?.confirm || "Confirmer";
    if (current === "confirmed") return t.actions?.inDelivery || "Mettre en livraison";
    if (current === "in_delivery") return t.actions?.delivered || "Livrée";
    return "Terminé";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">{t.loading || "Chargement..."}</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8 px-4 mt-14"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
            {t.title}
          </h1>
          <p className="mt-3 text-lg text-gray-600 font-light">{t.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-center items-center">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedStore("all")}
              className={`cursor-pointer px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                selectedStore === "all" ? "bg-black text-white" : "bg-white shadow hover:shadow-lg"
              }`}
            >
              {t.allOrders}
            </button>
           
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-xl focus:border-black outline-none bg-white text-sm font-medium"
            >
              <option value="all">{t.allOrders}</option>
              <option value="pending">{t.status?.pending}</option>
              <option value="confirmed">{t.status?.confirmed}</option>
              <option value="in_delivery">{t.status?.in_delivery}</option>
              <option value="reached">{t.status?.reached}</option>
              <option value="canceled">{t.status?.canceled}</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-xl focus:border-black outline-none bg-white text-sm font-medium"
            >
              <option value="newest">{t.newestFirst}</option>
              <option value="oldest">{t.oldestFirst}</option>
              <option value="price_high">{t.priceHighToLow}</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500 font-light">{t.noOrders}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(order => {
              const nextStatus = getNextStatus(order.status);

              return (
                <motion.article
                  key={order._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-xs opacity-80">#{order._id.slice(-6).toUpperCase()}</p>
                        <h3 className="text-lg font-bold truncate">{order.customerName}</h3>
                        <p className="text-sm opacity-90">{order.phone}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                        {t.status[order.status]}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                      <div><strong>{t.wilaya}:</strong> {order.wilaya}</div>
                      {order.address && (
                        <div className="col-span-2 text-xs text-gray-600">
                          <strong>{t.address}:</strong> {order.address}
                        </div>
                      )}
                      <div>
                        <strong>{t.items}:</strong>{" "}
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} {t.pieces}
                      </div>
                    
                    </div>

                  
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 border-t bg-gray-50">
                    {order.status === "canceled" ? (
                      <button disabled className="w-full py-4 rounded-lg font-bold text-white bg-red-600 opacity-90">
                        {t.status.canceled}
                      </button>
                    ) : order.status === "reached" ? (
                      <button disabled className="w-full py-4 rounded-lg font-bold text-white bg-green-600 opacity-90">
                        {t.status.reached}
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextStatus && updateStatus(order._id, nextStatus);
                          }}
                          disabled={!nextStatus}
                          className={`cursor-pointer py-3 rounded-lg font-medium text-sm transition-all ${
                            !nextStatus
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          {getNextActionLabel(order.status)}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order._id, "canceled");
                          }}
                          className="cursor-pointer py-3 rounded-lg font-medium text-sm bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 transition-all"
                        >
                          {t.actions?.cancel || "Annuler"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-extralight">
                    {t.orderId} #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="cursor-pointer p-3 hover:bg-gray-100 rounded-full transition"
                  >
                    <X size={28} />
                  </button>
                </div>

                {/* Customer & Delivery Info */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                 <div>
  <h3 className="text-xl font-bold mb-4">{t.customer}</h3>
  <div className="space-y-3 text-gray-700">
    <p><strong>{t.customer}:</strong> {selectedOrder.customerName}</p>
    <p><strong>{t.phone}:</strong> {selectedOrder.phone}</p>
    {selectedOrder.customerEmail && (
      <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
    )}
    <p><strong>{t.wilaya}:</strong> {selectedOrder.wilaya}</p>
    {selectedOrder.address && (
      <p><strong>{t.address}:</strong> {selectedOrder.address}</p>
    )}
    {selectedOrder.desk && (
      <p><strong>{t.desk || "Desk"}:</strong> {selectedOrder.desk}</p>
    )}
    <p>
      <strong>{t.deliveryType}:</strong>{" "}
      {selectedOrder.deliveryType === "home" ? "Livraison à domicile" : "Livraison à bureau"}
    </p>
  </div>
</div>


                  <div>
                    <h3 className="text-xl font-bold mb-4">{t.status.title || "Statut & Prix"}</h3>
                    <div className="space-y-4">
                      <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${STATUS_COLORS[selectedOrder.status]}`}>
                        {t.status[selectedOrder.status]}
                      </div>
                     
                        <div className="space-y-2">
                          <p><strong>{t.subtotal}:</strong> {selectedOrder.subtotal} DA</p>
                          <p><strong>{t.deliveryPrice}:</strong> {selectedOrder.deliveryPrice} DA</p>
                          <p className="text-2xl font-bold">
                            <strong>{t.total}:</strong> {selectedOrder.totalPrice} DA
                          </p>
                        </div>
                      
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div>
                  <h3 className="text-xl font-bold mb-6">{t.items}</h3>
                  <div className="space-y-6">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-6 bg-gray-50 p-6 rounded-2xl">
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-xl shadow"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          <p className="text-gray-600">{t.size}: {item.size}</p>
                          <p className="text-gray-600">{t.price}: {item.price} DA</p>
                          <p className="font-semibold mt-2">{t.quantity}: {item.quantity}</p>
                          <p className="font-bold text-xl mt-3">
                            {t.subtotal}: {item.price * item.quantity} DA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                <div className="mt-10 pt-8 border-t flex gap-4">
                  {selectedOrder.status !== "canceled" && selectedOrder.status !== "reached" && (
                    <>
                      <button
                        onClick={() => {
                          const next = getNextStatus(selectedOrder.status);
                          if (next) updateStatus(selectedOrder._id, next);
                        }}
                        className="cursor-pointer flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800"
                      >
                        {getNextActionLabel(selectedOrder.status)}
                      </button>
                      <button
                        onClick={() => updateStatus(selectedOrder._id, "canceled")}
                        className="cursor-pointer flex-1 py-4 bg-white border-2 border-red-600 text-red-600 rounded-2xl font-bold hover:bg-red-50"
                      >
                        {t.actions?.cancel || "Annuler la commande"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}