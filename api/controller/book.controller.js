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
      if (error) {
        if (error.code == "ER_DUP_ENTRY")
          return ERROR(res, 409, `Data with code ${code} already exists`);
        return ERROR(res, 500, error);
      }

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

  getAllBooks: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

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
      return SUCCESS(res, 200, result[0]);
    return ERROR(res, 404, "Data not found");
  },

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

      if (config.type == "mysql" && result.affectedRows > 0) {
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

  deleteBook: async (req, res) => {
    const id = req.params.id;

    const { error, result } = await deleteData({
      tablename: tablename,
      primaryKey: { code: id },
    });

    if (error) return ERROR(res, 500, error);
    if (result && result.affectedRows) return SUCCESS(res, 200, result);
    return ERROR(res, 404, "Data not found");
  },

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
        where: { stock: "> 0" },
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
