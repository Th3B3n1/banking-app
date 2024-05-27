import './App.css'
import bckimg from '../public/OTP_header_img.jpg'
import logo from '../public/otp_copy_logo.svg'

function App() {
  return (
    <>
      <div className="login-page-container">
        <div className="container">
          <div className="img"> <img src={bckimg} alt="kep" id='img_resp' /></div>
          <div className="text">
            <h2>Join our bank today</h2> 
            <h4>Choose ApexBank for innovative digital banking, competitive rates, personalized financial planning, and exceptional customer service. Secure your financial future with a bank that puts you first.</h4>
            </div>
        </div>

        <div className="credentials-container">
          
          <img src={logo} alt="logo_copy" id='img_logo' />
            <div className="flex-container" id='div_login'>

              <h2>Login</h2>
              <div>
                <label htmlFor="email"> Email: </label><br />
                <input id="email" type="email" placeholder="example@gmail.com "></input><br />
              </div>
              <div>
                <label htmlFor="password"> Password: </label><br />
                <input id="password" type="password" placeholder="mom1234"></input><br />
              </div>
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
      {/* Register form */}
      <div className='credentials-container input-margin' id='div_register'>
        <div className="flex-container"></div>
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
          let fullname = (document.getElementById("register_fullname") as HTMLInputElement).value;
          let email = (document.getElementById("register_email") as HTMLInputElement).value;
          console.log("asd");
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
          document.getElementById("div_login")!.style.display = "flex";
          document.getElementById("div_register")!.style.display = "none";
        }}>here</a> to login.</p>
      </div>
      <div id='div_board'>
        <p id='full_name'></p>
        <p id='balance'></p>
          </div>
        </div>
      </div>


    </>
  )
}

export default App
