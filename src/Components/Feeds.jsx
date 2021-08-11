import React, { useContext, useEffect, useState } from 'react'
import { firebaseDB, firebaseStorage } from '../config/firebase';
import { AuthContext } from '../context/AuthProvider';
import { uuid } from 'uuidv4';
import { Avatar } from '@material-ui/core';

function Feeds({ props }) {
    const [feeds, setFeeds] = useState([]);
    const [file, setFile] = useState(null);
    const { currentUser, signOut } = useContext(AuthContext);

    useEffect(() => {
        firebaseDB.collection('posts').get().then(snapshot => {
            let allPosts = snapshot.docs.map(doc => {
                return doc.data();
            });
            setFeeds(allPosts);
        });
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            props.history.push("/login");
        } catch (err) {
            console.log(err);
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
            console.log(progress);
        }
        function fun2(err) {
            console.log(err.message);
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
    return (
        <div>
            <h1> Feeds </h1>
            <button onClick={handleLogout}>Logout</button>
            <div>
                <input id="upload" onChange={handleInputFile} type="file" accept="images/*,video/*" />
                <button onClick={handleUpload}>upload</button>
            </div>
            <h1>Feeds Component</h1>
            {feeds.map(post => {
                return <VideoPost key={post.pid} post={post} />
            })}
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
            snapshot.data().comments.map(comment => {
                if (currentUser && comment.uid == currentUser.userId)
                    setIsLiked(true);
            })
        });
    }, []);

    const handleLikeBtn = () => {
        let updatedLikes = likes;
        likes.map(uid => {
            if (uid == currentUser.uid) {
                // console.log('already liked');
                updatedLikes = likes.filter(uid => uid != currentUser.uid);
            }
        });
        if (isLiked == false)
            updatedLikes.push(currentUser.uid);
        // console.log(updatedLikes.length, updatedLikes);
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
        console.log(user);
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

    return <div>
        <div><Avatar src={user ? user.profileImageUrl : ""} />{user ? user.username : ""}</div>
        <video src={post.videoLink} type="video/mp4" controls={true} style={{
            height: "80vh",
            margin: "5rem",
            border: "1px solid black",
        }}
            muted={true}
            loop={true} />
        <p onClick={handleLikeBtn}><img src="" alt="like icon" /> : {likesCount}</p>
        <div>
            <input type="text" placeholder="add comment..." value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
            <button onClick={handleSendComment}>Post</button>
            {comments.map(comment => {
                return <div key={comment.cid}>
                    <Avatar src={comment.profile} />
                    {comment.message}
                </div>
            })}
        </div>
    </div>;
}

export default Feeds;