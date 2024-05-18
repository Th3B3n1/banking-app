import { useState } from 'react'
import './App.css'

function App() {
  const API = "https://localhost:5555/"
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
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
          console.log(user);
        }
        }> Login </button>
      </div>
    </>
  )
}

export default App
