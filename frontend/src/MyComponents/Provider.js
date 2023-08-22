import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Provider(props) {

    const [transportType, setTransportType] = useState("");
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalTickets, setTotalTickets] = useState("");
    const [ticketPrice, setTicketPrice] = useState("");
    const [loading, setLoading] = useState(false);
    let journeyCreated = false
    let journeyid, tprice, timestamp

    const username = localStorage.getItem("username").toUpperCase()

    const notify = {
        position: "top-center",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const handlesubmit = async (event) => {

        event.preventDefault();

        if (source === destination) {
            toast.error("Source and Destination Can't be same !!", notify);
        }
        else {

            setLoading(true);

            await createJourneyBC()

            const formData = {

                journeyId: journeyid,
                transportType: transportType,
                startDate: startDate,
                endDate: endDate,
                source: source,
                destination: destination,
                totalTickets: totalTickets,
                ticketPrice: ticketPrice,
                timeStamp: timestamp,
                created_by: username

            };
            // console.log(formData)

            axios
                .post("http://localhost:3001/createjourney/", formData)
                .then((res) => {

                    //console.log(res.status, journeyCreated)
                    if (res.status === 200 && journeyCreated) {
                        setLoading(false);
                        toast.success("Journey Created Successfully !!", notify);
                        journeyCreated = false
                    } else {
                        toast.error("Something Went Wrong !!", notify);
                    }
                    reset();
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    }

    let reset = () => {
        setTransportType("")
        setStartDate("")
        setEndDate("")
        setTotalTickets("")
        setTicketPrice("")
        setSource("")
        setDestination("")
    };

    const createJourneyBC = async (event) => {

        const { contract } = props.state;
        let startDateUnix = new Date(startDate);
        let endDateUnix = new Date(endDate);
        startDateUnix = Math.floor(startDateUnix.getTime() / 1000);
        endDateUnix = Math.floor(endDateUnix.getTime() / 1000);

        const transaction = await contract.createJourney(startDateUnix, endDateUnix, ticketPrice);

        // Get the transaction receipt
        const createJourneyReceipt = await transaction.wait(2); // waits for 2 confirmations before returning the transaction receipt. 
        const eventLogs = createJourneyReceipt.events;
        const eventbc = eventLogs[0];

        console.log('Journey',eventbc)

        timestamp = eventbc.args.timestamp._hex;
        timestamp = parseInt(timestamp, 16);
        timestamp = new Date(timestamp * 1000);
        timestamp = timestamp.toISOString();
        console.log('timestamp', timestamp);

        journeyid = eventbc.args.journeyId._hex;
        journeyid = parseInt(journeyid, 16);
        console.log('J-ID', journeyid);

        let startdate = eventbc.args.startDate._hex;
        startdate = parseInt(startdate, 16);
        startdate = new Date(startdate * 1000);
        startdate = startdate.toString();
        console.log('start-Date', startdate);

        let enddate = eventbc.args.endDate._hex;
        enddate = parseInt(enddate, 16);
        enddate = new Date(enddate * 1000);
        enddate = enddate.toString();
        console.log('end-Date', enddate);

        tprice = eventbc.args.ticketPrice._hex;
        tprice = parseInt(tprice, 16);
        console.log('tprice', tprice);

        journeyCreated = true
        // console.log(journeyCreated)

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
                                <Link className="nav-link" to="/provider-start" id="mainpage">
                                   GoTo Main Page
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
                    {loading ? <h3 style={{ color: "red" }}>Please wait until journey is created, and being confirmed with atleast 2 confirmations !!</h3> : ""}
                    <div className="form-header">
                        <h1>Create Journey</h1>
                    </div>

                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="transport_type">Select Transport Type:</label>
                            </div>

                            <div className="col-lg-9">
                                <select
                                    className="form-control"
                                    id="transport_type"
                                    name="transport_type"
                                    value={transportType}
                                    onChange={(e) => setTransportType(e.target.value)}
                                >
                                    <option value="" selected="selected">
                                        ---Select TransportType----
                                    </option>
                                    <option value="bus">Bus</option>
                                    <option value="train">Train</option>
                                    <option value="air">Air</option>

                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="source">Select Source:</label>
                            </div>

                            <div className="col-lg-9">
                                <select
                                    className="form-control"
                                    id="source"
                                    name="source"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                >
                                    <option value="" selected="selected">
                                        ---Select Source----
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
                                <label htmlFor="dest">Select Destination:</label>
                            </div>

                            <div className="col-lg-9">
                                <select
                                    className="form-control"
                                    id="dest"
                                    name="dest"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                >
                                    <option value="" selected="selected">
                                        ---Select Destination----
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
                                <label htmlFor="start_date">Start date:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="end_date">End date:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="total_tickets">Total Tickets:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="text"
                                    id="total_tickets"
                                    name="total_tickets"
                                    className="form-control"
                                    value={totalTickets}
                                    onChange={(event) => setTotalTickets(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="row">
                            <div className="col-lg-3">
                                <label htmlFor="ticket_price">Ticket Price:</label>
                            </div>
                            <div className="col-lg-9">
                                <input
                                    type="text"
                                    id="ticket_price"
                                    name="ticket_price"
                                    className="form-control"
                                    value={ticketPrice}
                                    onChange={(event) => setTicketPrice(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="d-grid gap-2 col-6 mx-auto">
                        <button className="btn btn-primary" type="button" onClick={reset}>
                            Reset
                        </button>
                        <button className="btn btn-success" type="submit">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
