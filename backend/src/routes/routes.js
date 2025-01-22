const signup = (req,res)=>{
    res.sendFile("C:/nodeApp/public/signup.html");
}
const login = (req,res)=>{
    res.sendFile("C:/nodeApp/public/login.html");
}
const home=(req,res)=>{ 
    res.sendFile("C:/nodeApp/public/home.html");
}
const profile=(req,res)=>{
    res.sendFile("C:/nodeApp/public/profile.html");
}
const searchOnYoutube = (req,res)=>{
    res.sendFile("C:/nodeApp/public/searchOnYoutube.html")
}
const searchSpotifySongs =(req,res)=>{
    res.sendFile("C:/nodeApp/public/searchOnSpotify.html")
}
const updateProfile = (req,res)=>{
    res.sendFile("C:/nodeApp/public/updateProfile.html")
}
module.exports = {signup,login,home,profile,searchOnYoutube,updateProfile,searchSpotifySongs};