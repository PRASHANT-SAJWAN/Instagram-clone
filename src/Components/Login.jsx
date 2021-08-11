import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { Link } from 'react-router-dom';

function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            await login(email, password);
            props.history.push("/");  // go to root directory
        } catch (err) {
            setEmail("");
            setPassword("");
            setErrorMessage(err.message);
            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        }
    }

    return (
        <>
            <div> Login </div>
            <div>
                <input type="text" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleLogin}>SUBMIT</button>
                <Link to="/signup">Signup</Link>
                <h2 style={{ color: "red" }}>{errorMessage}</h2>
            </div>
        </>
    )
}

export default Login;