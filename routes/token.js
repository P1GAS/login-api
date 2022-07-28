const router = require("express").Router();

const jwt = require("jsonwebtoken");

const signJwt = require("../helpers/signJwt");
const createCookie = require("../helpers/createRefreshTokenCookie");

router.get("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json("You are not authenticated");
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      async (err) => {
        if (err) {
          return res.status(401).json("Refresh Token is expired");
        }

        const decodedJwt = jwt.decode(refreshToken);
        const userId = decodedJwt.id;

        const newAccessToken = signJwt.getAccessToken({
          id: userId,
        });
        const newRefreshToken = signJwt.getRefreshToken({
          id: userId,
        });

        const refreshTokenCookie = createCookie(newRefreshToken);

        res.setHeader("Set-Cookie", refreshTokenCookie);

        return res.status(200).json({
          accessToken: newAccessToken,
        });
      }
    );
  } catch (err) {
    return res.status(500).json("Ошибка сервера");
  }
});

module.exports = router;
