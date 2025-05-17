const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
// function to save the image into server from firebase for public use (send verification mail with nodemail)
async function downloadImageFromFirebase(imageUrl, fileName) {
  try {
    // Fetch GET request, return as stream
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    const filePath = path.resolve(__dirname, "uploads", fileName);

    // create stream to write file
    const writer = fs.createWriteStream(filePath);

    // pipe data from axios into file
    response.data.pipe(writer);

    // return promise when file is done written
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading image:", error.message);
    throw error;
  }
}

// Create new order
exports.placeOrder = async (req, res) => {
  console.log("");
  const { email, name, phone, address, products } = req.body;

  try {
    // Validate body
    if (
      !email ||
      !name ||
      !phone ||
      !address ||
      !products ||
      !products.length
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required.", status: 400 });
    }

    // Build cart with product refs
    const cart = await Promise.all(
      products.map(async (p) => {
        const product = await Product.findById(p.item);

        // const fileName = `${product._id}_img1.jpg`;

        // await downloadImageFromFirebase(product.img1, fileName);
        // // Have to change to public url
        // const publicUrl = `https://your-app-name.onrender.com/uploads/${fileName}`;
        if (!product)
          throw new Error({ message: "Product not found", status: 404 });
        return {
          product: product,
          // product: {
          //   ...product._doc,
          //   img1: publicUrl,
          // },
          count: p.quantity,
        };
      })
    );
    console.log("Cart: ", cart);
    // Create and save order
    const newOrder = new Order({
      email,
      name,
      phone,
      address,
      cart,
    });
    await newOrder.save();

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      secure: true, // true for 465, false for 587
      auth: {
        user: email,
        pass: "gwwfbiidfzacbooj", // Use App Password for Gmail
      },
    });

    const mailOptions = {
      from: "maithang18122003@gmail.com",
      to: email,
      subject: "Order Confirmation",
      html: `
      <div style="background-color: #1e1e1e; color: white; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Xin Chào ${name}</h2>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; color: white;">
          <thead>
            <tr style="border: 1px solid #ccc;">
              <th style="padding: 10px; border: 1px solid #ccc;">Tên Sản Phẩm</th>
              <th style="padding: 10px; border: 1px solid #ccc;">Hình Ảnh</th>
              <th style="padding: 10px; border: 1px solid #ccc;">Giá</th>
              <th style="padding: 10px; border: 1px solid #ccc;">Số Lượng</th>
              <th style="padding: 10px; border: 1px solid #ccc;">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map((item) => {
                const product = item.product;
                const quantity = item.count;
                const total = Number(product.price) * quantity;
                const formattedPrice = Number(product.price).toLocaleString(
                  "vi-VN"
                );
                const formattedTotal = total.toLocaleString("vi-VN");
                return `
                <tr style="border: 1px solid #ccc;">
                  <td style="padding: 10px; border: 1px solid #ccc;">${product.name}</td>
                  <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">
                    <img src="${product.img1}" alt="${product.name}" style="width: 80px; height: auto;" />
                  </td>
                  <td style="padding: 10px; border: 1px solid #ccc;">${formattedPrice} VND</td>
                  <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${quantity}</td>
                  <td style="padding: 10px; border: 1px solid #ccc;">${formattedTotal} VND</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
  
        <h2 style="margin-top: 30px;">Tổng Thanh Toán:</h2>
        <h1 style="color: #fff; font-size: 28px;">
          ${cart
            .reduce(
              (sum, item) => sum + Number(item.product.price) * item.count,
              0
            )
            .toLocaleString("vi-VN")} VND
        </h1>
  
        <h2 style="margin-top: 20px;">Cảm ơn bạn!</h2>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: 500 });
  }
};

// View orders history
exports.getOrderHistory = async (req, res) => {
  try {
    // Find all orders by matching email and password
    const orders = await Order.find({ email: req.user.email }).populate(
      "cart.product"
    );
    console.log("Orders: ", orders);
    if (!orders.length) {
      return res.status(404).json({
        message: "No order history found for this account.",
        status: 404,
        orders: [],
      });
    }

    const user = await User.find({ email: req.user.email });
    if (!user.length) {
      return res.status(404).json({
        message: "No user found.",
        status: 404,
      });
    }
    console.log("User in getCart: ", user);
    return res.status(200).json({
      message: "Fetched order history successfully!",
      status: 200,
      orders,
      userId: user[0].id,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: 500 });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    console.log("OrderId: ", orderId);
    const order = await Order.findById(orderId).populate("cart.product");
    if (!order) {
      const error = new Error({
        message: "Cannot find order in getOrderById function",
      });
      error.statusCode = 404;
      next(error);
    }
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      const error = new Error({
        message: "Cannot find user in getOrderById function",
      });
      error.statusCode = 404;
      next(error);
    }
    console.log("Order: ", order, "UserId: ", user._id);
    return res
      .status(200)
      .json({ message: "Find order successfully", order, userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      throw new Error({ message: "Internal Server Error", status: 500 });
    }
  }
};
