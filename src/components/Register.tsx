export function Register() {
    return <div id='div_register'>
        <h2>Register</h2>
        <label htmlFor="register_fullname"> Full name: </label><br />
        <input id="register_fullname" type="text" placeholder="Full name: "></input><br />
        <label htmlFor="register_email"> Email: </label><br />
        <input id="register_email" type="email" placeholder="Email: "></input><br />
        <label htmlFor="register_email_again"> Confirm email: </label><br />
        <input id="register_email_again" type="email" placeholder="Confirm email: "></input><br />
        <p>*Passwords must contain at least 8 characters, 1 lowercase and 1 uppercase letters, 1 number and 1 special character.</p>
        <label htmlFor="register_password"> Password: </label><br />
        <input id="register_password" type="password" placeholder="Password: "></input><br />
        <label htmlFor="register_password_again"> Confirm password: </label><br />
        <input id="register_password_again" type="password" placeholder="Confirm password: "></input><br />
        <p id="reg_error"></p>
        <button onClick={async () => {
            let fullname = (document.getElementById("register_fullname") as HTMLInputElement).value;
            let email = (document.getElementById("register_email") as HTMLInputElement).value;
            let email_again = (document.getElementById("register_email_again") as HTMLInputElement).value;
            let password = (document.getElementById("register_password") as HTMLInputElement).value;
            let password_again = (document.getElementById("register_password_again") as HTMLInputElement).value;

            if (fullname != '' && email != '' && email_again != '' && password != '' && password_again != '') {
                if (password.length > 7) {
                    if (email == email_again) {
                        if (password == password_again) {
                            
                            const user = {
                                fullname: fullname,
                                email: email,
                                password: password
                            }

                            const response = await fetch("https://localhost:5555/register", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: 'POST',
                                body: JSON.stringify(user),
                            });
                            const data = await response.json();
                            /*szarFos!4*/
                            /*testkata@test.hu*/
                            if (response.status != 200) {
                                document.getElementById("reg_error")!.innerHTML = data.message;
                            } else {
                                document.getElementById("reg_error")!.innerHTML = "Registration has been done successfully, please login on the login screen, redirecting...";
                                setTimeout( () => {
                                    document.getElementById("div_login")!.style.display = "block";
                                    document.getElementById("div_register")!.style.display = "none";
                                }, 2500);
                            }
                        } else {
                            document.getElementById("reg_error")!.innerHTML = "Passwords do not match.";
                        }
                    } else {
                        document.getElementById("reg_error")!.innerHTML = "Emails do not match.";
                    }
                } else {
                    document.getElementById("reg_error")!.innerHTML = "Passwords need to be at least 8 characters long.";
                    console.log(password.length);
                }
            } else {
                document.getElementById("reg_error")!.innerHTML = "Full name/password(s)/email(s) can't be empty.";
            }
        }}> Register </button>
        <p>Already have an account? Click <a onClick={() => {
            document.getElementById("div_login")!.style.display = "block";
            document.getElementById("div_register")!.style.display = "none";
        }}>here</a> to login.</p>
    </div>
}