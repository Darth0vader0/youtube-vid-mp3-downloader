const authUser = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token){
        res.redirect('/login');
    }
    next();
}

module.exports={authUser}