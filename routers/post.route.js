import express from 'express';
import { createPost, deletePost, renderUpdatePage, updatePost } from '../controller/post.Controller.js';

const router = express.Router();
router.post('/createPost', createPost);
router.get('/update/:id', renderUpdatePage);


router.post('/update/:id', updatePost);


router.post('/delete/:id', deletePost);


export default router;