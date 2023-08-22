import React, { useState } from "react";
import "./Choose.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Choose(props) {
  let [selected_mode, set_selected_mode] = useState("");

  const username = localStorage.getItem("username").toUpperCase();

  let nav = useNavigate();

  const handlesubmit = (e) => {

    e.preventDefault();
    if (selected_mode !== "") {
      props.selected_mode(selected_mode);

    }
    if (selected_mode === "bus" || selected_mode === "train" || selected_mode === "air") {
      nav("/bus-ticket")
    }
  };

  return (
    <>

      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="#">
            T-Shop
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto">

              <li className="nav-item">
                <Link className="nav-link disabled" to="#">
                  Connected Account: {props.account}
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link disabled" to="#">{username}</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="fa fa-power-off" id="icon"></i>
                </Link>
              </li>


            </ul>
          </div>
        </div>
      </nav>

      <div className="form-container" id="form-choose">
        <form onSubmit={handlesubmit}>
          <div className="form-header">
            <h1 className="h1">Select Mode Of Transportation</h1>
          </div>
          <div className="form-group">
            <div className="row">
              <div className="col-lg-4">
                <label htmlFor="select_memo">Modes:</label>
              </div>

              <div className="col-lg-8">
                <select
                  value={selected_mode}
                  className="form-control"
                  id="select_mode"
                  name="mode"
                  onChange={(e) => set_selected_mode(e.target.value)}
                >
                  <option value="" selected="selected">
                    ---Select---
                  </option>
                  <option value="air">
                    Air
                  </option>
                  <option value="bus">
                    Bus
                  </option>
                  <option value="train">
                    Train
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button className="btn btn-success" type="submit" id="btn-choose">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
