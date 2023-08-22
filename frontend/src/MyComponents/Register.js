import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import "./Register.css";
import { useNavigate } from "react-router-dom";


function Register() {
  const [userid, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");

  let nav = useNavigate();
  const notify = {
    position: "top-center",
    autoClose: 700,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const handlesubmit = (event) => {
    event.preventDefault();

    // create object with form data
    const formData = {

      userid: userid,
      password: password,
      usertype:userType
    };

    // send form data to server using axios post request
    axios
      .post("http://localhost:3001/insertuser/", formData)
      .then((res) => {
        // console.log(res.data); // log response data to console
        // call reset function to clear form fields
        if (res.status === 200) {
          toast.success("Registered Successfully!! Please login with your credentials now !!", notify);
        } else {
          toast.error("Something Went Wrong !!", notify);
        }
        reset();
        nav("/")
      })
      .catch((error) => {
        console.log(error); // log any errors to console
      });
  };

  let reset = () => {
    setUserId("");
    setPassword("");
    setUserType("");

  };

  return (
    <>

      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="#">
            T-Shop
          </Link>


        </div>
      </nav>

      <div className="form-container">

          <div className="form-header">
            <h1 className="h1">Registration Form</h1>
          </div>

          <form onSubmit={handlesubmit}>

          <div className="form-group">
            <div className="row">
              <div className="col-lg-3">
                <label htmlFor="username">Username:</label>
              </div>
              <div className="col-lg-9">
                <input
                 className="form-control"
                  type="text"
                  id="username"
                  name="username"
                  value={userid}
                  onChange={(event) => setUserId(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="col-lg-3">
                <label htmlFor="password">Password:</label>
              </div>
              <div className="col-lg-9">
                <input
                 className="form-control"
                  type="text"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="col-lg-3">
                <label htmlFor="user_type">Select UserType:</label>
              </div>

              <div className="col-lg-9">
                <select
                  className="form-control"
                  id="user_type"
                  name="user_type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="" selected="selected">
                    ---Select UserType----
                  </option>
                  <option value="user">User</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-grid gap-2 col-6 mx-auto">
            <button className="btn btn-primary" type="button" onClick={reset}>
              Reset
            </button>
            <button className="btn btn-success" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Register;
