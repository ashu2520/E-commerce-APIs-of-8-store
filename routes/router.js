const express = require("express");
const router = express.Router();
const demo = require("../controllers/demo");
const { submitPhoneNumber } = require("../controllers/phonesignup");
const { verifyOtp } = require("../controllers/verifyOTP");

// router.get("/", demo);
router.post("/api/submit-phone", submitPhoneNumber);
router.post("/api/verify-otp", verifyOtp);

module.exports = router;