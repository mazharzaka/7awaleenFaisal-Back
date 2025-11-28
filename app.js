const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config");
const userRouter = require("./routers/user.router");
const productRouter = require("./routers/product.router");
const orderRouter = require("./routers/order.router");
const storesRouter = require("./routers/stores.router");
const cors = require("cors");

const app = express();
app.use(express.json());

dotenv.config();
connectDB();
app.use(
  cors({
    origin: ["https://7awaleen-faisal.vercel.app", "http://localhost:3001"],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/store", storesRouter);

app.listen(process.env.PORT || 5000, () =>
  console.log(`server started at port: ${process.env.PORT || 5000}`)
);
