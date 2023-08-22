import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");

  let nav = useNavigate();

  const notify = {
    position: "top-center",
    autoClose: 500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username !== "" && password !== "" && userType !== "") {
      axios
        .post("http://localhost:3001/login/", {
          userid: username,
          password: password,
          usertype:userType
        })
        .then((res) => {
          // console.log("console", res);

          if (res.data.recordset && res.data.recordset.length === 1)  {
            toast.success("Login Successfull !!", {
              position: "top-center",
              autoClose: 100,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            // props.setUsername(username);
            props.user(username, userType);
            if(userType==="provider"){
              nav("/provider-start");
            }
              else{
                nav("/choose");
              }
           
          } else {
            toast.error("Username or password or usertype is incorrect !!", notify);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const showpass = () => {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  };

  return (
    <div id="container-login" className="container">
      <h3>Login Page</h3>

      <form onSubmit={handleSubmit} id="form-login">

        <div className="input-field">
          <FaUser className="input-icon" />
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-field">
          <FaLock className="input-icon" />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <input className="pass" type="checkbox" onClick={showpass} />
          Show Password
        </div>

        <div className="input-field">
          <select
            id="user-type"
            name="user-type"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="">----Select user type----</option>
            <option value="user">User</option>
            <option value="provider">Provider</option>
          </select>
        </div>


        <Link to="/register">
          New User? Click here for sign up !
        </Link>
        <div>

        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
