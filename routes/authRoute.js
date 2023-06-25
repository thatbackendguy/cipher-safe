const express = require("express");
const { createUser, loginUser, logout } = require("../controller/userCtrl");


//initializing router
const router = express.Router();

// Routes
router.post("/register",createUser);
router.post("/login",loginUser);
router.get("/logout",logout);

module.exports = router;