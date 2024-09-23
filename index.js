const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const router = require("./routes/router");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("./config/database");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: '*', // Replace with your client URL if needed
    credentials: true, // Enable credentials to support sessions
}));

// Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Use true if you're using HTTPS, false otherwise
        maxAge: 3600000 // 1 hour session expiry
    }
}));

// Set up routes
app.use(router);

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Twilio OTP sending function
const twilioClient = require("./config/twilio");

const sendOtp = (phoneNumber, otp) => {
    twilioClient.messages
        .create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        })
        .then(() => {
            io.emit("otpSent", { phoneNumber, otp }); // Emit OTP event through WebSocket
        })
        .catch((error) => {
            console.error("Error sending OTP:", error);
        });
};

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});