const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config");
const userRouter = require("./routers/user.router");
const productRouter = require("./routers/product.router");
const orderRouter = require("./routers/order.router");
const storesRouter = require("./routers/stores.router");
const cartRouter = require("./routers/cart.router");
const dashboardRouter = require("./routers/dashboard.router");
const deliveryRouter = require("./routers/delivery.router");
const adminRouter = require("./routers/admin.router");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://7awaleen-faisal.vercel.app",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io); // make io accessible via req.app.get("io")

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Room management
  socket.on("join-tracking", ({ orderId }) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    }
  });

  socket.on("leave-tracking", ({ orderId }) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    }
  });

  // Client -> Server events (Driver sends)
  socket.on("update-location", (data) => {
    // data: { orderId, driverId, lat, lng, heading }
    const { orderId } = data;
    if (orderId) {
      // Broadcast to everyone else in the room
      socket.to(`order_${orderId}`).emit("location-updated", data);
    }
  });

  socket.on("update-status", (data) => {
    // data: { orderId, status }
    const { orderId } = data;
    if (orderId) {
      socket.to(`order_${orderId}`).emit("status-changed", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(express.json());

dotenv.config();
connectDB();
app.use(
  cors({
    origin: [
      "https://7awaleen-faisal.vercel.app",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  }),
);

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/store", storesRouter);
app.use("/cart", cartRouter);
app.use("/dashboard", dashboardRouter);
app.use("/delivery", deliveryRouter);
app.use("/admin", adminRouter);

server.listen(process.env.PORT || 5000, () =>
  console.log(`server started at port: ${process.env.PORT || 5000}`),
);
