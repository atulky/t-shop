import React from "react";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function ProviderStart(props) {

    const username = localStorage.getItem("username").toUpperCase();

    let nav = useNavigate();


    const createjourney = () => {
        nav("/provider");
    };

    const verifyticket = () => {

        nav("/verify-ticket");

    };




    return (
        <>
            <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary">
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
                                <Link className="nav-link disabled" to="#" style={{ color: 'green' }}>
                                    Connected Account: {props.account}
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link disabled" to="#">
                                    {username}
                                </Link>
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

            <div className="row" id="buttons">
                <div className="col-6">
                    <button className="button" onClick={createjourney}>
                        Create a Journey
                    </button>
                </div>

                <div className="col-6">
                    <button className="button" onClick={verifyticket}>
                        Verify Ticket
                    </button>
                </div>

            </div>

        </>
    );
}
