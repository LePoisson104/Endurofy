const authService = require("../services/authService");

// @desc Signup
// @route POST/auth
// @access Public
const signup = async (req, res) => {
  const userData = ({
    firstName,
    lastName,
    email,
    password,
    gender,
    birthdate,
    height,
    weight,
  } = req.body);

  try {
    await authService.signUp(userData);
    return res.status(200).json({ message: "User Created Successfully!" });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ message: err.message });
  }
};

// @desc Login
// @route POST/auth
// @access Public
const login = async (req, res) => {
  const userData = ({ email, password } = req.body);

  try {
    const accessToken = await authService.logIn(userData, res);
    // Send accessToken containing user information
    res.status(200).json({ message: "Success!", accessToken });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(err.message);
  }
};

// @desc Refresh
// @route GET/auth/refresh
// @acces Public - because access token has expired
const refresh = async (req, res) => {
  const cookies = req.cookies;
  try {
    const accessToken = await authService.refresh(cookies);
    return res.status(200).json({ accessToken });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(err.message);
  }
};

// @desc Logout
// @route POST/auth/refresh
// @acces Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  try {
    authService.logout(cookies, res);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(err.message);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
};
