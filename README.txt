Note 1:

(1) The .env file contains the following parameters:

SEPOLIA_URL =https://eth-sepolia.g.alchemy.com/v2/uIrsQQeQ2IFWXqJ1bRSFAT-n5kie1T6F  -> An app should be created in https://www.alchemy.com/ on the Ethereum Sepolia network, and the corresponding https url should be used.


SEPOLIA_API_KEY =uIrsQQeQ2IFWXqJ1bRSFAT-n5kie1T6F  -> The corresponding API key for the created app in https://www.alchemy.com/ should be used.


PRIVATE_KEY =9eb68abdafa03d5431ba937d1b81b749240bea52cd0d7f68def743e14be5c2a4   -> This should be replaced by the corresponding Metamask wallet address.


The instructions for running the project are listed below:

1. Initially, the below-mentioned commands should be executed to install the required libraries:

(i) npm install --save-dev hardhat  -> To install hardhat for the contract deployment.

(ii) npm install --save-dev "hardhat@^2.13.0" "@nomicfoundation/hardhat-toolbox@^2.0.0"  -> Required dependency for the working of hardhat as per the requirement of the system (optional)-Should be done only after getting the instruction to install the same.

(iii) npm install dotenv -> For the usage of .env file

(iv) npm install "@openzeppelin/contracts"  -> Required library for contract

(v) npx hardhat run --network sepolia scripts/deploy.js  -> To compile and deploy the contract in the Sepolia network.

Note: All the above commands should be executed from the main folder, "t-shop-main".

Note 2:

After deployment of contract,

Inside the frontend folder, go to the src folder and then to app.js, where the contract address should be changed accordingly as mentioned below:
const contractAddress = "0x8291a688632f6C423449652567c011E13EF358E6";

After deploying contract and getting contractAddress, goto t-shop/artifacts/contracts/Transport.sol/ and copy "JourneyFactory.json" file and paste in t-shop/frontend/src/Contracts.

Note 3:

2. Execute the command node server.js from the server folder to run the server.

3. Execute the commands "npm install" to install the required dependencies and "npm start" from the frontend folder to run the front end.

4. Import the file "Db.bacpac" in the SQL Management Studio to import the database that has been used in the project and inside server folder goto server.js file and then change the configuration of the database as mentioned below:

Note: Change the user, password and server used below in config accordingly.

const config = {
  user: "######",
  password: "#########",
  server: "localhost",
  database: "tms",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};


