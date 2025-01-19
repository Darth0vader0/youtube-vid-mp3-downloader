const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {authUser} = require ('./src/middlewares/authUser.middelware')
const multer = require('multer');
const upload = multer();

const {login,signup,home,profile,search,updateProfile} = require('./src/routes/routes');
const {download, fetchYoutubeData} = require('./src/controllers/vidToMp3.controller');
const {signUp,logIn,checkLogins,logout} = require('./src/controllers/auth.controller');
const {fetchUserData} = require('./src/controllers/user.controller');   
const {uploadPhoto,updatePassword} = require('./src/controllers/profile.controller');
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
app.get('/search',authUser,search);
app.get('/updateProfile',updateProfile)
// Signup endpoint
app.post('/signup',signUp);
app.post('/login',logIn);
app.post('/updateProfile',upload.single('photo'),uploadPhoto);
app.post("/updatePassword",updatePassword)



// API Endpoint: Fetch YouTube search results
app.get('/fetchYoutubeData', fetchYoutubeData);

// API Endpoint: Download YouTube video as MP3
app.post('/download', download);

// Serve downloaded files
app.use('/downloads', express.static('downloads'));
console.log(__dirname);
// print download path
console.log(__dirname + '/downloads');
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
