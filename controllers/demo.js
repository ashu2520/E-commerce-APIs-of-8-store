const db = require("../config/database.js");

async function demo(req, res) {
    try {
        res.status(200).send("Demo response");
    } catch (err) {
        res.status(500).send("Server error");
    }
}
module.exports = demo;