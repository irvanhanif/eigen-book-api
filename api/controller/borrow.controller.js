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
  createBorrow: async (req, res) => {
    const { book_code, member_code, date_borrow } = req.body;

    try {
      let dataBorrow = {
        book_code: book_code,
        member_code: member_code,
        date_borrow: (Number(new Date(date_borrow).getTime()) / 1000) * 1000,
      };

      await borrowSchema.validateAsync(dataBorrow);

      const checkMemberBorrow = await selectData({
        tablename: tablename,
        primaryKey: { member_code: member_code },
      });
      if (checkMemberBorrow.error)
        return ERROR(res, 500, checkMemberBorrow.error);
      if (checkMemberBorrow.result.length > 1)
        return ERROR(res, 422, "Borrowing books must not exceed 2");

      const checkBookBorrowed = await selectData({
        tablename: "book",
        primaryKey: { code: book_code },
      });
      if (checkBookBorrowed.error)
        return ERROR(res, 500, checkBookBorrowed.error);
      if (checkBookBorrowed.result.length == 0)
        return ERROR(res, 404, `The book with code ${book_code} is not found`);
      if (checkBookBorrowed.result[0].stock == 0)
        return ERROR(res, 200, "The book is empty to borrow");

      const checkMemberNotPenalty = await selectData({
        column: "penalty",
        tablename: "member",
        primaryKey: { code: member_code },
      });
      if (checkMemberNotPenalty.error)
        return ERROR(res, 500, checkMemberNotPenalty.error);
      if (checkMemberNotPenalty.result.length == 0)
        return ERROR(
          res,
          404,
          `The member with code ${member_code} is not found`
        );

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

        if (dataBorrow["date_borrow"] > endPenalty) {
          await updateData({
            tablename: "member",
            primaryKey: { code: member_code },
            data: {
              penalty: 0,
            },
          });
        } else return ERROR(res, 403, "The member has penalty");
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

  getAllBorrowed: async (req, res) => {
    const { error, result } = await selectData({
      tablename: tablename,
    });

    if (error) return ERROR(res, 500, error);
    return SUCCESS(res, 200, result);
  },

  getBorrowed: async (req, res) => {
    const { book_code, member_code } = req.query;

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

      if (config.type == "pg") {
        const { error, result } = await updateData({
          data: dataBorrow,
          tablename: tablename,
          primaryKey: pkBorrow,
        });

        if (error) return ERROR(res, 500, error);
        if (result) return SUCCESS(res, 200, result);
      } else if (config.type == "mysql") {
        const checkBookNewExist = await selectData({
          tablename: "book",
          primaryKey: { code: book_code_new },
        });
        if (checkBookNewExist.error)
          return ERROR(res, 500, checkBookNewExist.error);
        if (checkBookNewExist.result) {
          if (checkBookNewExist.result.length == 0)
            return ERROR(
              res,
              404,
              `The book with code ${book_code_new} is not found`
            );
          if (checkBookNewExist.result[0].stock == 0)
            return ERROR(res, 200, "The book is empty to borrow");
        }
        const checkMemberNewExist = await selectData({
          tablename: "member",
          primaryKey: { code: member_code_new },
        });
        if (checkMemberNewExist.error)
          return ERROR(res, 500, checkMemberNewExist.error);
        if (checkMemberNewExist && checkMemberNewExist.result.length == 0)
          return ERROR(
            res,
            404,
            `The member with code ${member_code_new} is not found`
          );

        const deleteBorrow = await deleteData({
          tablename: tablename,
          primaryKey: pkBorrow,
        });
        if (deleteBorrow.error) return ERROR(res, 500, deleteBorrow.error);

        if (deleteBorrow.result && deleteBorrow.result.affectedRows) {
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
              return SUCCESS(res, 200, dataBorrowInDB.result[0]);
          }
        } else return ERROR(res, 409, "member or book code is incorrect");
      }
      return ERROR(res, 404, "Data not found");
    } catch (error) {
      if (error.details) return ERROR(res, 500, error.details);
    }
  },

  deleteBorrowed: async (req, res) => {
    const { book_code, member_code } = req.body;

    try {
      let pkBorrow = {
        book_code: book_code,
        member_code: member_code,
      };
      await borrowSchema.validateAsync(pkBorrow);

      const { error, result } = await deleteData({
        tablename: tablename,
        primaryKey: pkBorrow,
      });

      if (error) return ERROR(res, 500, error);
      if (result && result.affectedRows) return SUCCESS(res, 200, result);
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      if (err) return ERROR(res, 500, err);
    }
  },

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
        if (removeRecordBorrow.result && removeRecordBorrow.result.affectedRows)
          return SUCCESS(res, 200, removeRecordBorrow.result);
      }
      return ERROR(res, 404, "Data not found");
    } catch (err) {
      return ERROR(res, 500, err);
    }
  },
};
