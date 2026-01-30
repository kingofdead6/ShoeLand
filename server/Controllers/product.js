import asyncHandler from 'express-async-handler';
import Product from '../Models/Product.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Get all products for admin (admin)
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = {};
  if (category) query.category = category;

  const products = await Product.find(query).lean();
  res.status(200).json(products);
});

// Get single product by ID (public)
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ ...product });
});

// Create product (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, gender, showOnProductsPage, showOnTrendingPage, showOnBestOffersPage, imageSizes } = req.body;

  if (!name || !category || !price ) {
    res.status(400);
    throw new Error('Name, category, price are required');
  }

  let parsedImageSizes = [];
  if (imageSizes) {
    try {
      parsedImageSizes = JSON.parse(imageSizes);
      if (!Array.isArray(parsedImageSizes)) {
        throw new Error('Invalid imageSizes format');
      }
    } catch (err) {
      res.status(400);
      throw new Error('Invalid imageSizes: must be valid JSON array');
    }
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length !== parsedImageSizes.length) {
      res.status(400);
      throw new Error('Number of files must match number of imageSizes arrays');
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToCloudinary(file); 

      let sizesForThisImage = [];
      if (Array.isArray(parsedImageSizes[i])) {
        sizesForThisImage = parsedImageSizes[i].map(size => ({ size: size.toString().trim() }));
      }

      images.push({ url: imageUrl, sizes: sizesForThisImage });
    }
  }

  const product = await Product.create({
    name,
    category,
    price: Number(price),
    gender: gender || 'unisex',
    images,
    showOnProductsPage: showOnProductsPage === 'true' || showOnProductsPage === true,
    showOnTrendingPage: showOnTrendingPage === 'true' || showOnTrendingPage === true,
    showOnBestOffersPage: showOnBestOffersPage === 'true' || showOnBestOffersPage === true,
  });

  res.status(201).json(product);
});

// UPDATE PRODUCT
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, price, gender, showOnProductsPage, showOnTrendingPage, showOnBestOffersPage, imageSizes, keptImages } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (name) product.name = name;
  if (category) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (gender) product.gender = gender;

  if (showOnProductsPage !== undefined) product.showOnProductsPage = showOnProductsPage === 'true' || showOnProductsPage === true;
  if (showOnTrendingPage !== undefined) product.showOnTrendingPage = showOnTrendingPage === 'true' || showOnTrendingPage === true;
  if (showOnBestOffersPage !== undefined) product.showOnBestOffersPage = showOnBestOffersPage === 'true' || showOnBestOffersPage === true;

  let finalImages = [];

  // Parse keptImages
  let parsedKeptImages = [];
  if (keptImages) {
    try {
      parsedKeptImages = JSON.parse(keptImages);
      if (!Array.isArray(parsedKeptImages)) {
        throw new Error('Invalid keptImages format');
      }
    } catch (err) {
      res.status(400);
      throw new Error('Invalid keptImages: must be valid JSON array');
    }

    for (const item of parsedKeptImages) {
      if (item.url && Array.isArray(item.sizes)) {
        finalImages.push({
          url: item.url,
          sizes: item.sizes.map(size => ({ size: size.toString().trim() }))
        });
      }
    }
  }

  // Handle new images with sizes
  let parsedImageSizes = [];
  if (imageSizes) {
    try {
      parsedImageSizes = JSON.parse(imageSizes);
      if (!Array.isArray(parsedImageSizes)) {
        throw new Error('Invalid imageSizes format');
      }
    } catch (err) {
      res.status(400);
      throw new Error('Invalid imageSizes: must be valid JSON array');
    }
  }

  if (req.files && req.files.length > 0) {
    if (req.files.length !== parsedImageSizes.length) {
      res.status(400);
      throw new Error('Number of files must match number of imageSizes arrays');
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToCloudinary(file);
      let sizesForThisImage = [];
      if (Array.isArray(parsedImageSizes[i])) {
        sizesForThisImage = parsedImageSizes[i].map(size => ({ size: size.toString().trim() }));
      }
      finalImages.push({ url: imageUrl, sizes: sizesForThisImage });
    }
  }

  // Only update images if changes were provided
  if (keptImages || (req.files && req.files.length > 0)) {
    product.images = finalImages;
  }

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});





// Toggle showOnProductsPage (admin)
export const toggleShowOnProductsPage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.showOnProductsPage = !product.showOnProductsPage;
  await product.save();
  res.status(200).json(product);
});

//Toggle Show on Trending Page
export const toggleShowOnTrendingPage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.showOnTrendingPage = !product.showOnTrendingPage;
  await product.save();
  res.status(200).json(product);
});

export const toggleShowOnBestOffersPage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.showOnBestOffersPage = !product.showOnBestOffersPage;
  await product.save();
  res.status(200).json(product);
});

// Delete product (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await Product.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Product deleted' });
});


export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { showOnProductsPage: true };
  if (category && category !== "All Shoes") {
    query.category = category;
  }

  const products = await Product.find(query).lean();

  // Process stock info but NEVER hide the product
  const processedProducts = products.map(product => {
  

    return {
      ...product
    };
  });

  res.status(200).json(processedProducts);
});

// Get Trending Products
export const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ showOnTrendingPage: true }).lean();
  
  const processed = products.map(product => ({
    ...product,
  
  }))

  res.json(processed);
});

// Get Best Offers
export const getBestOffers = asyncHandler(async (req, res) => {
  const products = await Product.find({ showOnBestOffersPage: true }).lean();
  
  const processed = products.map(product => ({
    ...product,
 
    
  }))

  res.json(processed);
});



 export const getSimilarProducts = asyncHandler(async (req, res) => {
  const { id, category } = req.query;

  if (!id || !category) {
    res.status(400);
    throw new Error('Product ID and category are required');
  }

  // Validate ID format early
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const currentProduct = await Product.findById(id).lean();
  if (!currentProduct) {
    res.status(404);
    throw new Error('Current product not found');
  }


  const similar = await Product.find({
    category: category,
    _id: { $ne: id },
    "images.sizes.0": { $exists: true }
  })
  .lean()
  .limit(12);

  res.json(similar);
});