const client = require("../connection/database.js");
console.log("crud");
module.exports.executeQuery = async (que) => {
  console.log("timestamp---->" + new Date());
  //query=escape(query);
  console.log(que);
  var obj = {};
  try {
    console.log("entered");
    var res = await client.query(que);
    console.log("entered");
    obj = {
      status: true,
      data: res.rows,
    };
  } catch (err) {
    console.log("err");
    console.log(err);
    obj = {
      status: false,
      data: [],
    };
  }
  // console.log(res)
  return obj;
};

module.exports.makeInsertQueryString = async (
  tablename,
  valueArr,
  flagReturnAll
) => {
  try {
    var sql = "";
    var values = valueArr
      .map((obj) => {
        if (typeof obj.value == "boolean") {
          if (obj.value == undefined) return "NULL";
          return obj.value;
        }
        if (obj.value == null || obj.value == undefined || obj.value == "") {
          return "NULL";
        } else if (typeof obj.value == "string") {
          return "'" + obj.value.replace(/'/gi, "''") + "'";
        } else {
          return obj.value;
        }
      })
      .join(",");
    if (flagReturnAll) {
      sql = `INSERT INTO ${tablename}(${valueArr
        .map((obj) => obj.field)
        .join(",")}) VALUES (${values}) Returning *;`;
    } else {
      sql = `INSERT INTO ${tablename}(${valueArr
        .map((obj) => obj.field)
        .join(",")}) VALUES (${values});`;
    }
    console.log("entered");
    console.log(sql);
    var res = await client.query(sql);
    console.log("entered");
    obj = {
      status: true,
      data: res.rows,
    };
  } catch (err) {
    console.log("err");
    console.log(err);
    obj = {
      status: false,
      data: [],
    };
  }
  return obj;
};

module.exports.makeUpdateQueryString = (table_name, valueArr, conditions) => {
  var sql = `UPDATE ${table_name} SET `;

  var str = valueArr
    .map((obj) => {
      if (typeof obj.value == "string") {
        return obj.field + "='" + obj.value + "'";
      } else {
        return obj.field + "=" + obj.value;
      }
    })
    .join(",");
  sql += str;
  sql = sql + " WHERE " + conditions;
  return sql;
};

module.exports.makeDeleteQueryString = (table_name, conditions) => {
  return `DELETE FROM ${table_name} WHERE ${conditions}`;
};

module.exports.test = async (data) => {
  console.log(data);
  return { status: data };
};
