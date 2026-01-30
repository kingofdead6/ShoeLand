// src/pages/admin/AdminCategories.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Trash2, X } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

export default function AdminCategories() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].adminCategories;
  const isRTL = lang === "ar";

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      toast.error(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return toast.error(t.errorRequired);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/categories`,
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, res.data]);
      setNewCategoryName("");
      setShowAddModal(false);
      toast.success(t.addedSuccess);
    } catch (err) {
      toast.error(err.response?.data?.message || t.errorGeneric);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(t.deleteConfirm.replace("{name}", name))) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter(cat => cat._id !== id));
      toast.success(t.deletedSuccess);
    } catch (err) {
      toast.error(err.response?.data?.message || t.errorGeneric);
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              {t.title}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light">
              {t.subtitle}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => setShowAddModal(true)}
              className="cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={24} />
              {t.addCategory}
            </button>

            <div className="relative flex-1">
              <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">{t.loading}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl sm:text-3xl text-gray-400 font-light mb-6">
                {searchTerm ? t.noResults : t.noCategories}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer text-lg text-black underline font-medium hover:text-gray-700 transition"
              >
                {t.addFirst}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category._id}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 tracking-wide">
                      {category.name}
                    </h3>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    className="cursor-pointer absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile-First Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 sm:p-8">
                  {/* Mobile pull indicator */}
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />

                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-extralight">{t.addCategory}</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  <form onSubmit={handleAddCategory} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.categoryName}
                      </label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={t.placeholder}
                        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={!newCategoryName.trim()}
                        className="cursor-pointer flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition"
                      >
                        {t.create}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="cursor-pointer flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
}