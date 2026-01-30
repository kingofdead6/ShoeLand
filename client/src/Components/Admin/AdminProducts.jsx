"use client";

import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, X, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../../../translations";

const MAX_IMAGES = 100;
const STORES = ['DDS.Piyou', 'AB-Zone', 'Tchingo Mima 2']; 

export default function AdminProducts() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang].adminProducts;
  const isRTL = lang === "ar";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState("");

  const [form, setForm] = useState({
    name: "", category: "", price: "", gender: "unisex",
    store: "",
    images: [], // {preview: string, file?: File, url?: string, sizes: string[]}
    showOnProductsPage: false, showOnTrendingPage: false,
    showOnBestOffersPage: false,
  });

  const [newSizeInputs, setNewSizeInputs] = useState({});

  const [selectedImageIndices, setSelectedImageIndices] = useState([]);
  const [assignSizes, setAssignSizes] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const inputs = {};
    form.images.forEach((_, idx) => {
      if (!(idx in newSizeInputs)) {
        inputs[idx] = "";
      }
    });
    setNewSizeInputs(prev => ({ ...prev, ...inputs }));
  }, [form.images]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/products`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
    } catch (err) {
      toast.error(t.errorGeneric || "Error loading products");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesStore = !selectedStore || p.store === selectedStore;

    return matchesSearch && matchesCategory && matchesStore;
  });

  setFilteredProducts(filtered);
}, [products, searchTerm, selectedCategory, selectedStore]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.category) return toast.error("Category is required");
    if (!form.price || form.price < 0) return toast.error("Valid price is required");
    if (!form.store) return toast.error("Store is required");

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("gender", form.gender);
    formData.append("store", form.store);
    ["showOnProductsPage", "showOnTrendingPage", "showOnBestOffersPage"].forEach(key => {
      formData.append(key, form[key]);
    });

    const newImages = form.images.filter(img => img.file);
    newImages.forEach(img => formData.append("images", img.file));
    const newImageSizes = newImages.map(img => img.sizes);
    formData.append("imageSizes", JSON.stringify(newImageSizes));

    if (editingId) {
      const kept = form.images.filter(img => img.url).map(img => ({ url: img.url, sizes: img.sizes }));
      formData.append("keptImages", JSON.stringify(kept));
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (editingId) {
        await axios.put(`${API_BASE_URL}/products/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/products`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Product created successfully");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "", category: "", price: "", gender: "unisex",
      store: "",
      images: [],
      showOnProductsPage: false, showOnTrendingPage: false,
      showOnBestOffersPage: false,
    });
    setNewSizeInputs({});
    setSelectedImageIndices([]);
    setAssignSizes("");
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      gender: product.gender || "unisex",
      store: product.store,
      images: product.images.map(img => ({
        url: img.url,
        preview: img.url,
        sizes: img.sizes.map(s => s.size), 
      })),
      showOnProductsPage: !!product.showOnProductsPage,
      showOnTrendingPage: !!product.showOnTrendingPage,
      showOnBestOffersPage: !!product.showOnBestOffersPage,
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (id, field) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const endpoints = {
        showOnProductsPage: "toggle-products-page",
        showOnTrendingPage: "toggle-trending-page",
        showOnBestOffersPage: "toggle-best-offers-page",
      };

      const res = await axios.patch(
        `${API_BASE_URL}/products/${id}/${endpoints[field]}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(prev => prev.map(p => p._id === id ? res.data : p));
      setSelectedProduct(prev => prev?._id === id ? res.data : prev);
      toast.success("Visibility updated");
    } catch (err) {
      toast.error("Error updating visibility");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Error deleting product");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + form.images.length > MAX_IMAGES) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }
    const newImgs = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      sizes: [],
    }));
    setForm({ ...form, images: [...form.images, ...newImgs] });
  };

  const removeImage = (idx) => {
    const updated = [...form.images];
    updated.splice(idx, 1);
    setForm({ ...form, images: updated });
    setSelectedImageIndices(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));

    const newInputs = { ...newSizeInputs };
    delete newInputs[idx];
    const reindexed = {};
    Object.keys(newInputs).forEach(key => {
      const k = parseInt(key);
      reindexed[k > idx ? k - 1 : k] = newInputs[key];
    });
    setNewSizeInputs(reindexed);
  };

  const addSizeToImage = (idx) => {
    const size = (newSizeInputs[idx] || "").trim();
    if (!size) return toast.error("Size cannot be empty");
    const updatedImages = [...form.images];
    if (!updatedImages[idx].sizes.includes(size)) {
      updatedImages[idx].sizes = [...updatedImages[idx].sizes, size];
      setForm({ ...form, images: updatedImages });
    }
    setNewSizeInputs(prev => ({ ...prev, [idx]: "" }));
  };

  const removeSizeFromImage = (imgIdx, sizeIdx) => {
    const updatedImages = [...form.images];
    updatedImages[imgIdx].sizes.splice(sizeIdx, 1);
    setForm({ ...form, images: updatedImages });
  };

  const toggleImageSelect = (idx) => {
    setSelectedImageIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const selectAllImages = () => {
    setSelectedImageIndices(form.images.map((_, i) => i));
  };

  const deselectAllImages = () => {
    setSelectedImageIndices([]);
  };

  const applySizesToSelected = () => {
    const sizesStr = assignSizes.trim();
    if (!sizesStr) return;
    const newSizes = sizesStr.split(",").map(s => s.trim()).filter(s => s);
    if (newSizes.length === 0) return;

    const updatedImages = [...form.images];
    selectedImageIndices.forEach(i => {
      const existing = new Set(updatedImages[i].sizes);
      newSizes.forEach(s => existing.add(s));
      updatedImages[i].sizes = Array.from(existing);
    });
    setForm({ ...form, images: updatedImages });
    setAssignSizes("");
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header & Controls same as before */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              {t.title || "Admin Products"}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={24} /> {t.addProduct || "Add Product"}
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || "Search products..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
                />
              </div>
              <select
  value={selectedStore}
  onChange={(e) => setSelectedStore(e.target.value)}
  className="px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-base font-medium"
>
  <option value="">{t.allStores || "All Stores"}</option>
  {STORES.map(store => (
    <option key={store} value={store}>{store}</option>
  ))}
</select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-base font-medium"
              >
                <option value="">{t.allCategories || "All Categories"}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20 text-2xl text-gray-500">{t.loading}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl sm:text-3xl text-gray-400 font-light mb-6">No products found</p>
              <button onClick={() => setShowModal(true)} className="cursor-pointer text-lg text-black underline font-medium">
                Add your first product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map(product => (
                <motion.div
                  key={product._id}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden cursor-pointer transition-all"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{product.category}</p>
                    <p className="text-lg font-semibold mt-2">{product.price} DA</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedProduct && (
            <Modal onClose={() => setSelectedProduct(null)} title={selectedProduct.name}>
              <div className="space-y-8">
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <img
                          src={img.url}
                          alt={`Image ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg mb-3"
                        />
                        <p className="text-sm font-medium">{t.size}:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {img.sizes.length > 0 ? (
                            img.sizes.map((s, i) => (
                              <span key={i} className="bg-gray-200 px-3 py-1 rounded-full text-xs">
                                {s.size}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">No sizes added</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div><p className="text-sm text-gray-600">{t.category}</p><p className="text-xl font-bold">{selectedProduct.category}</p></div>
                    <div><p className="text-sm text-gray-600">{t.gender}</p><p className="text-xl font-bold capitalize">{selectedProduct.gender}</p></div>
                    <div><p className="text-sm text-gray-600">{t.price}</p><p className="text-3xl font-light">{selectedProduct.price} DA</p></div>
                    <div><p className="text-sm text-gray-600">{t.store}</p><p className="text-xl font-bold">{selectedProduct.store}</p></div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <button
                        onClick={() => { handleEdit(selectedProduct); setSelectedProduct(null); }}
                        className="cursor-pointer flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 flex items-center justify-center gap-2"
                      >
                        <Edit size={20} />{t.editProduct}
                      </button>
                      <button
                        onClick={() => { handleDelete(selectedProduct._id); setSelectedProduct(null); }}
                        className="cursor-pointer flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={20} /> {t.deleteProduct}
                      </button>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                      {[
  { field: "showOnProductsPage", key: "showOnProductsPage" },
  { field: "showOnTrendingPage", key: "showOnTrendingPage" },
  { field: "showOnBestOffersPage", key: "showOnBestOffersPage" },
].map(({ field, key }) => (
  <button
    key={field}
    onClick={() => handleToggleVisibility(selectedProduct._id, field)}
    className={`cursor-pointer w-full py-4 px-4 rounded-xl font-medium flex items-center justify-between ${
      selectedProduct[field]
        ? "bg-black text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    <span>{t[key]}</span>
    {selectedProduct[field] ? <Eye size={24} /> : <EyeOff size={24} />}
  </button>
))}
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Add/Edit Modal - unchanged except existing sizes are now visible */}
       <AnimatePresence>
  {showModal && (
    <Modal 
      onClose={resetForm} 
      title={editingId ? t.editProduct : t.addProduct}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label={t.productName} 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            required 
          />
          <Select 
            label={t.category} 
            value={form.category} 
            onChange={e => setForm({ ...form, category: e.target.value })} 
            required
          >
            <option value="">{t.selectCategory || "Sélectionner une catégorie"}</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </Select>
          <Input 
            label={`${t.price} (DA)`} 
            type="number" 
            value={form.price} 
            onChange={e => setForm({ ...form, price: e.target.value })} 
            required 
            min="0" 
          />
          <Select 
            label={t.gender} 
            value={form.gender} 
            onChange={e => setForm({ ...form, gender: e.target.value })}
          >
            <option value="unisex">{t.unisex}</option>
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </Select>
          <Select 
            label={t.store} 
            value={form.store} 
            onChange={e => setForm({ ...form, store: e.target.value })} 
            required
          >
            <option value="">{t.selectStore || "Sélectionner un magasin"}</option>
            {STORES.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </Select>
        </div>

        {/* Visibility checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "showOnProductsPage", translationKey: "showOnProductsPage" },
            { key: "showOnTrendingPage", translationKey: "showOnTrendingPage" },
            { key: "showOnBestOffersPage", translationKey: "showOnBestOffersPage" },
          ].map(({ key, translationKey }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form[key]} 
                onChange={e => setForm({ ...form, [key]: e.target.checked })} 
                className="w-6 h-6 rounded accent-black" 
              />
              <span className="text-sm font-medium">{t[translationKey]}</span>
            </label>
          ))}
        </div>

        {/* Images Section */}
        <div>
          <p className="text-sm font-medium mb-3">
            {t.images} ({form.images.length}/{MAX_IMAGES})
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-black file:text-white"
          />

          <div className="space-y-6 mt-6">
            {form.images.map((img, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedImageIndices.includes(idx)}
                    onChange={() => toggleImageSelect(idx)}
                    className="mt-2"
                  />
                  <img 
                    src={img.preview || img.url} 
                    alt={`Preview ${idx + 1}`} 
                    className="w-32 h-32 object-cover rounded-xl shadow" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)} 
                    className="cursor-pointer text-red-600 mt-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">{t.sizesForImage}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {img.sizes.map((size, sIdx) => (
                      <div key={sIdx} className="bg-gray-200 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        {size}
                        <button 
                          type="button" 
                          onClick={() => removeSizeFromImage(idx, sIdx)} 
                          className="text-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {img.sizes.length === 0 && (
                      <span className="text-gray-500 text-xs">{t.noSizesYet}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.enterSizePlaceholder}
                      value={newSizeInputs[idx] || ""}
                      onChange={e => setNewSizeInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                      className="flex-1 px-4 py-3 border rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => addSizeToImage(idx)}
                      className="cursor-pointer px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800"
                    >
                      {t.addSize}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk size assignment */}
          {form.images.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="font-medium mb-2">{t.addSizesToMultiple}</p>
              <div className="flex gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={selectAllImages} 
                  className="text-sm text-black underline"
                >
                  {t.selectAll}
                </button>
                <button 
                  type="button" 
                  onClick={deselectAllImages} 
                  className="text-sm text-black underline"
                >
                  {t.deselectAll}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.commaSeparatedPlaceholder}
                  value={assignSizes}
                  onChange={e => setAssignSizes(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl text-sm"
                />
                <button 
                  type="button" 
                  onClick={applySizesToSelected} 
                  className="cursor-pointer px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800"
                >
                  {t.apply}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit / Cancel buttons */}
        <div className="flex gap-4 pt-8">
          <button 
            type="submit" 
            disabled={loading} 
            className="cursor-pointer flex-1 py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? t.saving : editingId ? t.updateProduct : t.createProduct}
          </button>
          <button 
            type="button" 
            onClick={resetForm} 
            className="cursor-pointer flex-1 py-5 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </Modal>
  )}
</AnimatePresence>
      </motion.section>
    </>
  );
}

function Modal({ children, title, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extralight">{title}</h2>
            <button onClick={onClose} className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition">
              <X size={28} />
            </button>
          </div>
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto -mt-10 mb-6" />
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-base" {...props}>
        {children}
      </select>
    </div>
  );
}