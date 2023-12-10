const userModule = require("./users.module");

const getUserDetailController = async (req, res) => {
  console.log("AuthForgotContoller");
  const result = await userModule.getUserDetailModule(req);
  return res.send(result);
};

module.exports = {
    getUserDetailController: getUserDetailController,
};
