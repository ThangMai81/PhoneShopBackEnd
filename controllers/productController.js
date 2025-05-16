const Product = require("../models/product");

// Get all products
exports.getProducts = async (req, res, next) => {
  try {
    const allProducts = await Product.find();
    if (allProducts) {
      return res.status(200).json({
        message: "Fetch all products successfully!",
        status: 200,
        products: allProducts,
      });
    } else {
      const error = new Error("Internal Server Error");
      error.statusCode = 500;
      next(error);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

// Get a product by specific id
exports.getProductById = async (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId);
  if (!productId) {
    return res.status(400).json({
      message: "All fields are required.",
      status: 400,
    });
  }
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        message: "Product not found.",
        status: 400,
      });
    }

    // find items with same category:
    const products = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    });
    console.log("Products: ", products);
    if (!product) {
      return res.status(500).json({
        message: "Internal Server Error",
        status: 500,
      });
    }

    res.status(200).json({
      message: "Product fetched successfully.",
      status: 200,
      product: product,
      relatedProducts: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
};
