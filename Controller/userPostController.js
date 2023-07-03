const Post = require('../Model/userPost.js');
const user = require('../Model/userModel.js');
const follow = require('../Model/userFollow.js');
const md5 = require('md5');
module.exports.userPost = (req, res) => {
    let unsuccessPost = req.flash('message');
    res.render('create_post', { success: unsuccessPost, hashEmail: req.hashEmail });
}
module.exports.addingUserPost = async (req, res) => {
    try {
        const id = req.userLogged._id;
        const { postTitle, developerContent } = req.body;
        const userPost = new Post({
            user_id: id, postTitle, developerContent
        });
        await userPost.save();
        req.flash('success', 'Post successfully created')
        req.session.save(() => { res.redirect('/homeLogged'); });
    }
    catch (error) {
        req.flash('error', 'Please Try again');
        req.session.save(() => { res.redirect('/createPost'); });
    }
}
module.exports.NoOfPost = async (req, res) => {
    try {
        const PostData = await Post.aggregate([
            { $match: { user_id: req.userLogged._id } },
            { $project: { postTitle: 1, created: 1 } }
        ]).sort({ created: -1 });
        const noPost = PostData.map((element) => {
            return ({
                postTitle: element.postTitle,
                date: element.created.toLocaleDateString(),
                imgSrc: req.hashEmail,
                postId: element._id
            });
        });
        const follower = await follow.aggregate([
            { $match: { follow_id: req.userLogged._id } },
            {
                $lookup: {
                    from: 'users',
                    localField: "user_id",
                    foreignField: "_id",
                    as: "followerDetail"
                }
            }
        ]);
        const user_Follower = follower.map((element) => {
            return ({ name: element.followerDetail[0].name, follower_id: element.followerDetail[0]._id });
        });
        const followed = await follow.aggregate([
            { $match: { user_id: req.userLogged._id } },
            {
                $lookup: {
                    from: "users",
                    localField: "follow_id",
                    foreignField: "_id",
                    as: "followedDetail"
                }
            }
        ]);
        const user_Followed = followed.map((element) => {
            return ({ name: element.followedDetail[0].name, followed_id: element.followedDetail[0]._id });
        });
        const errorMessage = req.flash('error');
        const successMessage = req.flash('success');
        res.render('myProfile', { name: req.userLogged.name, hashEmail: req.hashEmail, postData: noPost, profile: req.userLogged.profile, success: successMessage, error: errorMessage, userFollower: user_Follower, userFollowed: user_Followed });
    }
    catch (error) {
        console.log(error);
    }
}
module.exports.singlePost = async (req, res) => {
    try {
        const post1 = await Post.findOne({ _id: req.params.id }, { user_id: 0, });
        const setPost = {
            postTitle: post1.postTitle,
            date: post1.created.toLocaleDateString(),
            imgSrc: req.hashEmail,
            postId: post1._id,
            name: req.userLogged.name,
            content: post1.developerContent,
        }
        const errorMessage = req.flash('error');
        const successMessage = req.flash('success');
        res.render('singlepost', { hashEmail: req.hashEmail, sPost: setPost, success: successMessage, error: errorMessage });
    }
    catch (error) {
        console.log(error);
    }
}
module.exports.editPost = async (req, res) => {
    const singlePost = await Post.findOne({ _id: req.params.id });
    if (singlePost.user_id == req.userLogged.id) {
        res.render('editPost', { hashEmail: req.hashEmail, post: singlePost });
    }
    else {
        req.flash('error', 'You are not allowed to perform this action');
        req.session.save(() => { res.redirect(`/singlePost/${req.params.id}`); })
    }

}
module.exports.updatePost = async (req, res) => {
    try {
        const { postTitle, developerContent } = req.body;
        await Post.findByIdAndUpdate({ _id: req.params.id }, { $set: { postTitle, developerContent, created: new Date(Date.now()) } });

        req.flash('success', 'Successfully updated !!');
        req.session.save(() => { res.redirect(`/singlePost/${req.params.id}`) });
    }
    catch (error) {
        console.log(error);
    }
}
module.exports.singlePostDelete = async (req, res) => {
    try {
        const singlePost = await Post.findOne({ _id: req.params.id });
        if (singlePost.user_id == req.userLogged.id) {
            await Post.deleteOne({ _id: singlePost.id });
            req.flash('success', 'Post successfully deleted !!');
            req.session.save(() => { res.redirect(`/myProfile`); })
        }
        else {
            req.flash('error', 'You are not allowed to perform this action');
            req.session.save(() => { res.redirect(`/singlePost/${req.params.id}`); })
        }
    }
    catch (error) {
        req.flash('error', 'Try again later !!');
        req.session.save(() => { res.redirect(`/singlePost/${req.params.id}`); });

    }
}

