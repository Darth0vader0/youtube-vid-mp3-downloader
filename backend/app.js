const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const app = express();
const port = 3001;
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "music_app"
});
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../public')); // Serve static files

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile("C:/nodeApp/public/layouts.html");
});
app.get('/login', (req, res) => {
    res.sendFile("C:/nodeApp/public/login.html");
});
app.get('/signup', (req, res) => {
    res.sendFile("C:/nodeApp/public/signup.html");
});


// Signup endpoint
app.post('/signup', async (req, res) => {
    const { email, password, profile_name, day, month, year, gender } = req.body;
    console.log(req.body);
    q = `SELECT * FROM users WHERE email = '${email}'`;
    db.query(q, async (err, result) => {
        if (err) {
            console.error('Error checking for existing user:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (result.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        if (!email || !password || !profile_name || !day || !month || !year || !gender) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const date_of_birth = `${year}-${month}-${day}`;

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // SQL query to insert user data
            const query = `
            INSERT INTO users (email, password, profile_name, date_of_birth, gender) 
            VALUES (?, ?, ?, ?, ?)
        `;
            db.query(query, [email, hashedPassword, profile_name, date_of_birth, gender], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            });
        } catch (error) {
            console.error('Error during signup:', error.message);
            res.status(500).json({ message: 'Something went wrong' });
        }
    });
    // Validate fields


    // Combine day, month, year into a date

});


// Function to search YouTube
async function searchYouTube(query) {
    const youtube = google.youtube('v3');
    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: query + ' official video',
            type: 'video',
            maxResults: 5,
            key: 'AIzaSyAW8W9AjxXvLY8fbK9HjDI3cs2BdFR-BVc',
        });

        // Create an array of objects
        const results = response.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        return results;
    } catch (error) {
        console.error('Error while fetching YouTube search results:', error.message);
        return [];
    }
}
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'))
})
app.get('/fetch-data', async (req, res) => {
    try {
        const query = req.query.q || "never gonna give up";
        const results = await searchYouTube(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching YouTube data' });
    }
});

// API Endpoint: Download YouTube video as MP3
app.post('/download', (req, res) => {
    const videoUrl = req.body.url;
    const vidTitle = req.body.title;
    const uniqueFileName = `audio_${vidTitle}.mp3`;
    const mp3Path = path.join(__dirname, 'downloads', uniqueFileName);

    const command = `yt-dlp -x --audio-format mp3 -o "${mp3Path}" ${videoUrl}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading MP3: ${error.message}`);
            return res.status(500).send('Error downloading MP3');
        }
        if (stderr) {
            console.error(`stderr while downloading MP3: ${stderr}`);
        }
        console.log(`stdout while downloading MP3: ${stdout}`);

        res.json({
            downloadUrl: `/downloads/${uniqueFileName}`
        });
    });
});

// Serve downloaded files
app.use('/downloads', express.static('downloads'));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
