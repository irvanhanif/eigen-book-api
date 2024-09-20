module.exports = {
  queryPromise: (connection, query) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
};