module.exports.allPost = async (req, res) => {
    try {
        const posts = await Post.aggregate([
            { $sort: { created: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userDetail"
                }
            }
        ]);
        const allPost = posts.map((post) => {
            return ({
                username: post.user_id,
                postTitle: post.postTitle,
                name: post.userDetail[0].name,
                date: post.created.toLocaleDateString(),
                content: post.developerContent,
                imgSrc: req.hashEmail
            })
        });
        let successMessage = req.flash('success');

        res.render('home_logged', { success: successMessage, hashEmail: req.hashEmail, setPost: allPost });

    }
    catch (error) {
        req.flash('error', 'Try again later !!');
        req.session.save(() => { res.redirect('/') });
    }
}
module.exports.userProfile = async (req, res) => {
    try {
        if (req.userLogged.id == req.params.username) {
            res.redirect('/myProfile');
        }
        else {
            const followUser = await follow.findOne({ $and: [{ user_id: req.userLogged._id }, { follow_id: req.params.username }] });
            let userFollowed;
            if (!followUser) {
                userFollowed = false;
                const userData = await user.findOne({ _id: req.params.username }, { _id: 1, name: 1, email: 1, profile: 1 });
                const PostData = await Post.aggregate([
                    { $match: { user_id: userData._id } },
                    { $project: { postTitle: 1, created: 1 } }
                ]).sort({ created: -1 });
                const noPost = PostData.map((element) => {
                    return ({
                        postTitle: element.postTitle,
                        date: element.created.toLocaleDateString(),
                        imgSrc: req.hashEmail,
                        postId: element._id
                    });
                });
                const gravatarHash = await md5(userData.email);
                userEmail1 = `https://gravatar.com/avatar/${gravatarHash}?s=128`;
                const errorMessage = req.flash('error');
                const successMessage = req.flash('success');
                const sendData = { name: userData.name, userEmail: userEmail1, hashEmail: req.hashEmail, postData: noPost, profile: userData.profile, success: successMessage, error: errorMessage, userFollow: userFollowed }
                res.render('userProfile', sendData);
            }
            else {
                userFollowed = true;
                const userData = await user.findOne({ _id: req.params.username }, { _id: 1, name: 1, email: 1, profile: 1 });
                const PostData = await Post.aggregate([
                    { $match: { user_id: userData._id } },
                    { $project: { postTitle: 1, created: 1 } }
                ]).sort({ created: -1 });
                const noPost = PostData.map((element) => {
                    return ({
                        postTitle: element.postTitle,
                        date: element.created.toLocaleDateString(),
                        imgSrc: req.hashEmail,
                        postId: element._id
                    });
                });
                const gravatarHash = await md5(userData.email);
                userEmail1 = `https://gravatar.com/avatar/${gravatarHash}?s=128`;
                const errorMessage = req.flash('error');
                const successMessage = req.flash('success');
                const sendData = { name: userData.name, userEmail: userEmail1, hashEmail: req.hashEmail, postData: noPost, profile: userData.profile, success: successMessage, error: errorMessage, userFollow: userFollowed, followed_id: req.params.username }
                res.render('userProfile', sendData);
            }
        }
    }
    catch (error) {
        console.log(error);
        res.redirect('/');
    }
}