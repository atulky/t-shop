const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sql = require("mssql");

const config = {
  user: "komal",
  password: "Induyadav@#22618",
  server: "localhost",
  database: "tms",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

sql.connect(config, function (err) {
  if (err) console.error("Error connecting to database: " + err);
  else console.log("Connected to database");
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Node.js server for Ticket Management System !!</h1>");
});

app.post("/login", async (req, res) => {
  try {
    const { userid, password, usertype } = req.body;

    const query =
      "SELECT * FROM login WHERE userid = @userid AND password COLLATE Latin1_General_BIN = @password COLLATE Latin1_General_BIN and usertype=@usertype";

    const request = new sql.Request();

    // Add parameters to the query
    request.input("userid", sql.NVarChar, userid);
    request.input("password", sql.NVarChar, password);
    request.input("usertype", sql.NVarChar, usertype);

    const result = await request.query(query);

    //console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/insertuser", async (req, res) => {
  try {
    // define query to insert form data into database
    const query = `
        INSERT INTO login (userid, password,usertype)
        VALUES ('${req.body.userid}', '${req.body.password}', '${req.body.usertype}')
      `;

    // execute query to insert form data
    const result = await sql.query(query);

    // send success response
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    // log any errors
    //console.log(error);

    // send error response
    res
      .status(500)
      .send({ success: false, message: "Failed to insert form data" });
  }
});

app.post("/createJourney", async (req, res) => {
  try {
    // console.log(req)
    // define query to insert form data into database
    const query = `
        INSERT INTO journeyDetails (journeyId,transportType,startDate,endDate, source,destination,totalTickets,ticketPrice,timeStamp, created_by)
        VALUES ('${req.body.journeyId}','${req.body.transportType}', '${req.body.startDate}',
        '${req.body.endDate}','${req.body.source}','${req.body.destination}',
         '${req.body.totalTickets}', '${req.body.ticketPrice}','${req.body.timeStamp}', '${req.body.created_by}')
      `;

    // execute query to insert form data
    const result = await sql.query(query);

    // send success response
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    // log any errors
    console.log(error);

    // send error response
    res
      .status(500)
      .send({ success: false, message: "Failed to insert form data" });
  }
});

app.get("/viewJourney", async (req, res) => {


  const from = req.query.from;
  const to = req.query.to;
  const departureDate = new Date(req.query.departureDate);
  const traveller = req.query.traveller;
  const transportType = req.query.transportType;

  try {
    const data = `SELECT * FROM journeyDetails
    WHERE source = @from AND destination = @to
    AND startDate >=@departureDate
    AND totalTickets >= @traveller and transportType = @transportType
`;

    const request = new sql.Request();

    request.input("from", sql.VarChar, from);
    request.input("to", sql.VarChar, to);
    request.input("departureDate", sql.Date, departureDate.toISOString());
    request.input("traveller", sql.Int, traveller);
    request.input("transportType", sql.VarChar, transportType);

    const result = await request.query(data);

    // Return the result as JSON
    res.json({ data: result.recordset });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});


app.post("/editjourney", async (req, res) => {

  try {

    const query = `
    UPDATE journeyDetails 
    SET totalTickets = (
        SELECT totalTickets FROM journeyDetails WHERE journeyId = '${req.body.journeyId}'
    ) - '${req.body.totalTickets}'
    WHERE journeyId = '${req.body.journeyId}'
    
`;

    const result = await sql.query(query);
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .send({ success: false, message: "Failed to insert form data" });
  }
});

app.post("/insertTicket", async (req, res) => {
  try {
    
    const query = `
        INSERT INTO ticketDetails (buyer,journeyId,ticketId,timeStamp,quantity,verified)
        VALUES ( '${req.body.buyer}','${req.body.journeyId}','${req.body.ticketId}',
        '${req.body.timeStamp}','${req.body.quantity}','${req.body.verified}')
      `;

    // execute query to insert form data
    const result = await sql.query(query);

    // send success response
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    // log any errors
    console.log(error);

    // send error response
    res
      .status(500)
      .send({ success: false, message: "Failed to insert form data" });
  }
});

app.get("/viewtickets", async (req, res) => {



  const buyer = req.query.buyer;

  try {

    const data = `
      SELECT *
      FROM ticketDetails
      INNER JOIN journeyDetails ON ticketDetails.journeyId = journeyDetails.journeyId
      WHERE ticketDetails.buyer = @buyer
      ORDER BY ticketDetails.journeyId DESC
    `;

    const request = new sql.Request();

    request.input("buyer", sql.VarChar, buyer);
  
    const result = await request.query(data);

    //console.log(result)

    // Return the result as JSON
    res.json({ data: result.recordset });
  } catch (err) {
    // Return an error if something went wrong
    res.status(500).json({ error: err.message });
  }
});


app.get("/verifyTickets", async (req, res) => {

  const buyer = req.query.buyer;
  const verified="false"

  try {

    const data = `
      SELECT *
      FROM ticketDetails
      WHERE ticketDetails.buyer = @buyer and verified=@verified
      ORDER BY ticketDetails.journeyId DESC
    `;

    const request = new sql.Request();

    request.input("buyer", sql.VarChar, buyer);
    request.input("verified", sql.VarChar, verified);
  
    const result = await request.query(data);

    //console.log(result)

    // Return the result as JSON
    res.json({ data: result.recordset });
  } catch (err) {
    // Return an error if something went wrong
    res.status(500).json({ error: err.message });
  }
});

app.post("/editTickets", async (req, res) => {

  try {

    const query = `
    UPDATE ticketDetails
    SET verified = '${req.body.verified}'
    WHERE ticketId = '${req.body.ticketId}'
    
`;

    const result = await sql.query(query);
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .send({ success: false, message: "Failed to insert form data" });
  }
});




app.listen(3001, () => {
  console.log("Running on port 3001")
})