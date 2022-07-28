const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");

const checkToken = require("../middlewares/checkToken");
const upload = require("../middlewares/upload");

const { PORT } = process.env;

router.patch("/update", checkToken, async (req, res) => {
  try {
    const { body } = req;
    const userId = req.user.id;

    const { name, prevPassword, newPassword } = body;

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      return res.status(404).json("Пользователь не найден");
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (newPassword) {
      const validPassword = await bcrypt.compare(
        prevPassword,
        user.passwordHash
      );

      if (!validPassword) {
        return res.status(403).json("Предыдущий пароль не верный");
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(body.newPassword, salt);
      user.passwordHash = passwordHash;
    }

    const updatedUser = await user.save();
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

router.patch(
  "/update/avatar",
  checkToken,
  upload.single("avatar"),
  async (req, res) => {
    const { filename } = req.file;
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      user.avatarUrl = `http://localhost:${PORT}/uploads/${filename}`;

      if (!user) {
        return res.status(404).json("Пользователь не найден");
      }

      const updatedUser = await user.save();
      return res.status(200).json({ user: updatedUser });
    } catch (err) {
      return res.status(500).json("Ошибка сервера");
    }
  }
);

router.get("/", checkToken, async (_req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/me", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("Пользователь не найден");
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

module.exports = router;
