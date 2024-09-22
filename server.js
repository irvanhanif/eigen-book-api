const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { SUCCESS } = require("./helper/response");

const memberRoutes = require("./api/routes/member.routes");
const bookRoutes = require("./api/routes/book.routes");
const borrowRoutes = require("./api/routes/borrow.routes");

const { swaggerUI, swaggerSpec } = require("./helper/swagger");

const app = express();
const port = 4500;

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ACCESS || "" }));
app.use(express.urlencoded({ extended: false }));

app.use("/member", memberRoutes);
app.use("/book", bookRoutes);
app.use("/borrow", borrowRoutes);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get("/", async (req, res) => {
  return SUCCESS(res, 200, "API is worked!!");
});

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});
