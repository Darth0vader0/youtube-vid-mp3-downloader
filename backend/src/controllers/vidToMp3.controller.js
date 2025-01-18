const { google } = require('googleapis');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');


const download = (req,res)=>{
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
}

async function searchYouTube(query) {
    const youtube = google.youtube('v3');
    try {
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            q: query  +"lyrics",
            type: 'video',
            maxResults: 5,
            key: process.env.YOUTUBE_API_KEY,
        });

        // Create an array of objects

        const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

        // Step 2: Fetch details for the videos, including duration
        const detailsResponse = await youtube.videos.list({
            part: 'snippet,contentDetails',
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY,
        });

        // Step 3: Filter videos based on duration (2 to 8 minutes)
        const results = detailsResponse.data.items
            .filter(item => {
                const duration = item.contentDetails.duration;
                const totalSeconds = parseYouTubeDuration(duration);
                return totalSeconds >= 120 && totalSeconds <= 480; // 
            })
            .map(item => ({
                title: item.snippet.title,
                videoId: item.id,
                videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
            }));

        return results;
       
        
    } catch (error) {
        console.error('Error while fetching YouTube search results:', error.message);
        return [];
    }
}

function parseYouTubeDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

const fetchYoutubeData = async (req, res) => {
    try {
        const query = req.query.q || "never gonna give up";
        const results = await searchYouTube(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching YouTube data' });
    }
}

module.exports ={download , fetchYoutubeData}