import asyncHandler from 'express-async-handler';
import DeliveryArea from '../Models/DeliveryArea.js';
import StoreSettings from '../Models/StoreSettings.js'; 

export const getDeliveryAreas = asyncHandler(async (req, res) => {
  const { store } = req.query;

  if (!store) {
    res.status(400);
    throw new Error("Store name is required");
  }

  let settings = await StoreSettings.findOne({ storeName: store });
  if (!settings) {
    const defaultCompany = store === 'chingo Mima 2' ? 'yalidine' : 'zr-Express';
    settings = await StoreSettings.create({
      storeName: store,
      deliveryCompany: defaultCompany,
    });
  }
  const company = settings.deliveryCompany;

  const areas = await DeliveryArea.find({
    store,
    company,
  }).sort({ wilaya: 1 });

  const formattedAreas = areas.map(area => ({
    id: area._id,
    wilaya: area.wilaya,
    priceHome: area.priceHome,
    priceDesk: area.priceDesk,
    desks: area.desks && area.desks.length > 0 ? area.desks : [], 
  }));

  res.json({
    areas: formattedAreas,
    company,
  });
});


export const createDeliveryArea = asyncHandler(async (req, res) => {
  const { wilaya, store, priceHome = 600, priceDesk = 700, desks = [] } = req.body;

  if (!wilaya || !store) {
    res.status(400);
    throw new Error("Wilaya and store are required");
  }

  // Get the fixed company for this store
  let settings = await StoreSettings.findOne({ storeName: store });
  if (!settings) {
    const defaultCompany = store === 'Tchingo Mima 2' ? 'yalidine' : 'zr-Express';
    settings = await StoreSettings.create({
      storeName: store,
      deliveryCompany: defaultCompany,
    });
  }
  const company = settings.deliveryCompany;

  // Check if the wilaya already exists for this store + company
  const exists = await DeliveryArea.findOne({
    store,
    company,
    wilaya: wilaya.trim(),
  });

  if (exists) {
    res.status(400);
    throw new Error(`This wilaya already exists for ${company.toUpperCase()} in this store`);
  }

  const area = await DeliveryArea.create({
    wilaya: wilaya.trim(),
    store,
    company,
    priceHome: Number(priceHome),
    priceDesk: Number(priceDesk),
    desks, 
  });

  res.status(201).json(area);
});


export const updateDeliveryArea = asyncHandler(async (req, res) => {
  const area = await DeliveryArea.findById(req.params.id);
  if (!area) {
    res.status(404);
    throw new Error("Delivery area not found");
  }

  // Only allow updating these fields
  const { priceHome, priceDesk, desks } = req.body;
  if (priceHome !== undefined) area.priceHome = Number(priceHome);
  if (priceDesk !== undefined) area.priceDesk = Number(priceDesk);
  if (desks !== undefined) area.desks = desks;

  await area.save();
  res.json(area);
});


export const deleteDeliveryArea = asyncHandler(async (req, res) => {
  const area = await DeliveryArea.findById(req.params.id);
  if (!area) {
    res.status(404);
    throw new Error("Delivery area not found");
  }

  await area.deleteOne();
  res.json({ message: "Delivery area removed" });
});

