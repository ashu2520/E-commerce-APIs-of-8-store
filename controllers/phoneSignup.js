const db = require('../config/database');
const twilioClient = require('../config/twilio');
const crypto = require('crypto');

async function submitPhoneNumber(req, res) {
    let { phoneNumber } = req.body;

    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber || phoneNumber.length < 10) {
        return res.status(400).json({ message: 'Invalid phone number' });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); 

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE user_phone_number = ?', [phoneNumber]);
        let userId;
        if (rows.length > 0) {
            userId = rows[0].user_id; 
        } else {
            const [result] = await db.query('INSERT INTO users (user_phone_number) VALUES (?)', [phoneNumber]);
            console.log('Insert Result:', result); 
            userId = result.insertId; // Get the inserted user's ID
            if (!userId) {
                throw new Error('Failed to retrieve inserted user ID');
            }
        }

        req.session.userId = userId;    // Store the user_id in the session

        await db.query('INSERT INTO users_otp (user_id, otp) VALUES (?, ?)', [userId, otp]);

        if (!phoneNumber.startsWith('+91')) {
            phoneNumber = `+91${phoneNumber}`; // Add +91 prefix
        }

        // Send the OTP via Twilio
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        
        // Respond to the client
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error processing phone number:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { submitPhoneNumber };