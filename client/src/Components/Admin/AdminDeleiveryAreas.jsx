import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, Home, Package } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function AdminDeliveryAreas() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang]?.adminDeliveryAreas || {};
  const isRTL = lang === "ar";

  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    wilaya: "",
    priceHome: 600,
    priceDesk: 700,
    desks: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/delivery-areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAreas(res.data.areas || []);
      setFilteredAreas(res.data.areas || []);
      setSearchTerm("");
    } catch (err) {
      toast.error(t.errorGeneric || "Failed to load delivery areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = areas.filter((a) =>
      a.wilaya.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAreas(filtered);
  }, [areas, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.wilaya.trim()) return toast.error(t.errorWilayaRequired || "Wilaya is required");

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const payload = {
        wilaya: form.wilaya.trim(),
        priceHome: Number(form.priceHome),
        priceDesk: Number(form.priceDesk),
        desks: form.desks
          .map((d) => ({ name: d.name.trim() }))
          .filter((d) => d.name),
      };

      if (editingId) {
        // Update – only changeable fields
        await axios.put(`${API_BASE_URL}/delivery-areas/${editingId}`, {
          priceHome: payload.priceHome,
          priceDesk: payload.priceDesk,
          desks: payload.desks,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.updatedSuccess || "Updated successfully");
      } else {
        // Create – wilaya is required here
        await axios.post(`${API_BASE_URL}/delivery-areas`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.addedSuccess?.replace("{wilaya}", form.wilaya) || `Added ${form.wilaya}`);
      }

      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || t.errorGeneric || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ wilaya: "", priceHome: 600, priceDesk: 700, desks: [] });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (area) => {
    setEditingId(area.id);
    setForm({
      wilaya: area.wilaya,
      priceHome: area.priceHome,
      priceDesk: area.priceDesk,
      desks: area.desks?.map((d) => ({ id: Date.now() + Math.random(), name: d.name })) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm || "Delete this wilaya?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/delivery-areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t.deletedSuccess || "Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(t.errorGeneric || "Delete failed");
    }
  };

  return (
    <motion.section className="min-h-screen py-8 px-4 sm:py-12 mt-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-wider text-gray-900">
            {t.title || "Manage Delivery Areas"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-3">
            {t.subtitle || "Add, edit and manage delivery prices and desks"}
          </p>
        </div>

        {/* Add + Search */}
        <div className="flex flex-col sm:flex-row gap-5 mb-12">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="cursor-pointer flex items-center justify-center gap-3 px-8 py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg flex-shrink-0"
          >
            <Plus size={28} /> {t.addWilaya || "Add Wilaya"}
          </button>

          <div className="relative flex-1">
            <Search size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder || "Search by wilaya name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-5 border border-gray-300 rounded-2xl focus:border-black outline-none text-lg transition"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-24 text-2xl text-gray-600 animate-pulse">
            {t.loading || "Loading..."}
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl sm:text-3xl text-gray-500 font-light leading-relaxed">
              {t.noWilayas || "No delivery areas found"}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 text-xl underline text-amber-800 hover:text-amber-700 transition"
            >
              {t.addFirstWilaya || "Add the first wilaya"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAreas.map((area) => (
              <motion.div
                key={area.id}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                onClick={() => handleEdit(area)}
              >
                <div className="p-6 sm:p-8 space-y-6 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{area.wilaya}</h3>

                  <div className="space-y-5 mt-4">
                    <div className="flex items-center justify-center gap-4 text-xl">
                      <Home size={28} className="text-green-600" />
                      <span className="font-bold">{area.priceHome.toLocaleString()} DA</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xl">
                      <Package size={28} className="text-blue-600" />
                      <span className="font-bold">{area.priceDesk.toLocaleString()} DA</span>
                    </div>

                    {area.desks?.length > 0 && (
                      <div className="text-left mt-5 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-3">Delivery desks:</p>
                        <ul className="list-disc list-inside text-base text-gray-700 space-y-2 pl-5">
                          {area.desks.map((d, idx) => (
                            <li key={idx}>{d.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(area.id);
                    }}
                    className="w-full py-4 mt-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 size={20} /> {t.delete || "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal – Add / Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
          >
            <motion.div
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto w-full max-w-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />
                <h2 className="text-2xl sm:text-3xl font-light text-center mb-8">
                  {editingId ? t.editWilaya || "Edit Wilaya" : t.addNewWilaya || "Add New Wilaya"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {!editingId && (
                    <input
                      type="text"
                      placeholder={t.wilayaPlaceholder || "Wilaya name (e.g. Alger, Oran...)"}
                      value={form.wilaya}
                      onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                      required
                      className="w-full px-6 py-5 border border-gray-300 rounded-xl text-lg focus:border-black outline-none transition"
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-medium mb-2">
                        {t.homeDelivery || "Home Delivery Price (DA)"}
                      </label>
                      <input
                        type="number"
                        value={form.priceHome}
                        onChange={(e) => setForm({ ...form, priceHome: +e.target.value })}
                        min="0"
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl text-xl focus:border-black outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">
                        {t.deskDelivery || "Desk Delivery Price (DA)"}
                      </label>
                      <input
                        type="number"
                        value={form.priceDesk}
                        onChange={(e) => setForm({ ...form, priceDesk: +e.target.value })}
                        min="0"
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl text-xl focus:border-black outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-base font-medium">
                      {t.desksLabel || "Delivery Desks (optional)"}
                    </label>

                    {form.desks.map((desk) => (
                      <div key={desk.id} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={desk.name}
                          onChange={(e) => {
                            const newDesks = form.desks.map((d) =>
                              d.id === desk.id ? { ...d, name: e.target.value } : d
                            );
                            setForm({ ...form, desks: newDesks });
                          }}
                          placeholder={t.extraDesk || "Desk name / location"}
                          className="flex-1 px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              desks: form.desks.filter((d) => d.id !== desk.id),
                            })
                          }
                          className="p-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          desks: [...form.desks, { id: Date.now() + Math.random(), name: "" }],
                        })
                      }
                      className="w-full py-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-600 hover:border-gray-600 hover:bg-gray-50 transition"
                    >
                      + {t.addDesk || "Add Desk"}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-5 rounded-xl font-bold text-lg transition ${
                        loading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-900 active:scale-[0.98]"
                      }`}
                    >
                      {loading
                        ? t.saving || "Saving..."
                        : editingId
                        ? t.update || "Update"
                        : t.save || "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-5 border-2 border-gray-400 rounded-xl font-bold hover:bg-gray-50 transition text-lg"
                    >
                      {t.cancel || "Cancel"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}