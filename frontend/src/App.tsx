import { DynamicContextProvider, DynamicWidget, useDynamicContext} from '@dynamic-labs/sdk-react';
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import './App.css'

// Obtain your public key from Dynamic's API dashboard or through our /keys API endpoint.
// Get the JWT through the Dynamic SDK with authToken.
// Send the authToken to the server as a Bearer token
const ProcessJWT = () => {
  const {
    handleLogOut,
    setShowAuthFlow,
    showAuthFlow,
    primaryWallet,
    authToken
  } = useDynamicContext();

  const [token, setToken] = useState(null);
  // const jwt = authToken;
  useEffect(() => {
    const fetchApi = async () => {
      await fetch("http://localhost:8000/api", {
        method: 'POST',
        headers: {
          Authorization: `${authToken}`,
        },
      }).then(response => response.json()).then(setToken);
    }
  
    fetchApi()
  }, [authToken]);

  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (primaryWallet) {
        const value = await primaryWallet.connector.getBalance() as string;
        setBalance(value);
      }
    };
    fetchBalance();
  }, [primaryWallet]);

  if (primaryWallet && !showAuthFlow) {
    return (
      <div>
        <p>User is logged in</p>
        <p>Address: {primaryWallet.address}</p>
        <p>Balance: {balance}</p>
        <p>AuthToken: {authToken}</p>
        <button type="button" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setShowAuthFlow(true)}>
        Connect With My Wallet
      </button>
    </div>
  );
};

const Home = () =>  (
  <DynamicContextProvider
    settings={{
      environmentId: 'bcb3329d-6355-4410-bd2e-d9ff163a151e'
    }}>
    {/* <DynamicWidget innerButtonComponent='Authenticate using Dynamic'/>  */}
    <ProcessJWT />
  </DynamicContextProvider>
);

// getBalance() →  balance: number (get the current balance on the wallet)
const GetBalance = () => {
  const {
    authToken
  } = useDynamicContext();

  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchApi = async () => {
      await fetch("http://localhost:8000/api", {
        method: 'POST',
        headers: {
          Authorization: `${authToken}`,
        },
      }).then(response => response.json()).then(setToken);
    }
  
    fetchApi()
  }, [authToken]);

  useEffect(() => {
    fetch("http://localhost:8000/get_balance")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance));
  }, []);

  return (
    <div className="GetBalance">
      <p>Account balance: {balance} ETH</p>
    </div>
  );
}

// signMessage(msg: string) → signedMessage: string (The signed message with the private key) 
const SignMessage = () => {
}

// sendTransaction(to: string, amount: number) → transactionHash: string (sends a transaction on the blockchain)
const SendTransaction = () => {
}

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/get_balance" element={<GetBalance />} />
    </Routes>
  </Router>
);

export default App
