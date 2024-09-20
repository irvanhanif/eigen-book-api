const { queryPromise } = require("../helper/asyncExecQuery");
const config = require("./db.config");
const connection = require("./db.connect");
let query = "";

const isExistTable = async (tablename) => {
  query = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_name = '${tablename}') as exist_table;`;
  let existTable = await queryPromise(connection, query);

  if (config.type == "pg") {
    existTable = existTable.rows[0];
  } else if (config.type == "mysql") {
    existTable = existTable[0];
  }
  return existTable.exist_table;
};

module.exports = {
  insertData: async (request) => {
    // SET DATA ON QUERY
    let keyData = "",
      valueData = "";

    if (typeof request.data === "object" && !Array.isArray(request.data)) {
      const keyValues = Object.keys(request.data);
      keyValues.map((keyValue) => {
        keyData +=
          keyValue +
          (keyValues.indexOf(keyValue) < keyValues.length - 1 ? ", " : "");
      });

      const valuesData = Object.values(request.data);
      valuesData.map((value) => {
        valueData +=
          `'${value}'` +
          (valuesData.indexOf(value) < valuesData.length - 1 ? ", " : "");
      });
    }

    try {
      if (!(await isExistTable(request.tablename)))
        return { error: "Table isnt Exist" };

      // INSERT DATA TO DATABASE
      if (keyData != "" && valueData != "") {
        let result = await queryPromise(
          connection,
          `INSERT INTO ${
            request.tablename
          } (${keyData}) VALUES (${valueData}) ${
            config.type == "pg" ? "RETURNING *" : ""
          }`
        );

        // RETURNING RESULT
        if (config.type == "pg") result = result.rows[0];
        else if (config.type == "mysql")
          result = {
            affectedRows: result.affectedRows,
            insertId: result.insertId,
          };
        return { result: result };
      }
    } catch (error) {
      return { error: error };
    }
  },

  selectData: async (request) => {
    let pkSelect = "",
      colSelect = "";

    // SET QUERY FOR KEY SEARCH
    if (
      typeof request.primaryKey === "object" &&
      !Array.isArray(request.primaryKey)
    ) {
      const pkValues = Object.keys(request.primaryKey);
      pkValues.map((pk) => {
        pkSelect +=
          pk +
          " = '" +
          request.primaryKey[pk] +
          (pkValues.indexOf(pk) < pkValues.length - 1 ? "' AND " : "'");
      });
    }

    // SET FIELD TO RETURN
    if (request.column) {
      let column = !Array.isArray(request.column)
        ? [request.column]
        : request.column;
      column.map((col) => {
        colSelect +=
          col + (column.indexOf(col) < column.length - 1 ? ", " : "");
      });
    } else colSelect += "*";

    // SET FUNC TO FIELD
    if (typeof request.func === "object" && !Array.isArray(request.func)) {
      const funcSQL = request.func;
      const keyOfFuncSQL = Object.keys(request.func);
      keyOfFuncSQL.map((keyFunc) => {
        switch (keyFunc) {
          case "sum":
            let columnToSum = !Array.isArray(funcSQL[keyFunc])
              ? [funcSQL[keyFunc]]
              : funcSQL[keyFunc];
            let querySum = "";
            columnToSum.map((colFunc) => {
              querySum += `SUM(${colFunc}) AS SUM_${colFunc.toUpperCase()}${
                columnToSum.indexOf(colFunc) < columnToSum.length - 1
                  ? ", "
                  : ""
              }`;
            });

            if (colSelect == "*") colSelect = querySum;
            else colSelect += `, ${querySum}`;
            break;
        }
      });
    }

    // SET WHERE CLAUSE IN QUERY
    if (typeof request.where === "object" && !Array.isArray(request.where)) {
      const whereValues = Object.keys(request.where);
      if (whereValues.length > 0 && pkSelect != "") pkSelect += " AND ";
      whereValues.map((whr) => {
        let operator = "=";
        if (request.where[whr].includes(">")) operator = ">";
        if (request.where[whr].includes("<")) operator = "<";
        pkSelect +=
          whr +
          ` ${operator} '` +
          request.where[whr].replace(/[<>]/, "").trim() +
          (whereValues.indexOf(whr) < whereValues.length - 1 ? "' AND " : "'");
      });
    }

    try {
      if (!(await isExistTable(request.tablename)))
        return { error: "Table isnt Exist" };

      let result = await queryPromise(
        connection,
        `SELECT ${colSelect} FROM ${request.tablename}${
          pkSelect != "" ? " WHERE " + pkSelect : ""
        }`
      );

      if (config.type == "pg") result = result.rows;
      return { result: result };
    } catch (error) {
      return { error: error };
    }
  },

  updateData: async (request) => {
    // SET DATA ON QUERY
    let valueUpdate = "",
      pkUpdate = "";

    if (typeof request.data === "object" && !Array.isArray(request.data)) {
      const keyValues = Object.keys(request.data);
      keyValues.map((keyValue) => {
        valueUpdate +=
          keyValue +
          " = '" +
          request.data[keyValue] +
          (keyValues.indexOf(keyValue) < keyValues.length - 1 ? "', " : "'");
      });
    }

    if (
      typeof request.primaryKey === "object" &&
      !Array.isArray(request.primaryKey)
    ) {
      const pkValues = Object.keys(request.primaryKey);
      pkValues.map((pk) => {
        pkUpdate +=
          pk +
          " = '" +
          request.primaryKey[pk] +
          (pkValues.indexOf(pk) < pkValues.length - 1 ? "' AND " : "'");
      });
    }

    try {
      if (!(await isExistTable(request.tablename)))
        return { error: "Table isnt Exist" };

      // UPDATE DATA TO DATABASE
      if (valueUpdate != "" && request.primaryKey) {
        let result = await queryPromise(
          connection,
          `UPDATE ${request.tablename} SET ${valueUpdate} WHERE ${pkUpdate} ${
            config.type == "pg" ? "RETURNING *" : ""
          }`
        );

        // RETURNING RESULT
        if (config.type == "pg") result = result.rows[0];
        else if (config.type == "mysql")
          result = {
            affectedRows: result.affectedRows,
            info: result.info,
          };
        return { result: result };
      }
    } catch (error) {
      return { error: error };
    }
  },

  deleteData: async (request) => {
    // SET DATA ON QUERY
    let pkDelete = "";

    if (
      typeof request.primaryKey === "object" &&
      !Array.isArray(request.primaryKey)
    ) {
      const pkValues = Object.keys(request.primaryKey);
      pkValues.map((pk) => {
        pkDelete +=
          pk +
          " = '" +
          request.primaryKey[pk] +
          (pkValues.indexOf(pk) < pkValues.length - 1 ? "' AND " : "'");
      });
    }

    try {
      if (!(await isExistTable(request.tablename)))
        return { error: "Table isnt Exist" };

      let result = await queryPromise(
        connection,
        `DELETE FROM ${request.tablename} WHERE ${pkDelete}`
      );

      if (config.type == "pg") result = result.rowCount;
      if (config.type == "mysql") result = result.affectedRows;
      return { result: { affectedRows: result } };
    } catch (error) {
      return { error: error };
    }
  },
};
