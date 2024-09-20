const db_conf = require("./db.config");
let connection = null;

try {
  if (!db_conf.type) console.log("database type is not defined");
  else {
    if (db_conf.type === "pg") {
      const Pool = require("pg").Pool;
      connection = new Pool(db_conf.db);
    } else if (db_conf.type === "mysql") {
      const mysql = require("mysql2");
      connection = mysql.createConnection(db_conf.db);
    }
    connection.query("SELECT 1 + 1 AS SOLUTION", (err) => {
      if (err) {
        console.log({ message: "database cant connected", error: err });
        process.exit();
      }
    });
    console.log("database is connected");
  }
} catch (error) {
  if (error) console.log({ message: "database cant connected", error: error });
}

module.exports = connection;
