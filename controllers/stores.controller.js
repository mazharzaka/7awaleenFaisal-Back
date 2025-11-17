const Store = require("../models/store.model");

// Create new store
exports.createStore = async (req, res) => {
  try {
    if (req.file) req.body.imageURL = req.file.path;
    else {
      return res.status(400).json({ error: "Store image is required" });
    }
    const store = await Store.create(req.body);
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all stores
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only active stores
exports.getActiveStores = async (req, res) => {
  try {
    const stores = await Store.find({ isDeleted: false });
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  const { id, name, category, address, phone } = req.body;

  const updateFields = { name, category, address, phone };
  if (req.file) updateFields.imageURL = req.file.path;

  const filteredFields = Object.fromEntries(
    Object.entries(updateFields).filter(
      ([_, value]) => value !== undefined && value !== ""
    )
  );

  try {
    const store = await Store.findByIdAndUpdate(id, filteredFields, {
      new: true,
    });
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete store
exports.deleteStore = async (req, res) => {
  const { id } = req.body;

  try {
    await Store.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    res.status(200).json({ deleted: "Store is deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle subscription
exports.toggleSubscription = async (req, res) => {
  const { id } = req.body;

  try {
    const store = await Store.findById(id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    store.subscription = !store.subscription;
    await store.save();

    res.status(200).json({ subscription: store.subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getSubscribedStores = async (req, res) => {
  try {
    const stores = await Store.find({ subscription: true });
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getStoreById = async (req, res) => {
  const { id } = req.body;
  try {
    const store = await Store.findById(id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
