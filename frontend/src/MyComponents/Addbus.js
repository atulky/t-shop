import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Addbus.css";
import { ethers } from "ethers";

export default function Addbus(props) {

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [traveller, setTraveller] = useState("");
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);

    let formDataD=[]

    let buy = false

    let journeyid, ticketid, timestamp, buyer

    const username = localStorage.getItem("username").toUpperCase()
    const transportType = localStorage.getItem("selected_mode")


    const notify = {
        position: "top-center",
        autoClose: 700,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const handlesubmit = async (event) => {

        event.preventDefault();
        axios
            .get(`http://localhost:3001/viewJourney?from=${from}&to=${to}&departureDate=${departureDate}&traveller=${traveller}&transportType=${transportType}`)
            .then((res) => {


                formDataD=(res.data.data);
                //console.log(formDataD)
             
                //For Dynamic Pricing !!!!!!

                formDataD.forEach((booking) => {

                    let price = booking.ticketPrice;
                    const travelDate = new Date(booking.startDate);

                    const daysUntilTravel = Math.ceil((travelDate - Date.now()) / (1000 * 60 * 60 * 24));

                    if (daysUntilTravel < 4) {
                        price *= 2;

                    } else if (daysUntilTravel < 7) {
                        price *= 1.5;
                    }

                    if (booking.totalTickets > 10) {
                        price *= 1.2;
                    } else if (booking.totalTickets > 5) {
                        price *= 1.5;
                    }
                    else if (booking.totalTickets > 1) {
                        price *= 2;
                    }

                    booking.ticketPrice = Math.round(price);
                });

               // console.log(formDataD)
               setFormData(formDataD)

                if (res.status === 200 && res.data.data.length >= 1) {
                    toast.success(" Fetched Successfully !!", notify);
                    //  reset();
                }
                else if (res.data.data.length === 0) {

                    toast.error("Sorry, Tickets are not available !!", notify);

                }

                else {
                    toast.error("Something Went Wrong !!", notify);
                }

            })
            .catch((error) => {
                console.log(error);
            });

    }

    let reset = () => {
        setFrom("")
        setTo("")
        setDepartureDate("")
        setTraveller("")
    };


    const handleBuyTicket = async (id, quantity, price) => {

        setLoading(true);
        price = (price * quantity) / 10 ** 18;
        price = price.toFixed(20)
        const { contract } = props.state;
        const amount = { value: ethers.utils.parseEther(price.toString()) };
        const transaction = await contract.buyTicket(id, quantity, amount);
        const createJourneyReceipt = await transaction.wait(2); // waits for 2 confirmations before returning the transaction receipt. 

        const eventLogs = createJourneyReceipt.events;
        const eventbc = eventLogs[1];

      //  console.log(eventbc)

        buyer = eventbc.args.buyer;
       // console.log('Buyer', buyer);

        journeyid = eventbc.args.journeyId._hex;
        journeyid = parseInt(journeyid, 16);
        //console.log('J-ID', journeyid);

        ticketid = eventbc.args.ticketId._hex;
        ticketid = parseInt(ticketid, 16);
       // console.log('T-ID', ticketid);

        timestamp = eventbc.args.timestamp._hex;
        timestamp = parseInt(timestamp, 16);
        timestamp = new Date(timestamp * 1000);
        timestamp = timestamp.toISOString();
       // console.log('timestamp', timestamp);

       // console.log('EVENTS', eventbc)

        buy = true

        if (buy) {
            setLoading(false);
            toast.success(" Ticket Booked Successfully !!", notify);
            setFormData([])
            formDataD=[]
            buy = false

            //console.log(createJourneyReceipt)
            console.log("Done !!!")

            const jData = {

                journeyId: journeyid,
                totalTickets: quantity
            };

            const ViewData = {

                journeyId: journeyid,
                ticketId: ticketid,
                timeStamp: timestamp,
                buyer: buyer,
                quantity: quantity,
                verified:"false"

            };

           // console.log('Details', ViewData)


            axios
                .post("http://localhost:3001/editjourney/", jData)
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

            axios
                .post("http://localhost:3001/insertTicket/", ViewData)
                .then((res) => {

                    //console.log(res.status, journeyCreated)
                    if (res.status === 200) {
                        console.log("Inserted Successfully !!")
                    } else {
                        console.log("Something Went Wrong !!");
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

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
                                <Link className="nav-link" to="/choose" id="mainpage">
                                    Change Transport Mode
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/view-tickets" id="mainpage">
                                    View Your Tickets
                                </Link>
                            </li>


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

            <div className="form-container" id="form-addline">
                <form onSubmit={handlesubmit}>

                    <div className="form-header">
                        <h1>View Available Journeys</h1>
                    </div>

                    {loading ? <h3 style={{ color: "red" }}>Please wait until your ticket is booked, and being confirmed with atleast 2 confirmations !!</h3> : ""}

                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="from">From:</label>
                            </div>

                            <div className="col-lg-9">
                                <select
                                    className="form-control"
                                    id="from"
                                    name="from"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                >
                                    <option value="" selected="selected">
                                        ---Select----
                                    </option>
                                    <option value="delhi">Delhi</option>
                                    <option value="bangalore">Bangalore</option>
                                    <option value="mumbai">Mumbai</option>
                                    <option value="chennai">Chennai</option>
                                    <option value="lucknow">Lucknow</option>
                                    <option value="patna">Patna</option>

                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="to">To:</label>
                            </div>

                            <div className="col-lg-9">
                                <select
                                    className="form-control"
                                    id="to"
                                    name="to"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                >
                                    <option value="" selected="selected">
                                        ---Select----
                                    </option>
                                    <option value="delhi">Delhi</option>
                                    <option value="bangalore">Bangalore</option>
                                    <option value="mumbai">Mumbai</option>
                                    <option value="chennai">Chennai</option>
                                    <option value="lucknow">Lucknow</option>
                                    <option value="patna">Patna</option>

                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="ddate">Departure date:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="date"
                                    id="ddate"
                                    name="ddate"
                                    className="form-control"
                                    value={departureDate}
                                    onChange={(event) => setDepartureDate(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="traveller">Traveller:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="text"
                                    id="traveller"
                                    name="traveller"
                                    className="form-control"
                                    value={traveller}
                                    onChange={(event) => setTraveller(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="d-grid gap-2 col-6 mx-auto">
                        <button className="btn btn-primary" type="button" onClick={reset}>
                            Reset
                        </button>
                        <button className="btn btn-success" type="submit">
                            View Available Tickets
                        </button>
                    </div>
                </form>
            </div>

            {formData.length >= 1 ? (<>
                <div className="table-container">

                    <table>
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>To</th>
                                <th>Available Tickets</th>
                                <th>Ticket Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.map((data) => (
                                <tr key={data.journeyId}>
                                    <td>{data.source}</td>
                                    <td>{data.destination}</td>
                                    <td>{data.totalTickets}</td>
                                    <td>{data.ticketPrice}</td>

                                    <td>
                                        <button className="btn btn-primary" onClick={() => handleBuyTicket(data.journeyId, traveller, data.ticketPrice)} >Book Now</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></>) : ""}
        </>
    );
}
