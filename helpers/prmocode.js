const crud = require("../routes/crud");

var promocodeObj = [
  { field: "promocode_name", value: "TEST" },
  { field: "promocode", value: "123" },
  { field: "flag_used", value: false },
  { field: "prise", value: "10" },
  { field: "percentage", value: null },
  { field: "flag_percentage", value: false },
  { field: "flag_deleted", value: false },
  { field: "timestamp", value: "2023-01-01" },
];

const createPromoCode = async (promocodeObj) => {
  var result = await crud.makeInsertQueryString("promocode", promocodeObj,true);
  return result
};

const getPrmocode = async(promocode) => {
    promocode =  promocode.replaceall(promocode)
    const result = await crud.executeQuery(`select * from promocode where promocode = '${promocode}' and flag_deleted = false and flag_used = false`)
    return result
}

module.exports = {
    createPromoCode:createPromoCode,
    getPrmocode:getPrmocode
}