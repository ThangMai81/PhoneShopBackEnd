const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/phone_shop_fallback",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // appName: 'Cluster0' // Bỏ appName khi deploy production
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
