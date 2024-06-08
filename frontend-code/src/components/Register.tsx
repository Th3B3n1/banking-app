import { useState } from "react";
import { AuthProp } from "../functions/AuthProp";
import { Fetch } from "../functions/Fetch";
import { Login } from "./Login";
import { Form, FloatingLabel, Button } from "react-bootstrap";

export function Register({ setAuth } : AuthProp) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [emailAgain, setEmailAgain] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [registered, setRegistered] = useState(false);
    const [textDesign, setTextDesign] = useState("link-danger");
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
                                setTextDesign("link-success");
                            }
                            else
                            {
                                setTextDesign("link-danger");
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
    <Form className="card p-2">
        <h2>Register</h2>
        <FloatingLabel controlId="floatingFullName" label="Full name">
            <Form.Control type="text" placeholder="Full name" onChange={(e) => setFullName(e.target.value)}/>
        </FloatingLabel>
        <FloatingLabel controlId="floatingEmail" label="Email">
            <Form.Control type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        </FloatingLabel>
        <FloatingLabel controlId="floatingConfirmEmail" label="Confirm email">
            <Form.Control type="email" placeholder="Confirm email" onChange={(e) => setEmailAgain(e.target.value)}/>
        </FloatingLabel>
        <FloatingLabel controlId="floatingPassword" label="Password">
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        </FloatingLabel>
        <FloatingLabel controlId="floatingConfirmPassword" label="Confirm password">
            <Form.Control type="password" placeholder="Confirm password" onChange={(e) => setPasswordAgain(e.target.value)}/>
        </FloatingLabel>
        <Form.Text>The password must contain at least 8 characters, 1 lowercase and 1 uppercase letters, 1 number and 1 special character.</Form.Text>
        <Form.Text className={textDesign}>{error}</Form.Text>
        <Button className="w-100 py-2" onClick={handleRegistration}>Register</Button>
        <p>Already have an account? Click <a className="link-primary" onClick={setAuth}>here</a> to login.</p>
    </Form>
    )
}