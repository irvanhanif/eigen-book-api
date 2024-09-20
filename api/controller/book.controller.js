const config = require("../../database/db.config");
const {
  insertData,
  selectData,
  deleteData,
  updateData,
} = require("../../database/db.query");
const { bookSchema } = require("../../helper/joiSchema");
const { ERROR, SUCCESS } = require("../../helper/response");
const tablename = "book";

module.exports = {
  /**
   * @swagger
   * /book:
   *  post:
   *    summary: to create book in book table
   *    description:
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              code:
   *                type: string
   *                example: "NRN-7"
   *              title:
   *                type: string
   *                example: "The Lion, the Witch and the Wardrobe"
   *              author:
   *                type: string
   *                example: "C.S. Lewis"
   *              stock:
   *                type: integer
   *                example: "3"
   *    responses:
   *      201:
   *        description: result of success create book data
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    affectedRows:
   *                      type: integer
   *                      example: 1
   */

  createBook: async (req, res) => {
    const { code, title, author, stock } = req.body;

    try {
      let dataBook = {
        code: code,
        title: title,
        author: author,
        stock: stock,
      };
      await bookSchema.validateAsync(dataBook);

      const { error, result } = await insertData({
        data: dataBook,
        tablename: tablename,
      });
      if (error) return ERROR(res, 500, error);

      if (config.type == "mysql") {
        const dataBookInDB = await selectData({
          tablename: tablename,
          primaryKey: {
            code: code,
          },
        });
        if (dataBookInDB.error) return ERROR(res, 500, dataBookInDB.error);

        if (
          Array.isArray(dataBookInDB.result) &&
          dataBookInDB.result.length > 0
        )
          return SUCCESS(res, 201, dataBookInDB.result[0]);
      } else if (config.type == "pg") return SUCCESS(res, 201, result);
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  /**
   * @swagger
   * /book:
   *  get:
   *    summary: to get all data from book table
   *    description: This api will return all of data in book table.
   *    responses:
   *      200:
   *        description:
   */

  getAllBooks: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

  /**
   * @swagger
   * /book/{id}:
   *  get:
   *    summary: to get data by ID from book table
   *    description: This api will return detail data from book table with the primary key to pointing data.
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: ID required
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description:
   */

  getBookByID: async (req, res) => {
    const id = req.params.id;

    const { error, result } = await selectData({
      tablename: tablename,
      primaryKey: {
        code: id,
      },
    });

    if (error) return ERROR(res, 500, error);
    if (Array.isArray(result) && result.length > 0)
      return SUCCESS(res, 200, result);
    return ERROR(res, 404, "Data not found");
  },

  /**
   * @swagger
   * /book/{id}:
   *  put:
   *    summary: to change data book by ID from book table
   *    description: This api will changing detail data from book table with the primary key to pointing data.
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: ID required
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/book'
   *    responses:
   *      200:
   *        description: return detail data book
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    code:
   *                      type: string
   *                      example: "NRN-7"
   *                    title:
   *                      type: string
   *                      example: "The Lion, the Witch and the Wardrobe"
   *                    author:
   *                      type: string
   *                      example: "C.S. Lewis"
   *                    stock:
   *                      type: integer
   *                      example: "3"
   */

  updateBook: async (req, res) => {
    const id = req.params.id;
    const { code, title, author, stock } = req.body;

    try {
      let dataBook = {
        code: code == id || (!code && code == undefined) ? id : code,
        title: title,
        author: author,
        stock: stock,
      };

      await bookSchema.validateAsync(dataBook);

      const { error, result } = await updateData({
        data: dataBook,
        tablename: tablename,
        primaryKey: { code: id },
      });
      if (error) return ERROR(res, 500, error);

      if (config.type == "mysql") {
        const dataBookInDB = await selectData({
          tablename: tablename,
          primaryKey: {
            code: dataBook["code"],
          },
        });
        if (dataBookInDB.error) return ERROR(res, 500, dataBookInDB.error);

        if (
          Array.isArray(dataBookInDB.result) &&
          dataBookInDB.result.length > 0
        )
          return SUCCESS(res, 200, dataBookInDB.result[0]);
      } else if (config.type == "pg" && result)
        return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  /**
   * @swagger
   * /book/{id}:
   *  delete:
   *    summary: to delete data by ID from book table
   *    description: This api will remove data from book table with the primary key to pointing data.
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: ID required
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Success to delete data from book table
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    affectedRows:
   *                      type: integer
   *                      example: 1
   */

  deleteBook: async (req, res) => {
    const id = req.params.id;

    const { error, result } = await deleteData({
      tablename: tablename,
      primaryKey: { code: id },
    });

    if (error) return ERROR(res, 500, error);
    if (result.affectedRows) return SUCCESS(res, 200, result);
    return ERROR(res, 404, "Data not found");
  },

  /**
   * @swagger
   * /book/count/all:
   *  get:
   *    summary: to get data quantities books in stock
   *    description: This api will return detail data from all boook in table, where stock is ready and can be borrow by member. Api use primary key to pointing data.
   *    responses:
   *      200:
   *        description:
   */

  countAllBooks: async (req, res) => {
    try {
      const resultCountAll = await selectData({
        tablename: tablename,
        func: { sum: "stock" },
        where: { stock: "> 0" },
      });
      if (resultCountAll.error) return ERROR(res, 500, resultCountAll.error);

      const resultSelectAll = await selectData({
        tablename: tablename,
      });
      if (resultSelectAll.error) return ERROR(res, 500, resultSelectAll.error);

      return SUCCESS(res, 200, {
        books: resultSelectAll.result,
        quantities: resultCountAll.result,
      });
    } catch (error) {
      if (error) return ERROR(res, 500, error);
    }
  },
};
