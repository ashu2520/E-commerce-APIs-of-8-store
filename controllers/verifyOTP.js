const db = require('../config/database');

async function verifyOtp(req, res) {
    let { otp } = req.body;

    const userId = req.session.userId; // Retrieve the user ID from the session

    if (!otp || otp.length !== 6) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
    otp = parseInt(otp);
    try {
        // Check if the OTP exists and is within the last 5 minutes
        const otpQuery = `
            SELECT * 
            FROM users_otp 
            WHERE user_id = ? AND otp = ? AND TIMESTAMPDIFF(SECOND, created_at, NOW()) <= 300
            ORDER BY created_at DESC
            LIMIT 1;
        `;

        const [otpRows] = await db.query(otpQuery, [userId, otp]);

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await db.query('DELETE FROM users_otp WHERE user_id = ? AND otp = ?', [userId, otp]);
        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { verifyOtp };