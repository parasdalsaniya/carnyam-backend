const crud = require("../../crud");

const createUser = async ({name, email, password, mobile, gender, profileImage, timestamp, authId}) => {
  const auth = authId ? `'${authId}'` : null;
  var sql = `INSERT INTO public."user"(
    user_name, user_email, user_password, user_mobile_number, gender_id, storage_id, "timestamp", oauth_id)
    VALUES ('${name}', '${email}', '${password}', '${mobile}', '${gender}', '${profileImage}', '${timestamp}', ${auth}) returning *;`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getUser = async (params) => {
  let sql = `SELECT * FROM public."user" WHERE flag_deleted=false AND history_id IS NULL`;

  if (params) {
    sql += ` AND (`;

    let conditions = [];
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          conditions.push(` ${key} = '${value}'`);
        }
      }
    }

    sql += conditions.join(' AND ');
    sql += `)`;
  }

  sql += ';';

  const result = await crud.executeQuery(sql);
  return result;
};


const updateUser = async ({ email, mobile }, updatedFields) => {
  let sql = `UPDATE public."user" SET`;

  const updateFields = [];
  for (const key in updatedFields) {
    if (Object.prototype.hasOwnProperty.call(updatedFields, key)) 
      updateFields.push(`${key} = '${updatedFields[key]}'`);
  }

  sql += ` ${updateFields.join(', ')} WHERE (user_email='${email || ''}' OR user_mobile_number='${mobile || ''}') AND flag_deleted=false AND history_id IS NULL RETURNING *;`;

  const result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  createUser,
  getUser,
  updateUser,
};
