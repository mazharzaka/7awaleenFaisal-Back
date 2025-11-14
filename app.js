const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config");
const userRouter = require("./routers/user.router");
const productRouter = require("./routers/product.router");
const orderRouter = require("./routers/order.router");
const cors = require("cors");

const app = express();
app.use(express.json());

dotenv.config();
connectDB();
// app.use(cors({origin:'http://localhost:4200'}));
const corsOptions = {
  origin: "*", // React و Angular
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use("/imgs", express.static("imgs"));
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);

app.listen(process.env.PORT || 5000, () =>
  console.log(`server started at port: ${process.env.PORT || 5000}`)
);
