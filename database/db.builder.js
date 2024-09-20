const path = require("path");
const fs = require("fs");
require("dotenv").config();
const connection = require("./db.connect");
const { queryPromise } = require("../helper/asyncExecQuery");
const db_type = require("./db.config").type;

//get query from sql
const readFileSQL = (filename) => {
  return fs
    .readFileSync(path.join(__dirname, filename), {
      encoding: "utf-8",
    })
    .split(";\r\n");
};

let schema = readFileSQL("schema.sql");
let triggerQuery = [];
if (db_type == "mysql") triggerQuery = readFileSQL("myTrigger.sql");
else if (db_type == "pg") triggerQuery = readFileSQL("pgTrigger.sql");

// process
console.log("Database is importing field");
(async () => {
  let errBuild = [];
  const runQuery = async (query) => {
    for (let i = 0; i < query.length; i++) {
      if (query[i].length !== 0 && !query[i].match(/\/\*/)) {
        try {
          if (db_type == "pg" && query[i].includes("AUTO_INCREMENT")) {
            query[i] = query[i].replace("INT AUTO_INCREMENT", "SERIAL");
          }
          await queryPromise(connection, query[i]);
        } catch (error) {
          if (db_type == "pg") errBuild.push(error.message);
          if (db_type == "mysql") errBuild.push(error.sqlMessage);
        }
      }
    }
  };

  await runQuery(schema);
  await runQuery(triggerQuery);

  console.log("Database has been imported");
  if (errBuild.length > 0)
    console.log(
      "With list to be warn: ",
      errBuild.map((err, i) => {
        return i + 1 + "." + err;
      })
    );
  process.exit();
})();
