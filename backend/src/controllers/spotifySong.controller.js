const path = require('path');
const { exec } = require('child_process');


const dotEnv = require('dotenv');
dotEnv.config();
const SpotifyWebApi = require('spotify-web-api-node');
// Spotify API setup


const downloadSpotifyTrack = (req, res) => {
   const { name, artist } = req.body;
  const query = `${name} ${artist}`;
  const outputDir = path.resolve(__dirname, 'downloadsForSpotify');
  const outputPath = path.join(outputDir, `${name}.mp3`);

  // yt-dlp command
  const command = `yt-dlp --extract-audio --audio-format mp3 -o "${outputPath}" "ytsearch1:${query}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error downloading song:', error);
      return res.status(500).json({ error: 'Failed to download song' });
    }
    console.log('Download complete:', stdout);
    res.json({ message: 'Song downloaded successfully', path: `/downloads/${name}.mp3` });
  });
};



module.exports = { downloadSpotifyTrack };