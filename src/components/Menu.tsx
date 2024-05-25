interface Props {
  fullName?: string;
  balance?: number;
}

export function Menu(props: Props) {
  console.log('menu betolt');
  return <div id='div_board'>
    <p id='full_name'>{props.fullName}</p>
    <p id='balance'>{props.balance}</p>
    <div id="change_password">
      <h3>Change password</h3>
      <label htmlFor="old_password">Old password: </label><br />
      <input type="password" id="old_password" placeholder="Old password"></input><br />
      <p>*Passwords must contain at least 8 characters, 1 lowercase and 1 uppercase letters, 1 number and 1 special character.</p>
      <label htmlFor="new_password">New password: </label><br />
      <input type="password" id="new_password" placeholder="New password"></input><br />
      <p id="menu_error"></p>
      <button onClick={async () => {
        let old_password = (document.getElementById("old_password") as HTMLInputElement).value;
        let new_password = (document.getElementById("new_password") as HTMLInputElement).value;

        if (old_password != '' && new_password != '') {
          if (new_password.length > 7) {
            if (old_password != new_password) {
              const changes = {
                oldPassword: old_password,
                newPassword: new_password,
                token: localStorage.getItem('token')
              }
              console.log(changes);
              const response = await fetch("https://localhost:5555/changePassword", {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(changes),
              });
              const data = await response.json();
              if (response.status != 200) {
                document.getElementById("menu_error")!.innerHTML = data.message;
              } else {
                document.getElementById("menu_error")!.innerHTML = "Password changed successfully."
              }
            } else {
              document.getElementById("menu_error")!.innerHTML = "Passwords cannot be the same."
            }
          } else {
            document.getElementById("menu_error")!.innerHTML = "Password needs to be at least 8 characters long.";
          }
        } else {
          document.getElementById("menu_error")!.innerHTML = "Password(s) cannot be empty."
        }

      }}> Change </button>
    </div>
    <br />
    <button onClick={() => {
      document.getElementById('div_board')!.style.display = 'none';
      (document.getElementById("email") as HTMLInputElement).value = '';
      document.getElementById('div_login')!.style.display = 'block';
      localStorage.clear();
    }}>Logout</button>
  </div>

}