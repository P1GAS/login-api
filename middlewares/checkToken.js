const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
  try {
    if (!req.headers?.authorization) {
      return res.status(401).json("Вы не аутентифицированны");
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401).json("Вы не аутентифицированны");
    }

    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);

    req.user = user;

    return next();
  } catch (err) {
    if (err.message === "invalid signature") {
      return res.status(401).json("Вы не аутентифицированны");
    }

    if (err.message === "jwt expired") {
      return res.status(401).json("Токен доступа истёк");
    }

    return res.status(500).json("Ошибка сервера");
  }
};

module.exports = checkToken;
