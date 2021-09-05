import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { firebaseDB, firebaseStorage } from '../config/firebase';
import { uuid } from 'uuidv4';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { NavLink } from 'react-router-dom';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Fab,
    IconButton,
    makeStyles,
    TextField,
    Typography,
    Paper,
    Input,
    InputAdornment,
} from '@material-ui/core';

function Profile() {
    const [profileImage, setProfileImage] = useState(null);
    const [username, setUsername] = useState("");
    const [posts, setPosts] = useState([]);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        firebaseDB.collection('users').doc(currentUser.uid).get().then((data) => {
            let user = data.data();
            setUsername(user.username);
            setProfileImage(user.profileImageUrl);
            let pids = user.postsCreated;
            let allPosts = [];
            pids.forEach(id => {
                firebaseDB.collection('posts').doc(id).get().then(post => {
                    allPosts.push(post.data());
                    setPosts(allPosts);
                });
            });
            return data.data();
        });
    }, []);

    let conditionObject = {
        root: null, //observe from whole page
        threshold: "0.6", //80%
    };

    function cb(entries) {
        entries.forEach((entry) => {
            let child = entry.target.children[0];
            // play(); => async
            // pause(); => sync
            child.play().then(function () {
                if (entry.isIntersecting === false) {
                    child.pause();
                }
            });
        });
    }

    useEffect(() => {
        // code which will run when the component loads
        let observerObject = new IntersectionObserver(cb, conditionObject);
        let elements = document.querySelectorAll(".video-container");

        elements.forEach((el) => {
            observerObject.observe(el); //Intersection Observer starts observing each video element
        });
    }, [posts]);

    const classes = makeStyles({
        root: {
            margin: 40,
        },
        videoContainer: {
            maxWidth: "60vw",
            margin: 10,
        },
        group: {
            display: "flex",
            marginRight: 20,
            marginTop: 100,
            marginBottom: 120,
        },
    })();
    return (
        <div className={classes.root}>
            <div className={classes.group}>
                <Avatar src={profileImage} style={{ height: 200, width: 200, marginLeft: 10, marginTop: 10 }} />
                <div style={{ marginLeft: 200, alignItems: "center" }}>
                    <div style={{ fontSize: 35 }}>
                        {username}
                    </div>
                    <div style={{ fontSize: 25 }}>
                        {posts.length} Posts
                    </div>
                </div>

                <NavLink to="/feeds" style={{ marginLeft: 200, alignItems: "center" }}>
                    <Button variant="contained"
                        color="primary"
                        component="span">Feeds</Button>
                </NavLink>
            </div>

            {posts.length === 0 ? <Loading /> :
                posts.map(post => {
                    return <Paper elevation={2} className={classes.videoContainer} style={{ padding: 5 }}>
                        <VideoPost key={post.pid} post={post} />
                    </Paper>
                })
            }
        </div>
    )
}


const VideoPost = ({ post }) => {
    const [user, setUser] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        firebaseDB.collection('users').doc(post.uid).get().then(user => setUser(user.data()));
        firebaseDB.collection('posts').doc(post.pid).get().then(snapshot => {
            setLikes(snapshot.data().likes);
            setLikesCount(snapshot.data().likes.length);
            setComments(snapshot.data().comments);
            snapshot.data().likes.map(uid => {
                if (currentUser && uid == currentUser.uid)
                    setIsLiked(true);
            });
        });
    }, []);

    const handleLikeBtn = () => {
        let updatedLikes = likes;
        likes.map(uid => {
            if (uid == currentUser.uid) {
                updatedLikes = likes.filter(uid => uid != currentUser.uid);
            }
        });
        if (isLiked == false)
            updatedLikes.push(currentUser.uid);
        setLikes(updatedLikes);
        setIsLiked(!isLiked);
        setLikesCount(updatedLikes.length);
        // update firebase DB
        firebaseDB.collection('posts').doc(post.pid).set({
            ...post,
            likes: updatedLikes,
            likesCount: updatedLikes.length,
        });
    }

    const handleSendComment = () => {
        if (inputValue == "")
            return;
        let updatedComments = [...comments, {
            profile: user.profileImageUrl,
            uid: user.userId,
            message: inputValue,
            cid: uuid(),
        }];

        firebaseDB.collection('posts').doc(post.pid).set({
            ...post,
            comments: updatedComments,
        });
        setInputValue("");
        setComments(updatedComments);
    }

    const classes = makeStyles({
        root: {
            margin: 40,
        },
        button: {
            height: 40,
            alignItems: "center",
            marginRight: 20,
        },
        group: {
            display: "flex",
            marginRight: 20,
        },
        small: {
            height: 25,
            width: 25,
        },
    })();
    return <div>
        <div className={classes.group}>
            <Avatar src={user ? user.profileImageUrl : ""} style={{ marginLeft: 10, marginTop: 10 }} />
            <div style={{ marginLeft: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {user ? user.username : ""}
            </div>
        </div>
        <div className="video-container">
            <video src={post.videoLink} type="video/mp4" controls={true} style={{
                height: "80vh",
                width: "60vw",
                background: "black",
                border: "1px solid black",
            }}
                muted={true}
                loop={true} />
        </div>
        <div className={classes.group} onClick={handleLikeBtn}>
            {isLiked ? <FavoriteIcon style={{ height: 30, width: 30 }} /> : <FavoriteBorderIcon style={{ height: 30, width: 30 }} />}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {likesCount} {likesCount > 1 ? "Likes" : "Like"}
            </div>
        </div>
        <div>
            <Input
                id="input-with-icon-adornment"
                startAdornment={
                    <InputAdornment position="start">
                        <Avatar className={classes.small} src={user ? user.profileImageUrl : ""} />
                    </InputAdornment>
                }
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value) }}
            />
            <Button onClick={handleSendComment}
                variant="contained"
                color="primary"
                component="span">Post</Button>
            {comments.map(comment => {
                return <div key={comment.cid} className={classes.group} style={{ margin: "10px 40px", }}>
                    <Avatar className={classes.small} src={comment.profile} />
                    <div style={{ marginLeft: 20 }}>
                        {comment.message}
                    </div>
                </div>
            })}
        </div>
    </div>;
}

const Loading = () => {
    return <div>Loading</div>
}
export default Profile;