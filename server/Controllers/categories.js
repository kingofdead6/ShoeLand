import asyncHandler from "express-async-handler";
import Categories from "../Models/Categories.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error("Valid category name required");
  }

  const categoryExists = await Categories.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Categories.create({ name: name.trim() });
  res.status(201).json(category);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Categories.find({}).sort({ name: 1 });
  res.status(200).json(categories);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Categories.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await Categories.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Category removed" });
});
