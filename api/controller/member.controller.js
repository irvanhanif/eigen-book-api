const config = require("../../database/db.config");
const {
  insertData,
  selectData,
  deleteData,
  updateData,
} = require("../../database/db.query");
const { memberSchema } = require("../../helper/joiSchema");
const { ERROR, SUCCESS } = require("../../helper/response");
const {
  getBookBorrowedByMember,
  getBookBorrowedByEachMember,
} = require("../services/book.service");
const tablename = "member";

module.exports = {
  createMember: async (req, res) => {
    const { code, name } = req.body;

    try {
      let dataMember = {
        code: code,
        name: name,
      };
      await memberSchema.validateAsync(dataMember);

      const { error, result } = await insertData({
        data: dataMember,
        tablename: tablename,
      });
      if (error) {
        if (error.code == "ER_DUP_ENTRY")
          return ERROR(res, 409, `Data with code ${code} already exists`);
        return ERROR(res, 500, error);
      }

      if (config.type == "mysql") {
        const dataMemberInDB = await selectData({
          tablename: tablename,
          primaryKey: {
            code: code,
          },
        });
        if (dataMemberInDB.error) return ERROR(res, 500, dataMemberInDB.error);

        if (
          Array.isArray(dataMemberInDB.result) &&
          dataMemberInDB.result.length > 0
        )
          return SUCCESS(res, 201, dataMemberInDB.result[0]);
      } else if (config.type == "pg") return SUCCESS(res, 201, result);
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  getAllMembers: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

  getMemberByID: async (req, res) => {
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

  updateMember: async (req, res) => {
    const id = req.params.id;
    const { code, name, penalty } = req.body;

    try {
      let dataMember = {
        code: code == id || (!code && code == undefined) ? id : code,
        name: name,
        penalty: (Number(new Date(penalty ?? 0).getTime()) / 1000) * 1000,
      };

      await memberSchema.validateAsync(dataMember);

      const { error, result } = await updateData({
        data: dataMember,
        tablename: tablename,
        primaryKey: { code: id },
      });

      if (error) return ERROR(res, 500, error);

      if (config.type == "mysql" && result.affectedRows > 0) {
        const dataMemberInDB = await selectData({
          tablename: tablename,
          primaryKey: {
            code: dataMember["code"],
          },
        });
        if (dataMemberInDB.error) return ERROR(res, 500, dataMemberInDB.error);

        if (
          Array.isArray(dataMemberInDB.result) &&
          dataMemberInDB.result.length > 0
        )
          return SUCCESS(res, 200, dataMemberInDB.result[0]);
      } else if (config.type == "pg" && result)
        return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  deleteMember: async (req, res) => {
    const id = req.params.id;

    try {
      const { error, result } = await deleteData({
        tablename: tablename,
        primaryKey: { code: id },
      });

      if (error) return ERROR(res, 500, error);
      if (result && result.affectedRows) return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },

  getBookBorrowedMember: async (req, res) => {
    const id = req.params.id;

    try {
      const { error, result } = await getBookBorrowedByMember({ code: id });

      if (error) return ERROR(res, 500, error);
      if (Array.isArray(result) && result.length > 0)
        return SUCCESS(res, 200, result[0]);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },

  getBookBorrowedEachMember: async (req, res) => {
    try {
      const { error, result } = await getBookBorrowedByEachMember();

      if (error) return ERROR(res, 500, error);
      return SUCCESS(res, 200, result);
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },
};
