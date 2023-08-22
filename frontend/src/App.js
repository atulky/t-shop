import "./App.css";
import Login from "./MyComponents/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React,{ useState , useEffect } from "react";
import Choose from "./MyComponents/Choose";
import Register from "./MyComponents/Register";
import Addbus from "./MyComponents/Addbus";
import ViewTicket from "./MyComponents/ViewTicket";
import Provider from "./MyComponents/Provider";
import ProviderStart from "./MyComponents/ProviderStart";
import VerifyTicket from "./MyComponents/VerifyTickets";
import abi from "./Contracts/JourneyFactory.json";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {

const user=(userid,usertype)=>{

  localStorage.setItem("username",userid)
  localStorage.setItem("usertype",usertype)


}

const selected_mode=(selected_mode)=>{

  localStorage.setItem("selected_mode",selected_mode)
 // console.log(localStorage)

}

const [state, setState] = useState({
  provider: null,
  signer: null,
  contract: null,
});

const [account, setAccount] = useState("None");

useEffect(() => {
  const connectWallet = async () => {
    const contractAddress = "0x8291a688632f6C423449652567c011E13EF358E6";
    const contractABI = abi.abi;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const account = await ethereum.request({
          method: "eth_requestAccounts",
        });

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setAccount(account);
        setState({ provider, signer, contract });
       // console.log(provider,signer,contract)
      } else {
        alert("Please install metamask");
      }
    } catch (error) {
      console.log(error);
    }
  };
  connectWallet();
}, []);

  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login user={user} />}></Route>

          <Route exact path="/choose" element={<Choose selected_mode={selected_mode} state={state} account={account}  />}></Route>

          <Route exact path="/register" element={<Register/>}></Route>

          <Route exact path="/bus-ticket" element={<Addbus state={state} account={account}/>}></Route>

          <Route exact path="/verify-ticket" element={<VerifyTicket state={state} account={account}/>}></Route>

          <Route exact path="/provider" element={<Provider state={state} account={account}/>}></Route>

          <Route exact path="/view-tickets" element={<ViewTicket account={account}/>}></Route>

          <Route exact path="/provider-start" element={<ProviderStart account={account}/>}></Route>



        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
