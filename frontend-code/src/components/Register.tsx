import { useState } from "react";
import { AuthProp } from "../functions/AuthProp";
import { Fetch } from "../functions/Fetch";
import { Login } from "./Login";

export function Register({ setAuth } : AuthProp) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [emailAgain, setEmailAgain] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [registered, setRegistered] = useState(false);
    const [error, setError] = useState("");

    const handleRegistration = async () =>
    {
        if (fullName != "" && email != "" && emailAgain != "" && password != "" && passwordAgain != "") 
        {
            if (password.length > 7) 
            {
                if (email == emailAgain) 
                {
                    if (password == passwordAgain) 
                    {
                        let object = {
                            fullname: fullName,
                            email: email,
                            password: password
                        }
                        try
                        {
                            let response = await Fetch("https://localhost:5555/register", object);
                            let user = await response.json();
                            if (response.status == 200)
                            {
                                setRegistered(true);
                            }
                            setError(user.message);
                        }
                        catch (error)
                        {
                            setError("Request error: " + error);
                        }
                        
                    } 
                    else 
                    {
                        setError("Passwords do not match.");
                    }
                } 
                else 
                {
                    setError("Emails do not match.");
                }
            } 
            else 
            {
                setError("Passwords need to be at least 8 characters long.");
            }
        } 
        else 
        {
            setError("Full name/password(s)/email(s) can't be empty.");
        }
    }
    if (registered)
    {
        return <Login setAuth={setAuth}/>
    }

    return(
    <div id='div_register'>
        <h2>Register</h2>
        <label htmlFor="register_fullname"> Full name: </label><br />
        <input id="register_fullname" type="text" placeholder="Full name: " onChange={(e) => setFullName(e.target.value)}></input><br />
        <label htmlFor="register_email"> Email: </label><br />
        <input id="register_email" type="email" placeholder="Email: " onChange={(e) => setEmail(e.target.value)}></input><br />
        <label htmlFor="register_email_again"> Confirm email: </label><br />
        <input id="register_email_again" type="email" placeholder="Confirm email: " onChange={(e) => setEmailAgain(e.target.value)}></input><br />
        <p>*The password must contain at least 8 characters, 1 lowercase and 1 uppercase letters, 1 number and 1 special character.</p>
        <label htmlFor="register_password"> Password: </label><br />
        <input id="register_password" type="password" placeholder="Password: " onChange={(e) => setPassword(e.target.value)}></input><br />
        <label htmlFor="register_password_again"> Confirm password: </label><br />
        <input id="register_password_again" type="password" placeholder="Confirm password: " onChange={(e) => setPasswordAgain(e.target.value)}></input><br />
        <p id="reg_error">{error}</p>
        <button onClick={handleRegistration}> Register </button>
        <p>Already have an account? Click <a onClick={setAuth}>here</a> to login.</p>
    </div>)
}