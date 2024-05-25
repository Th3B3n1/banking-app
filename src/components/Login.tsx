import { Menu } from "./Menu";

export function Login() {
    let token = localStorage.getItem('token');
    console.log(token);
    if (token?.length == 5) {
        loginfetch(JSON.stringify(token))
    } else {
        return <div id='div_login'>
            <h2>Login</h2>
            <label htmlFor="email"> Email: </label><br />
            <input id="email" type="email" placeholder="Email: "></input><br />
            <label htmlFor="password"> Password: </label><br />
            <input id="password" type="password" placeholder="Password: "></input><br />
            <p id="login_error"></p>
            <button onClick={async () => {
                let email = (document.getElementById("email") as HTMLInputElement).value;
                let password = (document.getElementById("password") as HTMLInputElement).value;
                (document.getElementById("password") as HTMLInputElement).value = '';

                if (email != '') {
                    if (password != '') {
                        const data = {
                            email: email,
                            password: password
                        }
                        const response = await fetch("https://localhost:5555/login", {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: 'POST',
                            body: JSON.stringify(data),
                        });
                        const user = await response.json();
                        if (response.ok) {
                            console.log(user);
                            localStorage.setItem("date", user.token.date);
                            localStorage.setItem("token", user.token.token);
                            console.log(user.token.token + '||');
                            document.getElementById("div_login")!.style.display = "none";
                            let fullname = user.userData.fullname;
                            let balance = user.userData.balance;
                            console.log(fullname + '||' + balance);
                            <Menu fullName={fullname} balance={balance} />
                            document.getElementById("div_board")!.style.display = "block";
                        }
                    } else {
                        console.log("asd");
                        document.getElementById("login_error")!.innerHTML = "Password cannot be empty."
                    }
                } else {
                    console.log("asdf");
                    document.getElementById("login_error")!.innerHTML = "Email cannot be empty."
                }
            }
            }> Login </button>
            <p>Don't have an account? Register <a onClick={() => {
                document.getElementById("div_login")!.style.display = "none";
                document.getElementById("div_register")!.style.display = "block";
                localStorage.clear();
            }}>here</a>.</p>
        </div>
    }
}

async function loginfetch(token: string) {
    const data = {
        token: token
    }
    const response = await fetch("https://localhost:5555/login", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data),
    });
    const user = await response.json();
    console.log(user);
    if (response.status == 200) {
        let fullname = user.userData.fullname;
        let balance = user.userData.balance;
        document.getElementById("div_board")!.style.display = "block";
        return <Menu fullName={fullname} balance={balance} />
    }
}