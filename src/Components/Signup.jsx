import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { firebaseDB, firebaseStorage } from '../config/firebase.js';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    IconButton,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';

import { PhotoCamera } from '@material-ui/icons';

function Signup(props) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const { signup } = useContext(AuthContext);

    const mandatoryFieldHelper = (fieldName) => {
        setErrorMessage(`${fieldName} is Mandatory`);
        setTimeout(() => {
            setErrorMessage("");
        }, 3000);
    }
    const checkValidRegister = () => {
        if (email === "") 
            mandatoryFieldHelper('email');
        if (password === "")
            mandatoryFieldHelper('password');
        if (profileImage === "")
            mandatoryFieldHelper('profileImage');
        if (username === "")
            mandatoryFieldHelper('username');
        return (email === "" || password === "" || profileImage === "" || username === "");
    }
    const handleSignUp = async () => {
        try {
            if (checkValidRegister()) return;
            let response = await signup(email, password);
            let uid = response.user.uid;
            // upload profileImage in storage
            const uploadPhotoObject = firebaseStorage.ref(`profileImages/${uid}/image.jpg`).put(profileImage);
            uploadPhotoObject.on("state_changed", fun1, fun2, fun3);
            function fun1(snapshot) {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(progress);
            }
            function fun2(error) {
                console.log(error);
            }
            async function fun3() {
                let profileImageURL = await uploadPhotoObject.snapshot.ref.getDownloadURL();
                // add user in DB
                firebaseDB.collection('users').doc(uid).set({
                    email: email,
                    userId: uid,
                    username: username,
                    profileImageUrl: profileImageURL,
                    postsCreated: [],
                });
                props.history.push("/");  // go to root directory
            }
        } catch (err) {
            setErrorMessage(err.message);
            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        }
    }
    const handleProfileImageUpload = (e) => {
        setProfileImage(e.target.files[0]);
    }
    const classes = makeStyles({
        root: {
            display: "flex",
            flexDirection: "",
            maxWidth: "100%",
            padding: 50,
            margin: 50,
            justifyContent: "center",
        },
        media1: {
            height: 150,
            width: 650,
            alignItems: "center",
            margin: "0 auto",
        },
        media2: {
            height: 200,
            width: 200,
            alignItems: "center",
            margin: "0 auto",
        },
        input: {
            display: 'none',
        },
        column: {
            flexDirection: "column",
        },
    })();
    return (
        <Container>
            <Card variant="outlined" className={classes.root}>
                <div className={classes.column}>
                    <CardMedia
                        className={classes.media1}
                        image="https://play-lh.googleusercontent.com/9ASiwrVdio0I2i2Sd1UzRczyL81piJoKfKKBoC8PUm2q6565NMQwUJCuNGwH-enhm00"
                        title="Instagram"
                    />
                    <CardMedia
                        className={classes.media2}
                        image="data:image/jpeg;base64,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HImSoqNhnnd1TT75591fide3HzGgY69PWuDFnLBT2FFRtDtQlm7chJ3AavHuW3R5tV9XJ+UTSdU49oF+MgHxGDydlsQUkss8lxKVVZZ/iuL8ud/BHQrcsy1B6ilYWNdYaDcJHA2GlK/9iy2zF5A96u5kLNhsBbLK7rJmghlhaOIEAERs34eUcSupkjJENIzQibba4nFzjvcdpXQVdz3R2FKU90dnuERFGRBERAEREAREQBERAEREAREQBERAFH8s5qU1US5zdF5w0m3HqvYqQIsNJ7SSnVnTlrQbT7iqsp9HE7LmCRsg3OOi719k879yjddkaog/SwSN4lrtHxGvxV8otOiW469LTtdK1RKXB8uB+eLL6rzrsh00xvJAxx32sfEYrlSZh0J1Rub8l7vtut0rFlaaoyX5Rafk/lexUaK2ocwqJpuWvdwc829Vlu0madFESW07bnzi59uWkTbuUsZpEU9K0dyfDn8FNRROebNBcddmgk+AXXyZmrWVB7MDmt16Uo0G+vE9wKuaGBrBZrQBwACyrfp3uRSqaRb6sbeOfIgmb2YpgdpzPY5wILS1ty0gk4aXZvqNy022b1N44w3V4nE+KyIopScndlGpVlN3kERFqRhERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/9k="
                        title="Instagram"
                    />
                </div>
                <CardContent>
                    <div>
                        <div>
                            <input
                                accept="image/*"
                                className={classes.input}
                                id="contained-button-file"
                                multiple
                                type="file"
                                onChange={handleProfileImageUpload}
                            />
                            <label htmlFor="contained-button-file">
                                <Button variant="contained"
                                    color="primary"
                                    component="span">
                                    Upload Profile Image
                                </Button>
                            </label>
                            <input accept="image/*"
                                className={classes.input}
                                id="icon-button-file"
                                type="file" />
                            <label htmlFor="icon-button-file">
                                <IconButton color="primary" aria-label="upload picture" component="span">
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                        </div>
                        <TextField required id="standard-required" label="Username" onChange={(e) => { setUsername(e.target.value) }} />
                        <br />
                        <br />
                        <TextField required id="standard-required" label="Email" onChange={(e) => { setEmail(e.target.value) }} />
                        <br />
                        <br />
                        <div>
                            <TextField required id="standard-required" label="Password" type="password" onChange={(e) => { setPassword(e.target.value) }} />
                        </div>
                        <br />
                        <Button variant="contained" color="primary" onClick={handleSignUp}>
                            Sign Up
                        </Button>
                        <br />
                        <br />
                        <Button variant="contained" color="primary" onClick={() => { props.history.push('/login') }}>
                            Login
                        </Button>
                        <h2 style={{ color: "red" }}>{errorMessage}</h2>{" "}
                    </div>
                </CardContent>
            </Card>
        </Container>
    )
}

export default Signup;