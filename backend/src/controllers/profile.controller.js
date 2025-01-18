const jwt = require('jsonwebtoken')
const db = require('../lib/db');
const uploadPhoto = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.redirect('/login');
    }
    try {
        const email = jwt.decode(token, process.env.JWT_SECRET).userName;
        const query = `UPDATE users SET display_picture = ? WHERE email = ?`;
        const photo = req.file.buffer;

        db.query(query, [photo, email], (err, result) => {
            if (err) {
                console.error('Error uploading photo:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.redirect('/profile');
        });

    } catch (error) {
        console.error('Error uploading photo:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = { uploadPhoto };