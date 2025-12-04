const { Product, categoriesData } = require("../models/product.model");

exports.createProduct = async (req, res) => {
  try {
    const imagePaths = req.files.map((file) => file.path);
    req.body.imageURL = imagePaths;
    if (!req.body.storeId) {
      req.body.storeId = null;
    }
    console.log(req.body);
    console.log("MODEL:", Product);
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteProductById = async (req, res) => {
  const { data } = req.body;

  try {
    await Product.findByIdAndUpdate(data, { Isdeleted: true }, { new: true });

    res.status(200).json({ deleted: "is deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.Stock = async (req, res) => {
  const { data } = req.body;

  try {
    const test = await Product.find({ _id: data });

    const newIsstock = test[0].Isstock;
    await Product.findByIdAndUpdate(
      data,
      { Isstock: !newIsstock },
      { new: true }
    );
    res.status(200).json({ stock: "is stock" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.Advertising = async (req, res) => {
  const { data } = req.body;

  try {
    const test = await Product.find({ _id: data });

    const newIsstock = test[0].Isadvertising;
    await Product.findByIdAndUpdate(
      data,
      { Isadvertising: !newIsstock },
      { new: true }
    );
    res.status(200).json({ stock: "is stock" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateProductById = async (req, res) => {
  const { id, name, desc, price, imageURL } = req.body;

  const updateFields = { name, desc, price, imageURL };

  if (imageURL) {
    req.body.imageURL = req.file.path;
  }
  const filteredFields = Object.fromEntries(
    Object.entries(updateFields).filter(
      ([_, value]) => value !== undefined && value !== ""
    )
  );

  try {
    const product = await Product.findByIdAndUpdate(id, filteredFields, {
      new: true,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.produect = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getcategoriesProdects = async (req, res) => {
  const categories = Object.entries(categoriesData).map(([key, item]) => ({
    label: item.value,
    value: key,
  }));
  try {
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getSubcategoriesProdects = async (req, res) => {
  const category = req.query.category;
  const categories = categoriesData[category].subcategories.map((item) => ({
    label: item,
    value: item,
  }));
  console.log(categoriesData[category].subcategories);
  try {
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveProdects = async (req, res) => {
  try {
    const Allproducts = await Product.find();
    // console.log("Allproducts", Allproducts);

    const products = Allproducts.filter((e) => e.Isdeleted === false);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAdvertisingProdects = async (req, res) => {
  try {
    const Allproducts = await Product.find();
    // console.log("Allproducts", Allproducts);

    const products = Allproducts.filter((e) => e.Isadvertising === true);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.searchProduct = async (req, res) => {
  const { search } = req.body;

  try {
    if (!search || search.trim() === "") {
      const products = await Product.find();
      return res.status(200).json(products);
    }
    const products = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
      Isdeleted: false, // Ensure only non-deleted products are returned
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
