import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyTicket = (props) => {

    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);

    const storedUsername = localStorage.getItem("username").toUpperCase();
    // const transportType = localStorage.getItem("selected_mode")

    let buy = false

    const notify = {
        position: "top-center",
        autoClose: 700,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    useEffect(() => {

        axios
            .get(`http://localhost:3001/verifyTickets?buyer=${props.account}`)
            .then((response) => {
                setFormData(response.data.data);
               // console.log(formData)
            });
    }, []);

    const handleVerifyTicket = async (id, buyer) => {

        setLoading(true);
        const { contract } = props.state;
        const transaction = await contract.verifyTicket(id, buyer);
        const createJourneyReceipt = await transaction.wait(2); // waits for 2 confirmations before returning the transaction receipt. 

        console.log('Verify-Ticket',createJourneyReceipt)

        buy = true

        if (buy) {
            setLoading(false);
            toast.success(" Ticket Verified Successfully !!", notify);
            setFormData([])
            buy = false

            //console.log(createJourneyReceipt)
          //  console.log("Done !!!")


            const ViewData = {

                ticketId: id,
                verified: "true"

            };

            //console.log('Details', ViewData)


            axios
                .post("http://localhost:3001/editTickets/", ViewData)
                .then((res) => {

                    //console.log(res.status, journeyCreated)
                    if (res.status === 200) {
                        console.log("Updated Successfully !!")
                    } else {
                        console.log("Something Went Wrong !!");
                    }
                })
                .catch((error) => {
                    console.log(error);
                });


        }

    }

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
                                <Link className="nav-link" to="/provider-start" id="mainpage">
                                   GoTo Main Gage
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
        </nav >

                <h2>Ticket Details</h2>

                {loading ? <h3 style={{ color: "red" }}>Please wait until ticket is verified, and being confirmed with atleast 2 confirmations !!</h3> : ""}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticket Id</th>
                                <th>Buyer</th>
                                <th>Total Tickets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.map((data) => (
                                <tr key={data.journeyId}>


                                    <td>{data.ticketId}</td>
                                    <td>{data.buyer}</td>
                                    <td>{data.quantity}</td>

                                    <td>
                                        <button className="btn btn-primary" onClick={() => handleVerifyTicket(data.ticketId, data.buyer)} >Verify</button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );

};

export default VerifyTicket;
