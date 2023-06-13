import { DynamicContextProvider, DynamicWidget, useDynamicContext} from '@dynamic-labs/sdk-react';
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import reactLogo from './assets/react.svg'
import './App.css'

// Obtain your public key from Dynamic's API dashboard or through our /keys API endpoint.
// Get the JWT through the Dynamic SDK with authToken.
// Send the authToken to the server as a Bearer token
const Home = () => {
  const {
    handleLogOut,
    setShowAuthFlow,
    showAuthFlow,
    primaryWallet,
    authToken
  } = useDynamicContext();

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

  if (primaryWallet && !showAuthFlow) { // TODO
    return (
      <div>
        <p>User is logged in</p>
        <p>Address: {primaryWallet.address}</p>
        <p>Balance: {balance}</p>
        <p>AuthToken: {authToken}</p>
        <button type="button">
          <Link to="/get_balance">Get Balance</Link>
        </button>
        <button type="button">
          <Link to="/sign_msg">Sign Message</Link> 
        </button>
        <button type="button">
          <Link to="/send_tx">Send Transaction</Link> 
        </button>
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

// getBalance() → balance: number (get the current balance on the wallet)
const GetBalance = () => {
  const { authToken } = useDynamicContext();
  const [ balance, setBalance ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/get_balance", { // TODO use env
        method: 'GET',
        headers: {
          Authorization: `${authToken}`,
        }
    }).then((res) => res.json())
    .then((data) => setBalance(data.balance))
    .then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!balance) {
    return (
      <div>Failed to obtain balance</div>
    ); 
  }
  return (
    <div>Account balance: {balance} ETH</div>
  );
}

// signMessage(msg: string) → signedMessage: string (The signed message with the private key) 
const SignMessage = () => {
}




// sendTransaction(to: string, amount: number) → transactionHash: string (sends a transaction on the blockchain)
const SendTransaction = () => {
  const { authToken } = useDynamicContext();
  const [ txhash, setTxhash ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  const [destination, setDestination] = useState<string>();
  const [amount, setAmount] = useState<number>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // const form = event.currentTarget
    // const formElements = form.elements as typeof form.elements & {
    //   destination: {value: string},
    //   amount: {value: number},
    // }
    // onSubmitUsername(formElements.usernameInput.value)

    console.log('destination ' + destination + ' amount ' + amount);

    const data = {
      destination: destination,
      amount: amount,
    };
    
    console.log('JSON ' + JSON.stringify(data));


    try {
      const response = await fetch('http://localhost:8000/send_tx', { // TODO use env
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `${authToken}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('POST request successful');
        // Do something with the response if needed
      } else {
        console.error('POST request failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
          To:&nbsp;&nbsp;
          <input type="string" 
              value={destination}
              name="decimal" 
              onChange={(e) => setDestination(e.target.value)}/>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
          Amount:&nbsp;&nbsp;
          <input type="number" 
              value={amount}
              name="hex" 
              onChange={(e) => setAmount(parseFloat(e.target.value))}/>
      </label>
      <br /><br />
      <button type="submit">Submit</button>
    </form>
  );
}

const App = () => (
  <DynamicContextProvider
    settings={{
      environmentId: 'bcb3329d-6355-4410-bd2e-d9ff163a151e'
    }}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get_balance" element={<GetBalance />} />
        {/* <Route path="/sign_msg" element={<SignMessage />} /> */}
        <Route path="/send_tx" element={<SendTransaction />} />
        {/* Create account / wallet */}
      </Routes>
    </Router>
  </DynamicContextProvider>
);

export default App
