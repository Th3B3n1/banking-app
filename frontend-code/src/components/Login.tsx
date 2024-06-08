import { useState } from "react";
import { AuthProp } from "../functions/AuthProp";
import { Fetch } from "../functions/Fetch";
import { Menu } from "./Menu";
import { Form, FloatingLabel, Button } from "react-bootstrap";

export function Login({ setAuth }: AuthProp) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [data, setData] = useState({fullname: "", balance: 0});
    const [loggedIn, setLoggedIn] = useState(false);
    const [textDesign, setTextDesign] = useState("link-danger");
    const [error, setError] = useState("");

    const handleLogin = async () =>
    {
        if (email != "")
        {
            if (password != "")
            {
                try 
                {
                    let data = {
                        email: email,
                        password: password
                    }
                    let response = await Fetch("https://localhost:5555/login", data);
                    let user = await response.json();
                    if (response.status == 200)
                    {
                        localStorage.setItem("token", user.token.token);
                        setLoggedIn(true);
                        setData(user.userData);
                        setTextDesign("link-success");
                    }
                    else
                    {
                        setError(user.message);
                        setTextDesign("link-danger");
                    }
                } 
                catch (error) 
                {
                    setError("Request error: " + error);
                }
            }
            else
            {
                setError("Password cannot be empty.");
            }
        }
        else
        {
            setError("Email cannot be empty.");
        }
    }
    if (data && loggedIn)
    {
        return <Menu fullName={data.fullname} balance={data.balance} />
    }
    return(
    <Form className="card p-2"> 
        <h2>Login</h2>
        <FloatingLabel controlId="floatingEmail" label="Email">
            <Form.Control type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        </FloatingLabel>
        <FloatingLabel controlId="floatingPassword" label="Password">
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        </FloatingLabel>
        <Form.Text className={textDesign}>{error}</Form.Text>
        <Button className="w-100 py-2" onClick={handleLogin}>Login</Button>
        <p>Don't have an account? Register <a className="link-primary" onClick={setAuth}>here</a>.</p>
    </Form>
    )
}