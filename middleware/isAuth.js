import Session from "../model/Session.js";

export const isAuthenticated = async (req, res, next) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const session = await Session.findOne({ sessionId: sessionId });
      if (!session) {
        return res.status(401).json({ message: "Session not found" });
      }
      if (session.ipAddress !== req.ip) {
         
          console.log("IP address mismatch:", session.ipAddress, req.ip);
         
          await Session.deleteOne({ sessionId });
          res.clearCookie('sessionId');
  
        
          return res.status(401).json({ message: 'Unauthorized: Session is invalid.' });
      }
      req.userId = session.userId;
      next();
    } catch (error) {
      return res.redirect('/login')
     
    }
  };