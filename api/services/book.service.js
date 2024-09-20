const connection = require("../../database/db.connect");
const { queryPromise } = require("../../helper/asyncExecQuery");

module.exports = {
  getBookBorrowedByMember: async (request) => {
    try {
      let result = await queryPromise(
        connection,
        `SELECT member.*, COUNT(borrow.book_code) as borrowed_book FROM member JOIN borrow ON member.code = borrow.member_code WHERE member.code = '${request.code}'`
      );

      return { result: result };
    } catch (error) {
      return { error: error };
    }
  },
};
