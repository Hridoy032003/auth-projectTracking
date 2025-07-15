import express, { json } from "express";
import mongoose from "mongoose";

import User from "./model/User.js";

import authRouter from "./routers/auth.route.js";
import postRouter from "./routers/post.route.js";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "./middleware/isAuth.js";
import { Post } from "./model/post.js";
const app = express();
const PORT = 5000;
import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';




app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));




const mongoURI = "mongodb://localhost:27017/auth"; 
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

 app.use("/", authRouter);
 app.use('/post',isAuthenticated,postRouter)

app.get("/dashboard", isAuthenticated, async (req, res) => {

try {
    const user = await User.findById(req.userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts= await Post.find({author:user._id});
    
   console.log(posts);
    res.render('pages/dashboard.ejs', { title: 'Dashboard', user,posts   });
} catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get("/posts/download", isAuthenticated, async (req, res) => {
  try {
      
      const user = await User.findById(req.userId, "-password");
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      const posts = await Post.find({ author: user._id });

      if (posts.length === 0) {
        
          return res.status(404).json({ message: "No posts to download." });
      }
      const templatePath = path.resolve(__dirname, 'views', 'pages', 'posts-pdf-template.ejs');

    
      const html = await ejs.renderFile(templatePath, { user, posts, title: `${user.username}'s Posts` });

      
      const browser = await puppeteer.launch({ 
          headless: true, 
        
          args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const page = await browser.newPage();
      
   
      await page.setContent(html, { waitUntil: 'networkidle0' });

      
      const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });

      
      await browser.close();

    
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${user.username}-posts.pdf"`);

  
      res.send(pdfBuffer);

  } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error while generating PDF." });
  }
});

app.get('/', function(req, res) {
    res.render('pages/index.ejs', { title: 'Auth App' });
  });
app.get('/login', function(req, res) {
    res.render('pages/singup.ejs', { title: 'Auth App' });
  }) ; 
 app.get('/register', function(req, res) {
    res.render('pages/singin.ejs', { title: 'Auth App' });
  })  
  app.get('/dashboard', function(req, res) {
    res.render('pages/dashboard.ejs', { title: 'Auth App' });
  }) 
  app.get('/admin', function(req, res) {
    res.render('pages/admin.ejs', { title: 'Auth App' });
  }) 
  app.get('/post/createPost', function(req, res) {
    res.render('pages/createPost.ejs', { title: 'Auth App' });
  } )
  app.get('/post/update/:id', function(req, res) {
    res.render('pages/updatePost.ejs', { title: 'Auth App' }); 
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
 
});
