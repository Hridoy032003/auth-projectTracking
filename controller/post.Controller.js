import { Post } from "../model/post.js";
import User from "../model/User.js";

export const createPost=async(req,res)=>{
     const { title, content, status} = req.body;
   
     
try {
    const user= await User.findById(req.userId);

    if (!user) {
     
       return  res.json({ message: "User not found" })
      }
    const createNewpost=new Post({
        title,
        content,
        status,
        author:user._id,
      
    })
    await createNewpost.save();
   
    return res.redirect('/dashboard');

} 
catch (error) {
    res.status(505).json({massage:error.message})
}

}
export const getUserPost=async(req,res)=>{
 const user=await User.findById(req.userId);
if (!user){
    res.json({massage:"user not found:"})
}
try {   
    const userPost= await Post.find({author:user._id});
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(userPost);
    res.render('pages/dashboard.ejs', {
        title: 'Dashboard',
        user: user,      
        posts: userPost
    });
    
} catch (error) {
    res.status(505).json({massage:error.message})
}

}
export const updatePost=async(req,res)=>{

 const {title,content,status}=req.body;
 
 const postId=req.params.id;
 try {
    const post=await Post.findById(postId);
    console.log(post);
    const updatedPost = await Post.findByIdAndUpdate(
        postId,               
        {                 
            title: title,
            content: content,
            status: status
        },
       
    );
  
    console.log(updatedPost);
    res.redirect('/dashboard');
}catch(error){
    res.status(505).json({massage:"To update faild"+error.message})
 }

}
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        console.log(`Attempting to delete post with ID: ${postId}`);

        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
         
            return res.status(404).send("Post not found, cannot delete.");
        }

        console.log(`Successfully deleted post: ${deletedPost.title}`);
        res.redirect('/dashboard');

    } catch (error) {
        console.error("Delete failed:", error);
        res.status(500).json({ message: "Delete failed: " + error.message });
    }
};
export const renderUpdatePage = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
          
            return res.status(404).send("Post not found");
        }

    
        res.render('pages/updatePost.ejs', {
            title: 'Update Post',
            post: post 
        });

    } catch (error) {
        console.error("Failed to get post for update:", error);
        res.status(500).json({ message: "Failed to load update page" });
    }
};