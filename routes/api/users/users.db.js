const crud = require("../../crud");

const getUserDetailbyUserId = async (userId) => {
  var sql = `select * from public.user where user_id = '1' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = { getUserDetailbyUserId };
