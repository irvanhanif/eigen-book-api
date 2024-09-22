const config = require("../../database/db.config");
const connection = require("../../database/db.connect");
const { queryPromise } = require("../../helper/asyncExecQuery");

module.exports = {
  getBookBorrowedByMember: async (request) => {
    try {
      let result = await queryPromise(
        connection,
        `SELECT member.*, COUNT(borrow.book_code) as borrowed_book 
        FROM member JOIN borrow 
        ON member.code = borrow.member_code 
        WHERE member.code = '${request.code}' 
        HAVING COUNT(borrow.book_code) > 0`
      );

      if (config.type == "pg") result = result.rows;
      return { result: result };
    } catch (error) {
      return { error: error };
    }
  },

  getBookBorrowedByEachMember: async () => {
    try {
      let result = await queryPromise(
        connection,
        `SELECT member.*, COUNT(borrow.book_code) as borrowed_book 
        FROM member LEFT JOIN borrow ON member.code = borrow.member_code 
        GROUP BY member.code`
      );

      if (config.type == "pg") result = result.rows;
      return { result: result };
    } catch (error) {
      return { error: error };
    }
  },
};
