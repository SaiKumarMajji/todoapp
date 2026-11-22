const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,                              // JS cannot read it
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 days, matches JWT expiry
  });
};

module.exports = { setTokenCookie };