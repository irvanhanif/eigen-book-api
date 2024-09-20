const config = require("../../database/db.config");
const {
  insertData,
  selectData,
  deleteData,
  updateData,
} = require("../../database/db.query");
const { memberSchema } = require("../../helper/joiSchema");
const { ERROR, SUCCESS } = require("../../helper/response");
const { getBookBorrowedByMember } = require("../services/book.service");
const tablename = "member";

module.exports = {
  /**
   * @swagger
   * /member:
   *  post:
   *    summary: to create member in member table
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
   *                example: "M004"
   *              name:
   *                type: string
   *                example: "Juki"
   *    responses:
   *      201:
   *        description: result of success create member
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
   *                      example: "M004"
   *                    name:
   *                      type: string
   *                      example: "Juki"
   *                    penalty:
   *                      type: string
   *                      example: "null"
   */

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
      if (error) return ERROR(res, 500, error);

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

  /**
   * @swagger
   * /member:
   *  get:
   *    summary: to get all data from member table
   *    description: This api will return all of data in member table.
   *    responses:
   *      200:
   *        description: return all member
   */

  getAllMembers: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

  /**
   * @swagger
   * /member/{id}:
   *  get:
   *    summary: to get data by ID from member table
   *    description: This api will return detail data from member table with the primary key to pointing data.
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: ID required
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: return detail data member
   */

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
      return SUCCESS(res, 200, result);
    return ERROR(res, 404, "Data not found");
  },

  /**
   * @swagger
   * /member/{id}:
   *  put:
   *    summary: to change data member by ID from member table
   *    description: This api will changing detail data from member table with the primary key to pointing data.
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
   *            $ref: '#components/schemas/member'
   *    responses:
   *      200:
   *        description: return detail data member
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
   *                      example: "M004"
   *                    name:
   *                      type: string
   *                      example: "Juki"
   *                    penalty:
   *                      type: string
   *                      format: date
   *                      example: "1726790400000"
   */

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

  /**
   * @swagger
   * /member/{id}:
   *  delete:
   *    summary: to delete data by ID from member table
   *    description: This api will remove data from member table with the primary key to pointing data.
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: ID required
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: success delete data member
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

  deleteMember: async (req, res) => {
    const id = req.params.id;

    try {
      const { error, result } = await deleteData({
        tablename: tablename,
        primaryKey: { code: id },
      });

      if (error) return ERROR(res, 500, error);
      if (result.affectedRows) return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },

  /**
   * @swagger
   * /member/{id}/borrow:
   *  get:
   *    summary: get data book brought by member ID
   *    description: This api will return detail data all books which brought by member with the primary key (code) from member table to pointing data.
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

  getBookBorrowedMember: async (req, res) => {
    const id = req.params.id;

    try {
      const { error, result } = await getBookBorrowedByMember({ code: id });

      if (error) return ERROR(res, 500, error);
      if (Array.isArray(result) && result.length > 0)
        return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },
};
