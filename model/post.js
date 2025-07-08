import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
     
    },
    content: {
        type: String,
        
    },
    status: {
        type: String,
        enum: ['active', 'pasue', 'complete'],
        default: 'pasue',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Post = mongoose.model('Post', postSchema);


