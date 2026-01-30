import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Trash2, Home, Package, Store } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

const STORES = ["DDS.Piyou", "AB-Zone", "Tchingo Mima 2"];
const STORE_COMPANIES = {
  "DDS.Piyou": "zr-Express",
  "AB-Zone": "zr-Express",
  "Tchingo Mima 2": "yalidine",
};

export default function AdminDeliveryAreas() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].adminDeliveryAreas;
  const isRTL = lang === "ar";

  const [activeStore, setActiveStore] = useState("DDS.Piyou");
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
  }, [activeStore]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/delivery-areas?store=${activeStore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAreas(res.data.areas || []);
      setFilteredAreas(res.data.areas || []);
      setSearchTerm("");
    } catch (err) {
      toast.error(t.errorGeneric);
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
    if (!form.wilaya.trim()) return toast.error(t.errorWilayaRequired);

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const payload = {
        priceHome: Number(form.priceHome),
        priceDesk: Number(form.priceDesk),
        desks: form.desks.map(d => ({ name: d.name.trim() })).filter(d => d.name), 
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/delivery-areas/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.updatedSuccess);
      } else {
        // For creation, send wilaya + store + company + prices + desks
        await axios.post(`${API_BASE_URL}/delivery-areas`, {
          wilaya: form.wilaya.trim(),
          store: activeStore,
          priceHome: Number(form.priceHome),
          priceDesk: Number(form.priceDesk),
          desks: form.desks.map(d => ({ name: d.name.trim() })).filter(d => d.name),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.addedSuccess.replace("{wilaya}", form.wilaya));
      }

      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || t.errorGeneric);
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
      desks: area.desks?.map(d => ({ id: Date.now() + Math.random(), name: d.name })) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/delivery-areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t.deletedSuccess);
      fetchData();
    } catch (err) {
      toast.error(t.errorGeneric);
    }
  };

  return (
    <motion.section className="min-h-screen py-8 px-4 sm:py-12 mt-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-wider text-gray-900">{t.title}</h1>
          <p className="text-lg sm:text-xl text-gray-600">{t.subtitle}</p>
        </div>

        {/* Store Selector + Company */}
        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-6 mb-10 scrollbar-hide snap-x snap-mandatory md:justify-center md:flex-wrap">
          {STORES.map((store) => (
            <div key={store} className="flex flex-col items-center">
              <button
                onClick={() => setActiveStore(store)}
                className={`cursor-pointer shrink-0 snap-center flex items-center gap-3 px-6 py-5 rounded-2xl shadow-lg transition-all transform hover:scale-105 min-w-[200px] sm:min-w-0 ${
                  activeStore === store ? "bg-black text-white" : "bg-white text-gray-900"
                }`}
              >
                <Store size={32} />
                <span className="text-lg sm:text-xl font-bold">{store}</span>
              </button>
              <span className="text-sm text-gray-500 mt-1">
                 {STORE_COMPANIES[store]}
              </span>
            </div>
          ))}
        </div>

        {/* Add / Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="cursor-pointer flex items-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg"
          >
            <Plus size={28} /> {t.addWilaya}
          </button>
          <div className="relative flex-1 min-w-0">
            <Search size={24} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-black outline-none text-lg"
            />
          </div>
        </div>

        {/* Wilayas Grid */}
        {loading ? (
          <div className="text-center py-20 text-2xl text-gray-600">{t.loading}</div>
        ) : filteredAreas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl sm:text-3xl text-gray-500 font-light leading-relaxed">{t.noWilayas}</p>
            <button onClick={() => setShowModal(true)} className="cursor-pointer mt-8 text-lg sm:text-xl underline">{t.addFirstWilaya}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAreas.map(area => (
              <motion.div key={area.id} whileTap={{ scale: 0.98 }} whileHover={{ y: -8 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden group cursor-pointer" onClick={() => handleEdit(area)}>
                <div className="p-6 sm:p-8 space-y-6 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold">{area.wilaya}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4 text-lg sm:text-xl">
                      <Home size={28} className="text-green-600" />
                      <span className="font-bold">{area.priceHome} DA</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-lg sm:text-xl">
                      <Package size={28} className="text-blue-600" />
                      <span className="font-bold">{area.priceDesk} DA</span>
                    </div>
                    {area.desks && area.desks.length > 0 && (
                      <div className="text-left mt-3">
                        <ul className="list-disc list-inside">
                          {area.desks.map((d, idx) => <li key={idx}>{d.name}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }} className="cursor-pointer w-full py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 font-bold text-lg">
                    <Trash2 size={24} /> {t.delete}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm}>
            <motion.div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={(e) => e.stopPropagation()}>
              <div className="p-6 sm:p-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />
                <h2 className="text-2xl sm:text-3xl font-extralight text-center mb-8">
                  {editingId ? t.editWilaya : t.addNewWilaya}
                  <br className="sm:hidden" />
                  <span className="text-lg sm:text-xl text-gray-600 font-light block mt-2">{activeStore} → {STORE_COMPANIES[activeStore]}</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    placeholder={t.wilayaPlaceholder}
                    value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                    required
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl text-lg focus:border-black outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-medium mb-2">{t.homeDelivery}</label>
                      <input
                        type="number"
                        value={form.priceHome}
                        onChange={(e) => setForm({ ...form, priceHome: +e.target.value })}
                        className="w-full px-5 py-4 border-2 rounded-xl text-xl focus:border-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium mb-2">{t.deskDelivery}</label>
                      <input
                        type="number"
                        value={form.priceDesk}
                        onChange={(e) => setForm({ ...form, priceDesk: +e.target.value })}
                        className="w-full px-5 py-4 border-2 rounded-xl text-xl focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  {/* Extra Desks */}
                  <div className="mt-4 space-y-3">
                    {form.desks.map(desk => (
                      <div key={desk.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={desk.name}
                          onChange={(e) => {
                            const newDesks = form.desks.map(d => d.id === desk.id ? { ...d, name: e.target.value } : d);
                            setForm({ ...form, desks: newDesks });
                          }}
                          placeholder={t.extraDesk}
                          className="cursor-pointer flex-1 px-4 py-3 border-2 rounded-xl focus:border-black outline-none text-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, desks: form.desks.filter(d => d.id !== desk.id) })}
                          className="cursor-pointer px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                        >
                           <Trash2 size={24} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, desks: [...form.desks, { id: Date.now() + Math.random(), name: "" }] })}
                      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 cursor-pointer transition font-medium"
                    >
                      + {t.addDesk}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button type="submit" disabled={loading} className="cursor-pointer flex-1 py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 disabled:bg-gray-500 transition text-xl">{loading ? t.saving : editingId ? t.update : t.save}</button>
                    <button type="button" onClick={resetForm} className="cursor-pointer flex-1 py-5 border-2 border-gray-400 rounded-2xl font-bold hover:bg-gray-50 transition text-xl">{t.cancel}</button>
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
