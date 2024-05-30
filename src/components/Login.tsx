import { useState } from "react";
import { Menu } from "./Menu";
import { Fetch } from "./Fetch";
import { AuthProp } from "./AuthProp";

export function Login({ setAuth }: AuthProp) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [data, setData] = useState({fullname: "", balance: 0});
    const [loggedIn, setLoggedIn] = useState(false);

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
                    if (response.ok)
                    {
                        localStorage.setItem("token", user.token.token);
                        setLoggedIn(true);
                        setData(user.userData);
                    }
                    else
                    {
                        setError(user.message);
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
    <div id='div_login'>
        <h2>Login</h2>
        <label htmlFor="email"> Email: </label><br />
        <input id="email" type="email" placeholder="Email: " onChange={(e) => setEmail(e.target.value)}></input><br />
        <label htmlFor="password"> Password: </label><br />
        <input id="password" type="password" placeholder="Password: " onChange={(e) => setPassword(e.target.value)}></input><br />
        <p id="login_error">{error}</p>
        <button onClick={handleLogin}> Login </button>
        <p>Don't have an account? Register <a onClick={setAuth}>here</a>.</p>
    </div>)
}