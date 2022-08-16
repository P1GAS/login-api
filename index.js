const dotenv = require("dotenv");
dotenv.config();

const serverless = require("serverless-http");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/auth");
const tokenRoute = require("./routes/token");
const userRoute = require("./routes/user");

const app = express();

app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (err) => {
    console.log("Mongoose connected with " + err);
  }
);

app.use("/api/auth", authRoute);
app.use("/api/tokens", tokenRoute);
app.use("/api/users", userRoute);


if (process.env.NODE_ENV === 'production') {
  module.exports.handler = serverless(app)
} else {
  app.listen(process.env.PORT, (err) => {
  console.log("app is running with " + err);
  });
}