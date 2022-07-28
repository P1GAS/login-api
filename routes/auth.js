const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");

const signJwt = require("../helpers/signJwt");
const createRefreshTokenCookie = require("../helpers/createRefreshTokenCookie");

const checkToken = require("../middlewares/checkToken");

router.post("/register", async (req, res) => {
  try {
    const { password, email, name, birthdate, gender } = req.body;

    if (!password || !email || !name) {
      return res.status(403).json("Введите эл. адрес, пароль и имя");
    }

    if (password.length < 8) {
      return res.status(403).json("Длина пароля от 8 символов");
    }

    const isEmailTaken = await User.findOne({ email });

    if (isEmailTaken) {
      return res
        .status(403)
        .json("Пользователь с данной почтой уже зарегистрирован");
    }

    if (gender && gender !== "male" && gender !== "female") {
      return res.status(403).json("Введите корректный пол");
    }

    const birthdateToDateFormat = new Date(birthdate).toString();

    if (
      birthdateToDateFormat === "Invalid Date" ||
      birthdateToDateFormat > Date.now()
    ) {
      return res.status(403).json("Введите корректную дату рождения");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      passwordHash,
      email,
      name,
      birthdate,
      gender,
    });

    const savedUser = await newUser.save();

    const accessToken = signJwt.getAccessToken({ id: savedUser._id });
    const refreshToken = signJwt.getRefreshToken({ id: savedUser._id });

    const refreshTokenCookie = createRefreshTokenCookie(refreshToken);

    res.setHeader("Set-Cookie", refreshTokenCookie);

    return res.status(201).json({
      user: savedUser,
      accessToken,
    });
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(403).json("Эл. адрес или пароль не верный");
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(403).json("Эл. адрес или пароль не верный");
    }

    const newAccessToken = signJwt.getAccessToken({ id: user._id });
    const newRefreshToken = signJwt.getRefreshToken({ Id: user._id });

    const refreshTokenCookie = createRefreshTokenCookie(newRefreshToken);

    res.setHeader("Set-Cookie", refreshTokenCookie);

    return res.status(200).json({
      user,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

router.get("/logout", checkToken, async (req, res) => {
  try {
    res.setHeader("Set-Cookie", [
      "refreshToken=; Max-Age=-1; path=/; HttpOnly",
    ]);
    return res.status(200).json("Пользователь успешно разлогинен");
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

module.exports = router;
