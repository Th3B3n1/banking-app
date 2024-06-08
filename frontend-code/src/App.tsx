import { useEffect, useState } from 'react'
import { Fetch } from './functions/Fetch'
import { Menu } from './components/Menu'
import { Auth } from './components/Auth'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [response, setResponse] = useState({fullname: "", balance: 0})
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() =>
  {
    async function sync()
    {
      let token = {token: localStorage.getItem('token')};
      if (token.token != undefined)
      {
        try
        {
          let response = await Fetch("https://localhost:5555/login", token);
          let data = await response.json();
          console.log(data)
          switch (response.status)
          {
            case 200:
              setResponse(data.userData);
              setLoggedIn(true);
              break;
            default:
              setLoggedIn(false);
              break;
          }
        }
        catch (error)
        {
          alert(error);
        }
      }
      else
      {
        setLoggedIn(false);
      }
    }
    sync();
  }, [])
  return(
  <>
    {loggedIn ? <Menu fullName={response.fullname} balance={response.balance}/> : <Auth />}
  </>
  )
}

export default App
