const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route("/").get(userController.getAllUsers);
router.patch("/account/:userId", userController.updateUserAccount);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
