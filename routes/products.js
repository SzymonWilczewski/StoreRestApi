const router = require("express").Router();
const Product = require("../models/product");
const { isAdmin } = require("../utils/auth");
const { upload, deleteImage } = require("../utils/multer");

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();

    return res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
});

// Get a product by id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "The product does not exist" });
    }

    return res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
});

// Create a new product
router.post("/", isAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const { name, description, type, price } = req.body;
    const image = req.file ? req.file.path : "";

    const product = await Product.create({
      name,
      description,
      type,
      image,
      price,
    });

    return res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

// Update a product
router.put("/:id", isAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, price } = req.body;
    const image = req.file ? req.file.path : "";
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "The product does not exist" });
    } else if (product.image) {
      deleteImage(product.image);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, type, image, price },
      { new: true }
    );

    return res.status(200).json({ product: updatedProduct });
  } catch (err) {
    next(err);
  }
});

// Modify a product
router.patch(
  "/:id",
  isAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "The product does not exist" });
      } else if (product.image && req.file) {
        deleteImage(product.image);
      }

      const {
        name = product.name,
        description = product.description,
        type = product.type,
        price = product.price,
      } = req.body;
      const image = req.file ? req.file.path : product.image;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, description, type, image, price },
        { new: true }
      );

      return res.status(200).json({ product: updatedProduct });
    } catch (err) {
      next(err);
    }
  }
);

// Delete a product
router.delete("/:id", isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "The product does not exist" });
    } else if (product.image) {
      deleteImage(product.image);
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    return res.status(200).json({ product: deletedProduct });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
