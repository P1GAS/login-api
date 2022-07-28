const jwt = require("jsonwebtoken");

const getAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {
    expiresIn: "30m",
  });

const getRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: "30d",
  });

module.exports = {
  getAccessToken: getAccessToken,
  getRefreshToken: getRefreshToken,
};
