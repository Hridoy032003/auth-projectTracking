import mongoose from "mongoose";
import Session from "../model/Session.js";
import User from "../model/User.js";


export const register=async(req,res)=>{
    const { username, email, password } = req.body;
    try {
         
          if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
          }
          const existingUser = await User.findOne({ $or: [{ username }, { email }] });
          if (existingUser) {
            return res
              .status(400)
              .json({ message: "Username or email already exists" });
          }
          const newUser = new User({ username, email, password });
          await newUser.save();
          return res.redirect('/login')
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}
export const login=async(req,res)=>{
    const { email, password } = req.body;
    const maxLogins = 2; 
    try {
       
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email, password });
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        const activeSessionCount = await Session.countDocuments({ userId: user._id });
      
        if(activeSessionCount <maxLogins) {
          const session = new Session({
              sessionId: new mongoose.Types.ObjectId(),
              userId: user._id,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              createdAt: new Date(),
            });
            console.log(session);
            await session.save();
            res.cookie("sessionId", session.sessionId, {
              httpOnly: true,
              secure: true,
              maxAge: 1000 * 60 * 60 * 24,
            });
            
            return res.redirect('/dashboard')
        }
        else{
          return res.status(403).json({ message: "your device login more then 2 device plese logout them first" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
        
    }
}
export const logout=async(req,res)=>{
    try {
        const sessionId = req.cookies.sessionId;
    
        if (!sessionId) {
          return res.status(400).json({ message: "No session found" });
        }
        await Session.deleteOne({ sessionId: sessionId });
    
        res.clearCookie("sessionId", {
          httpOnly: true,
          secure: false,
          maxAge: 0,
        });
    
        return res.redirect('/login');
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Error during logout:", error);
      }
}