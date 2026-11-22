const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,                              // JS cannot read it
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 days, matches JWT expiry
  });
};

module.exports = { setTokenCookie };