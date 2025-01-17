const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const {login,signup,home,profile} = require('./src/routes/routes');
const {signUp,logIn,checkLogins,logout} = require('./src/controllers/auth.controller');
const {fetchUserData} = require('./src/controllers/user.controller');   
// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../public')); // Serve static files
app.use(cookieParser());
// Serve index.html
app.get('/',home);
app.get('/login', login);
app.get('/signup', signup);
app.get('/checkLogins',checkLogins);
app.get('/profile',profile);
app.get('/logout',logout);
app.get('/fetchUserData',fetchUserData);
// Signup endpoint
app.post('/signup',signUp);
app.post('/login',logIn);

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
