import { useState } from "react";
import { States } from "../functions/States";
import { Login } from "./Login";
import { Register } from "./Register";

export function Auth()
{
    const [state, setState] = useState(States.DISPLAY_LOGIN);
    const setAuth = () =>
    {
        switch (state)
        {
            case States.DISPLAY_LOGIN:
                setState(States.DISPLAY_REGISTER);
                break;
            case States.DISPLAY_REGISTER:
                setState(States.DISPLAY_LOGIN);
                break;
            default:
                setState(States.DISPLAY_LOGIN);
                break;
        }
    }
    return(
    <div id="auth">
        {state == States.DISPLAY_LOGIN ? <Login setAuth={setAuth} /> : <Register setAuth={setAuth}/>}
    </div>
    )
}