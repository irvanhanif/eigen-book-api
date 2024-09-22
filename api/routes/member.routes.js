const route = require("express").Router();
const {
  createMember,
  getMemberByID,
  deleteMember,
  getAllMembers,
  updateMember,
  getBookBorrowedMember,
  getBookBorrowedEachMember,
} = require("../controller/member.controller");
const getBody = require("multer")().none();

route.post("/", getBody, createMember);
route.get("/", getAllMembers);
route.get("/:id", getMemberByID);
route.get("/all/borrow", getBookBorrowedEachMember);
route.get("/:id/borrow", getBookBorrowedMember);
route.put("/:id", getBody, updateMember);
route.delete("/:id", deleteMember);

module.exports = route;
