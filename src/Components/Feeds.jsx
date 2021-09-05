import React, { useContext, useEffect, useState } from 'react';
import { firebaseAuth, firebaseDB, firebaseStorage } from '../config/firebase';
import { AuthContext } from '../context/AuthProvider';
import { uuid } from 'uuidv4';
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
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { NavLink } from 'react-router-dom';
function Feeds({ props }) {
    const [feeds, setFeeds] = useState([]);
    const [file, setFile] = useState(null);
    const [username, setUsername] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const { currentUser, signOut } = useContext(AuthContext);

    useEffect(() => {
        firebaseDB.collection('users').doc(currentUser.uid).get().then(user => {
            setUsername(user.data().username);
            setProfileImage(user.data().profileImageUrl);
        });
        firebaseDB.collection('posts').get().then(snapshot => {
            let allPosts = snapshot.docs.map(doc => {
                return doc.data();
            });
            setFeeds(allPosts);
        });
    }, [firebaseDB]);

    const handleLogout = async () => {
        try {
            await signOut();
            props.history.push("/login");
        } catch (err) {
            // console.log(err);
        }
    }

    const handleInputFile = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async () => {
        // upload to firestorage
        const uploadFileObj = firebaseStorage.ref(`profileImages/${currentUser.uid}/${Date.now()}.mp4`).put(file);
        uploadFileObj.on('state_changed', fun1, fun2, fun3);
        function fun1(snapshot) {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        }
        function fun2(err) {
            // console.log(err.message);
        }
        async function fun3() {
            let fileURL = await uploadFileObj.snapshot.ref.getDownloadURL();
            // add in posts db
            let pid = uuid();
            await firebaseDB.collection('posts').doc(pid).set({
                pid: pid,
                uid: currentUser.uid,
                comments: [],
                likes: [],
                likesCount: 0,
                videoLink: fileURL,
            });
            // add in users -> posts
            let doc = await firebaseDB.collection("users").doc(currentUser.uid).get();
            let document = doc.data();
            document.postsCreated.push(pid);
            await firebaseDB.collection("users").doc(currentUser.uid).set(document);
        }
    }

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
    }, [feeds]);

    const classes = makeStyles({
        root: {
            margin: 40,
        },
        logo: {
            width: 150,
            marginRight: "60%",
        },
        button: {
            height: 40,
            alignItems: "center",
            marginRight: 20,
        },
        header: {
            display: "flex",
            marginBottom: 40,
        },
        input: {
            display: 'none',
        },
        group: {
            display: "flex",
            marginRight: 20,
        },
        videoContainer: {
            maxWidth: "60vw",
            margin: 10,
        },
        small: {
            height: 25,
            width: 25,
        },
    })();

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <CardMedia
                    className={classes.logo}
                    image="https://play-lh.googleusercontent.com/9ASiwrVdio0I2i2Sd1UzRczyL81piJoKfKKBoC8PUm2q6565NMQwUJCuNGwH-enhm00"
                    title="Instagram"
                    alt='banner'
                />
                <Button className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}>
                    Logout
                </Button>
                <div>
                    <div>
                        <NavLink to="/profile">
                            <Button className={classes.button}
                                variant="contained"
                                color="primary">
                                Profile
                            </Button>
                        </NavLink>
                    </div>
                    <div>Logged in as: {username}</div>
                </div>
            </div>
            <div>
                <input
                    accept="image/*,video/*"
                    className={classes.input}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={handleInputFile}
                />
                <label htmlFor="contained-button-file">
                    <Button className={classes.button}
                        variant="contained"
                        color="primary" component="span">
                        <PhotoCamera />
                        Select File
                    </Button>
                </label>
                <Button variant="contained"
                    color="primary"
                    component="span"
                    onClick={handleUpload}>
                    Upload
                </Button>
            </div>
            {feeds.length === 0 ? <Loading /> :
                feeds.map(post => {
                    return <Paper key={post.pid} elevation={2} className={classes.videoContainer} style={{ padding: 5 }}>
                        <VideoPost post={post} profileImage={profileImage} />
                    </Paper>
                })
            }
        </div>
    )
}

const VideoPost = ({ post, profileImage }) => {
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
            profile: profileImage,
            uid: currentUser.uid,
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
                        <Avatar className={classes.small} src={profileImage ? profileImage : ""} />
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
    return <h2>Loading</h2>
}

export default Feeds;