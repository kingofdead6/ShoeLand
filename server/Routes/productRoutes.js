import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleShowOnProductsPage,
  toggleShowOnTrendingPage,
  toggleShowOnBestOffersPage,
  getFeaturedProducts,
  getTrendingProducts,
  getBestOffers,
  getSimilarProducts
} from '../Controllers/product.js';

import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// ===== PUBLIC ROUTES =====
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/best-offers', getBestOffers);
router.get('/similar', getSimilarProducts);

router.get('/:id', getProductById);
// ===== ADMIN ROUTES =====
router.post('/', protect, admin, upload.array('images', 100), createProduct);
router.put('/:id', protect, admin, upload.array('images', 100), updateProduct);

router.patch('/:id/toggle-products-page', protect, admin, toggleShowOnProductsPage);
router.patch('/:id/toggle-trending-page', protect, admin, toggleShowOnTrendingPage);
router.patch('/:id/toggle-best-offers-page', protect, admin, toggleShowOnBestOffersPage);

router.delete('/:id', protect, admin, deleteProduct);

export default router;
