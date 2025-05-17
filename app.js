const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const productRoutes = require("./routes/product");
const authenticationRoutes = require("./routes/authentication");
const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");
const connectDB = require("./db");
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://thangmai81.github.io",
    "https://thangmai81.github.io/",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204, // cho preflight trả về 204 thay vì 200
};

const PORT = process.env.PORT || 5000;
const HOST = "localhost";

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

// Other routes
app.use("/product", productRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authenticationRoutes);
app.use("/order", orderRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  return res.status(status).json({ message: message, data: data });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal Server Error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
});
