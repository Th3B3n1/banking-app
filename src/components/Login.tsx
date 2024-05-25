export function Login() {
    return <div id='div_login'>
        <h2>Login</h2>
        <label htmlFor="email"> Email: </label><br />
        <input id="email" type="email" placeholder="Email: "></input><br />
        <label htmlFor="password"> Password: </label><br />
        <input id="password" type="password" placeholder="Password: "></input><br />
        <p id="login_error"></p>
        <button onClick={async () => {
            console.log('asd');
            let email = (document.getElementById("email") as HTMLInputElement).value;
            let password = (document.getElementById("password") as HTMLInputElement).value;

            if (email != '') {
                if (password != '') {
                    const data = {
                        email: email,
                        password: password
                    }
                    console.log(data);
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
                        localStorage.setItem("date", JSON.stringify(user.token.date));
                        localStorage.setItem("token", JSON.stringify(user.token.token));
                        document.getElementById("div_login")!.style.display = "none";
                        document.getElementById("div_board")!.style.display = "block";
                        let fullname = user.userData.fullname;
                        let balance = user.userData.balance;
                        document.getElementById('full_name')!.innerHTML = fullname;
                        document.getElementById('balance')!.innerHTML = balance;
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
        }}>here</a>.</p>
    </div>
}