import './App.css'

function App() {
  return (
    <>
      <div id='div_login'>
        <h2>Login</h2>
        <label htmlFor="email"> Email: </label><br />
        <input id="email" type="email" placeholder="Email: "></input><br />
        <label htmlFor="password"> Password: </label><br />
        <input id="password" type="password" placeholder="Password: "></input><br />
        <button onClick={async () => {
          console.log('asd');
          let email = (document.getElementById("email") as HTMLInputElement).value;
          let password = (document.getElementById("password") as HTMLInputElement).value;

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
        }
        }> Login </button>
        <p>Don't have an account? Register <a onClick={ () => {
          document.getElementById("div_login")!.style.display = "none";
          document.getElementById("div_register")!.style.display = "block";
        }}>here</a>.</p>
      </div>
      <div id='div_register'>
        <h2>Register</h2>
        <label htmlFor="register_fullname"> Full name: </label><br />
        <input id="register_fullname" type="text" placeholder="Full name: "></input><br />
        <label htmlFor="register_email"> Email: </label><br />
        <input id="register_email" type="email" placeholder="Email: "></input><br />
        <label htmlFor="register_email_again"> Confirm email: </label><br />
        <input id="register_email_again" type="email" placeholder="Confirm email: "></input><br />
        <label htmlFor="register_password"> Password: </label><br />
        <input id="register_password" type="password" placeholder="Password: "></input><br />
        <label htmlFor="register_password_again"> Confirm password: </label><br />
        <input id="register_password_again" type="password" placeholder="Confirm password: "></input><br />
        <button onClick={async () => {
          console.log("asd");
          let fullname = (document.getElementById("register_fullname") as HTMLInputElement).value;
          let email = (document.getElementById("register_email") as HTMLInputElement).value;
          let email_again = (document.getElementById("register_email_again") as HTMLInputElement).value;
          let password = (document.getElementById("register_password") as HTMLInputElement).value;
          let password_again = (document.getElementById("password_again") as HTMLInputElement).value;

          if (fullname != undefined && email != undefined && email_again != undefined && password != undefined && password_again != undefined) {
            if (email == email_again) {
              if (password == password_again) {
                const user = {
                  fullname: fullname,
                  email: email,
                  password: password
                }
                console.log(user);
                const response = await fetch("https://localhost:5555/register", {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  method: 'POST',
                  body: JSON.stringify(user),
                });
                const data = await response.json();
                console.log(data);
              }
            }
          }
        }}> Register </button>
        <p>Already have an account? Click <a onClick={ () => {
          document.getElementById("div_login")!.style.display = "block";
          document.getElementById("div_register")!.style.display = "none";
        }}>here</a> to login.</p>
      </div>
      <div id='div_board'>
        <p id='full_name'></p>
        <p id='balance'></p>
      </div>
    </>
  )
}

export default App
