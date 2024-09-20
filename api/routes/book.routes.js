const route = require("express").Router();
const {
  createBook,
  getAllBooks,
  getBookByID,
  deleteBook,
  updateBook,
  countAllBooks,
} = require("../controller/book.controller");
const getBody = require("multer")().none();

route.post("/", getBody, createBook);
route.get("/", getAllBooks);
route.get("/count/all", countAllBooks);
route.get("/:id", getBookByID);
route.put("/:id", getBody, updateBook);
route.delete("/:id", deleteBook);

module.exports = route;
