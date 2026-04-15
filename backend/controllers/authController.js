const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
// generate jwt token
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn:"1h"});
}
// Register User
exports.registerUser=async (req,res) => {
    console.log("REGISTER ROUTE HIT");
    console.log("HEADERS:", req.headers);
console.log("BODY:", req.body);
    const {fullName,email,password,profileImageUrl}=req.body;
    
    // validation check for missing fields
    if (!fullName || !email || !password){
        return res.status(400).json({message:"All Fields are required"});
    }
    try{
        // check if email already exists
        const existingUser=await User.findOne({email});
        if (existingUser){
             return res.status(400).json({message:"Email already in Use"});
        }
        // Create the user
        const user=await User.create({
            fullName,
            email,
            password,
            profileImageUrl,

        });
        res.status(201).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        });
    }catch(err){
        res.status(500).json({message:"Error registering user ",error :err.message});
    }
};
// Login User
exports.loginUser=async (req,res) => {
    const {email,password}=req.body;
    if (!email || !password){
        return res.status(400).json({message:"Email and password are required"});
    }
    try{
        const user=await User.findOne({email});
        if (!user){
            return res.status(401).json({message:"Invalid email or password"});
        }
        const isMatch=await user.comparePassword(password);
        if (!isMatch){
            return res.status(401).json({message:"Invalid email or password"});
        }
        res.status(200).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        });
    }catch(err){
        res.status(500).json({message:"Error logging in",error:err.message});
    }
};
// Google Login
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Google sign-in is not configured. Add GOOGLE_CLIENT_ID to .env" });
  }
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        profileImageUrl: picture,
        password: null,
      });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid Google token", error: err.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};
