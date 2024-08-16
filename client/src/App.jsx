import { useState,useEffect } from 'react'
import abi from "./contracts/Depotify.json"
import { Spinner, Navbar, Nav, Button, Container } from 'react-bootstrap'
import './App.css'
import {ethers} from "ethers"
import Home from './components/Home'
import MyMusic from './components/MyMusic'
import MySales from './components/MySales'
import {
  Link,
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import CreateToken from './components/CreateToken'


function App() {
  const [account, setAccount] = useState(null)
  const [state,setState] = useState({
    provider:'',
    signer:'',
    address:'',
    contract:''
  })
  const [loading, setLoading] = useState(true)

  const connectWallet=async()=>{
    
      window.ethereum.on("chainChanged", ()=>{
        window.location.reload()
      })
      window.ethereum.on("accountsChanged", ()=>{
        window.location.reload()
      })
      const contractAddress = "0xE6529cFC01a21c5f01f3A5B6f17815935Ff1F581";
      const contractABI = abi.abi;

      try {
        const { ethereum } = window;
        if (!ethereum) {
          console.log("Metamask is not installed");
          return;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        if (accounts.length === 0) {
          console.log("No account found");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress()
        setAccount(address)
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        // console.log(signer)

        setState({ provider, signer, contract,address });
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
      }
      setLoading(false)
    
  }
  

  return (
    <>
    <div>
    <Navbar expand="lg" bg="secondary" variant="dark">
            <Container>
              <Navbar.Brand>
                 Depotify
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                  <Nav.Link as={Link} to="/my-tokens">My Tokens</Nav.Link>
                  <Nav.Link as={Link} to="/my-sales">My Resales</Nav.Link>
                  <Nav.Link as={Link} to="/create-tokens">Create</Nav.Link>
                </Nav>
                <Nav>
                  {account ? (
                    <Nav.Link
                      href={`https://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button nav-button btn-sm mx-4">
                      <Button variant="outline-light">
                        {account.slice(0, 5) + '...' + account.slice(38, 42)}
                      </Button>

                    </Nav.Link>
                  ) : (
                    <Button onClick={connectWallet} variant="outline-light">Connect Wallet</Button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

    </div>
    <div>
    {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home state={state} />
              } />
              <Route path="/my-tokens" element={
                <MyMusic state={state} />
              } />
              <Route path="/my-sales" element={
                <MySales state={state} account={account} />
              } />
              <Route path="/create-tokens" element={
                <CreateToken state={state} account={account} />
              } />
            </Routes>
          )}
    </div>
      
    </>
  )
}

export default App
