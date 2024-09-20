const route = require("express").Router();
const {
  createBorrow,
  getAllBorrowed,
  getBorrowed,
  updateBorrowed,
  deleteBorrowed,
  returnBook,
} = require("../controller/borrow.controller");
const getBody = require("multer")().none();

route.post("/", getBody, createBorrow);
route.get("/", getAllBorrowed);
route.get("/detail", getBody, getBorrowed);
route.put("/", getBody, updateBorrowed);
route.delete("/", getBody, deleteBorrowed);
route.delete("/return", getBody, returnBook);

module.exports = route;
