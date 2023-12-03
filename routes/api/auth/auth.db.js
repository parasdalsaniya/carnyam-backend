const crud = require("../../crud");

var test = async () => {
  var sql = `select * from test2`;
  var result = await crud.executeQuery(sql);
  console.log(result);
  return result;
};

const insert = async () => {
  var sql = `Insert into test values ('2','Vivek')`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  test: test,
  insert: insert,
};
