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
module.exports ={download}