const config = require("../../database/db.config");
const {
  insertData,
  selectData,
  updateData,
  deleteData,
} = require("../../database/db.query");
const { borrowSchema } = require("../../helper/joiSchema");
const { ERROR, SUCCESS } = require("../../helper/response");
const tablename = "borrow";

module.exports = {
  /**
   * @swagger
   * /borrow:
   *  post:
   *    summary: to create borrow data in borrow table
   *    description:
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/borrow'
   *    responses:
   *      201:
   *        description: result of success create borrow data
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: string
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    book_code:
   *                      type: string
   *                      example: "NRN-7"
   *                    member_code:
   *                      type: string
   *                      example: "M004"
   *                    date_borrow:
   *                      type: string
   *                      format: date
   *                      example: "1726790400000"
   */

  createBorrow: async (req, res) => {
    const { book_code, member_code, date_borrow } = req.body;

    try {
      let dataBorrow = {
        book_code: book_code,
        member_code: member_code,
        date_borrow: (Number(new Date(date_borrow).getTime()) / 1000) * 1000,
      };

      await borrowSchema.validateAsync(dataBorrow);
      dataBorrow["date_borrow"] = date_borrow;

      const checkMemberBorrow = await selectData({
        tablename: tablename,
        primaryKey: { member_code: member_code },
      });
      if (checkMemberBorrow.error)
        return ERROR(res, 500, checkMemberBorrow.error);
      if (checkMemberBorrow.result.length > 2)
        return ERROR(res, 400, "Borrow books will be more than 2");

      const checkBookBorrowed = await selectData({
        tablename: "book",
        primaryKey: { code: book_code },
      });
      if (checkBookBorrowed.error)
        return ERROR(res, 500, checkBookBorrowed.error);
      if (checkBookBorrowed.result[0].stock == 0)
        return ERROR(res, 400, "The books is empty to borrow");

      const checkMemberNotPenalty = await selectData({
        column: "penalty",
        tablename: "member",
        primaryKey: { code: member_code },
      });
      if (checkMemberNotPenalty.error)
        return ERROR(res, 500, checkMemberNotPenalty.error);

      if (
        checkMemberNotPenalty.result &&
        checkMemberNotPenalty.result[0].penalty != null &&
        Number(checkMemberNotPenalty.result[0].penalty) > 0
      ) {
        let date = Number(checkMemberNotPenalty.result[0].penalty);
        if (date.toString().length < 13) date *= 1000;

        let endPenalty =
          new Date(
            new Date(date).setDate(new Date(date).getDate() + 3)
          ).getTime() / 1000;
        let thisDay = Math.floor(new Date().getTime() / 1000.0);

        if (thisDay > endPenalty) {
          await updateData({
            tablename: "member",
            primaryKey: { code: member_code },
            data: {
              penalty: 0,
            },
          });
        } else return ERROR(res, 400, "The member has penalty");
      }

      const { error, result } = await insertData({
        data: dataBorrow,
        tablename: tablename,
      });
      if (error) return ERROR(res, 500, error);

      if (config.type == "mysql") {
        const dataBorrowInDB = await selectData({
          tablename: tablename,
          primaryKey: {
            book_code: book_code,
            member_code: member_code,
          },
        });
        if (dataBorrowInDB.error) return ERROR(res, 500, dataBorrowInDB.error);

        if (
          Array.isArray(dataBorrowInDB.result) &&
          dataBorrowInDB.result.length > 0
        )
          return SUCCESS(res, 201, dataBorrowInDB.result[0]);
      } else if (config.type == "pg") return SUCCESS(res, 201, result);
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  /**
   * @swagger
   * /borrow:
   *  get:
   *    summary: to get all data from borrow table
   *    description: This api will return all of data in borrow table.
   *    responses:
   *      200:
   *        description: return all borrow data
   */

  getAllBorrowed: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

  /**
   * @swagger
   * /borrow/:
   *  get:
   *    summary: to get detail data from borrow table
   *    description: This api will return detail data from borrow table with the primary key to pointing data.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              book_code:
   *                type: string
   *                example: "NRN-7"
   *              member_code:
   *                type: string
   *                example: "M004"
   *    responses:
   *      200:
   *        description:
   */

  getBorrowed: async (req, res) => {
    const { book_code, member_code } = req.body;

    try {
      let pkBorrow = {
        book_code: book_code,
        member_code: member_code,
      };
      await borrowSchema.validateAsync(pkBorrow);

      const { error, result } = await selectData({
        tablename: tablename,
        primaryKey: pkBorrow,
      });

      if (error) return ERROR(res, 500, error);
      if (Array.isArray(result) && result.length > 0)
        return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },

  /**
   * @swagger
   * /borrow:
   *  put:
   *    summary: to change data borrow from borrow table
   *    description: This api will changing detail data from borrow table with the primary key to pointing data.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#components/schemas/borrow'
   *    responses:
   *      200:
   *        description: return detail data borrow
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: string
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    book_code:
   *                      type: string
   *                      example: "NRN-7"
   *                    member_code:
   *                      type: string
   *                      example: "M004"
   *                    date_borrow:
   *                      type: string
   *                      format: date
   *                      example: "1726790400000"
   */

  updateBorrowed: async (req, res) => {
    const {
      book_code_new,
      member_code_new,
      book_code,
      member_code,
      date_borrow,
    } = req.body;

    try {
      let pkBorrow = {
        book_code: book_code,
        member_code: member_code,
      };
      let dataBorrow = {
        book_code: book_code_new ?? book_code,
        member_code: member_code_new ?? member_code,
        date_borrow: (Number(new Date(date_borrow).getTime()) / 1000) * 1000,
      };

      await borrowSchema.validateAsync(dataBorrow);
      await borrowSchema.validateAsync(pkBorrow);
      dataBorrow["date_borrow"] = date_borrow;

      if (config.type == "pg") {
        const { error, result } = await updateData({
          data: dataBorrow,
          tablename: tablename,
          primaryKey: pkBorrow,
        });

        if (error) return ERROR(res, 500, error);
        if (result) return SUCCESS(res, 200, result);
      } else if (config.type == "mysql") {
        const deleteBorrow = await deleteData({
          tablename: tablename,
          primaryKey: pkBorrow,
        });
        if (deleteBorrow.error) return ERROR(res, 500, deleteBorrow.error);

        if (deleteBorrow.result) {
          const createBorrow = await insertData({
            data: dataBorrow,
            tablename: tablename,
          });
          if (createBorrow.error) return ERROR(res, 500, createBorrow.error);

          if (createBorrow.result) {
            const dataBorrowInDB = await selectData({
              tablename: tablename,
              primaryKey: {
                book_code: dataBorrow["book_code"],
                member_code: dataBorrow["member_code"],
              },
            });
            if (dataBorrowInDB.error)
              return ERROR(res, 500, dataBorrowInDB.error);

            if (
              Array.isArray(dataBorrowInDB.result) &&
              dataBorrowInDB.result.length > 0
            )
              return SUCCESS(res, 201, dataBorrowInDB.result[0]);
          }
        }
      }
      return ERROR(res, 404, "Data not found");
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  /**
   * @swagger
   * /borrow:
   *  delete:
   *    summary: to delete data from borrow table
   *    description: This api will remove data from book table with the primary key to pointing data.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              book_code:
   *                type: string
   *                example: "NRN-7"
   *              member_code:
   *                type: string
   *                example: "M004"
   *    responses:
   *      200:
   *        description: Success to delete data from borrow table
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: string
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    affectedRows:
   *                      type: integer
   *                      example: 1
   */

  deleteBorrowed: async (req, res) => {
    const { book_code, member_code } = req.body;

    try {
      let pkBorrow = {
        book_code: book_code,
        member_code: member_code,
      };
      await borrowSchema.validateAsync(pkBorrow);

      const { err, result } = await deleteData({
        tablename: tablename,
        primaryKey: pkBorrow,
      });

      if (err) return ERROR(res, 500, err);
      if (result) return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (error) {
      if (error) return ERROR(res, 500, error);
    }
  },

  /**
   * @swagger
   * /return:
   *  delete:
   *    summary: to handling return book from borrow table
   *    description: This api will remove data from book table and handling the penalty with the primary key to pointing data.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              book_code:
   *                type: string
   *                example: "NRN-7"
   *              member_code:
   *                type: string
   *                example: "M004"
   *    responses:
   *      200:
   *        description: Success to delete data from borrow table
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: string
   *                  example: true
   *                data:
   *                  type: object
   *                  properties:
   *                    affectedRows:
   *                      type: integer
   *                      example: 1
   */

  returnBook: async (req, res) => {
    const { book_code, member_code } = req.body;

    try {
      let pkBorrow = {
        book_code: book_code,
        member_code: member_code,
      };

      await borrowSchema.validateAsync(pkBorrow);

      const selectBook = await selectData({
        tablename: tablename,
        primaryKey: pkBorrow,
      });
      if (selectBook.error) return ERROR(res, 500, selectBook.error);

      if (selectBook.result.length > 0) {
        let date = Number(selectBook.result[0].date_borrow);
        if (date.toString().length < 13) date *= 1000;

        let newDate =
          new Date(
            new Date(date).setDate(new Date(date).getDate() + 7)
          ).getTime() / 1000;
        let thisDay = Math.floor(new Date().getTime() / 1000.0);

        if (thisDay > newDate) {
          const setPenalty = await updateData({
            tablename: "member",
            primaryKey: { code: member_code },
            data: {
              penalty: thisDay * 1000,
            },
          });
          if (setPenalty.error) return ERROR(res, 500, setPenalty.error);
        }

        const removeRecordBorrow = await deleteData({
          tablename: tablename,
          primaryKey: pkBorrow,
        });

        if (removeRecordBorrow.error)
          return ERROR(res, 500, removeRecordBorrow.error);
        return SUCCESS(res, 200, removeRecordBorrow.result);
      }
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      return ERROR(res, 500, err);
    }
  },
};
