const createRefreshTokenCookie = (data) => {
  return "refreshToken=" + data + "; Max-Age=2,592e+9; path=/; HttpOnly";
};

module.exports = createRefreshTokenCookie;
