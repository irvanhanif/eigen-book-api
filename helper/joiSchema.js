const Joi = require("joi");

module.exports = {
  memberSchema: Joi.object({
    code: Joi.string().min(4).required(),
    name: Joi.string().min(3).max(60).required(),
    penalty: Joi.date().timestamp().optional(),
  }),
  bookSchema: Joi.object({
    code: Joi.string().min(4).max(7).required(),
    title: Joi.string().min(5).max(60).required(),
    author: Joi.string().min(3).max(60).required(),
    stock: Joi.number().min(0).max(1000).required(),
  }),
  borrowSchema: Joi.object({
    book_code: Joi.string().min(4).max(7).required(),
    member_code: Joi.string().min(4).required(),
    date_borrow: Joi.date().timestamp().optional(),
  }),
};
