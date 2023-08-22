import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ViewTicket = (props) => {
    const [formData, setFormData] = useState([]);

    const storedUsername = localStorage.getItem("username").toUpperCase();
    // const transportType = localStorage.getItem("selected_mode")


    useEffect(() => {

        axios
            .get(`http://localhost:3001/viewtickets?buyer=${props.account}`)
            .then((response) => {
                setFormData(response.data.data);
            });
    }, []);


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
                                <Link className="nav-link" to="/choose" id="mainpage">
                                    Change Transport Mode
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/bus-ticket" id="mainpage">
                                    Book Ticket
                                </Link>
                            </li>


                            <li className="nav-item">
                                <Link className="nav-link disabled" to="#" style={{ color: 'green' }}>
                                    Connected Account: {props.account}
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link disabled" to="#">
                                    {storedUsername}
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

            <h2>Ticket Details</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Ticket Id</th>
                            <th>Source</th>
                            <th>Destination</th>
                            <th>Journey Date</th>
                            <th>Total Ticket</th>
                            <th>Transport Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.map((data) => (
                            <tr key={data.journeyId}>


                                <td>{data.ticketId}</td>
                                <td>{data.source}</td>
                                <td>{data.destination}</td>
                                <td>{data.startDate}</td>
                                <td>{data.quantity}</td>
                                <td>{data.transportType}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ViewTicket;
