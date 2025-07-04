const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGOURL;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Connect to MongoDB
mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const orderSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  priority: String,
  message: String,
  userId: mongoose.Schema.Types.ObjectId,
});
const Order = mongoose.model("Order", orderSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secret");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "User registered" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// Create Order
app.post("/orders", authMiddleware, async (req, res) => {
  const { productName, quantity, priority = "Low", message = "" } = req.body;

  if (!productName || !quantity) {
    return res
      .status(400)
      .json({ message: "productName and quantity are required" });
  }

  const order = new Order({
    productName,
    quantity,
    priority,
    message,
    userId: req.userId,
  });

  await order.save();
  res.json(order);
});

// Get Orders
app.get("/orders", authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.userId });
  res.json(orders);
});

// Delete Order
app.delete("/orders/:id", authMiddleware, async (req, res) => {
  await Order.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Order deleted" });
});

// Update Priority
app.patch("/orders/:id/priority", authMiddleware, async (req, res) => {
  const { priority } = req.body;
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { priority },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// Update Message
app.patch("/orders/:id/message", authMiddleware, async (req, res) => {
  const { message } = req.body;
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { message },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
