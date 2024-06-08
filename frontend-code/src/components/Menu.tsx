import { useState } from "react";
import { Fetch } from "../functions/Fetch";
import { Button, FloatingLabel, Form } from "react-bootstrap";

interface Props {
  fullName?: string;
  balance?: number;
}

export function Menu(props: Props) 
{
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [textDesign, setTextDesign] = useState("link-danger");
  const [error, setError] = useState("");

  const handleChangePassword = async () =>
  {
    if (oldPassword != '' && newPassword != '') 
    {
      if (newPassword.length > 7) 
      {
        if (oldPassword != newPassword) 
        {
          const changes = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            token: localStorage.getItem('token')
          }
          try
          {
            let response = await Fetch("https://localhost:5555/changePassword", changes);
            let user = await response.json();
            if (response.status == 200)
            {
              setTextDesign("link-success");
            }
            else
            {
              setTextDesign("link-danger");
            }
            setError(user.message);
          }
          catch (error) 
          {
            setError("Request error: " + error);
          }
        } 
        else 
        {
          setError("Passwords cannot be the same.");
        }
      } 
      else 
      {
        setError("Password needs to be at least 8 characters long.");
      }
    } 
    else 
    {
      setError("Password(s) cannot be empty.");
    }
  }
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };
  return( 
  <Form>
    <Form.Group className="text-start card p-2">
      <h2>Name: {props.fullName}</h2>
      <h2>Balance: {props.balance}Ft</h2>
    </Form.Group>
    <Form.Group id="changePassword" className="card p-2">
      <h3>Change password</h3>
      <FloatingLabel controlId="floatingOldPassword" label="Old password">
          <Form.Control type="password" placeholder="Old password" onChange={(e) => setOldPassword(e.target.value)}/>
      </FloatingLabel>
      <FloatingLabel controlId="floatingNewPassword" label="New password">
          <Form.Control type="password" placeholder="New password" onChange={(e) => setNewPassword(e.target.value)}/>
      </FloatingLabel>
      <Form.Text>*Passwords must contain at least 8 characters, 1 lowercase and 1 uppercase letters, 1 number and 1 special character.</Form.Text>
      <Form.Text className={textDesign}>{error}</Form.Text>
      <Button className="py-2" onClick={handleChangePassword}> Change </Button>
    </Form.Group>
    <br />
    <Button className="py-2" onClick={handleLogout}>Logout</Button>
  </Form>
  )
}