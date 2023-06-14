import { DynamicContextProvider, DynamicWidget, useDynamicContext} from '@dynamic-labs/sdk-react';
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import './App.css'

interface Wallet {
  address: string;
  privateKey: string;
}

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

  const [ wallets, setWallets ] = useState<Wallet[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/wallets/get_wallets", { // TODO use env
        method: 'GET',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`,
        }
    }).then((res) => res.json())
    .then((data) => setWallets(data.wallets))
    .then(() => setIsLoading(false));
  }, []);

  if (primaryWallet && !showAuthFlow) {
    return (
      <div>
        <h2>Your Wallet Addresses</h2>
        <table>
          <thead>
            <tr>
              <th>Wallet Address</th>
              <th>Get Balance</th>
              <th>Sign Message</th>
              <th>Send Transaction</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr key={wallet.address}>
                <td>{wallet.address}</td>
                <td>
                  <button type="button">
                    <Link to={`/wallets/get_balance/${wallet.address}`}>Get Balance</Link>
                  </button>
                </td>
                <td>
                  {wallet.privateKey != "" && (
                    <button type="button">
                      <Link to={`/wallets/sign_msg/${wallet.address}`}>Sign Message</Link>
                    </button>
                  )}
                </td>
                <td>
                  {wallet.privateKey != "" && (
                    <button type="button">
                      <Link to={`/wallets/send_tx/${wallet.address}`}>Send Transaction</Link>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button">
          <Link to="/wallets/create_wallet">Create Wallet</Link> 
        </button>
        <button type="button" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    );
  }

  //       {/* <p>Address: {primaryWallet.address}</p> */}
  //       {/* <p>AuthToken: {authToken}</p> */}

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

  let { address } = useParams();

  useEffect(() => {
    fetch("http://localhost:8000/wallets/get_balance/" + address, { // TODO use env
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
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
  const { authToken } = useDynamicContext();
  const [msg, setMsg] = useState<string>("");
  const [sign, setSign] = useState<string>("");
  let { address } = useParams();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const data = {
      message: msg,
    };
    try {
      const response = await fetch('http://localhost:8000/wallets/sign_msg/' + address, { // TODO use env
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonData = await response.json()
          .then((data) => setSign(data.signature));

        console.log('POST request successful');
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
          Message:&nbsp;&nbsp;
          <input type="string" 
              value={msg}
              name="msg" 
              onChange={(e) => setMsg(e.target.value)}/>
      </label>
      <br /><br />
      <button type="submit">Submit</button>
      <br /><br />
      { sign != "" && (
        <div>Signed message: {sign}</div>
      )}
    </form>
  );

}

// sendTransaction(to: string, amount: number) → transactionHash: string (sends a transaction on the blockchain)
const SendTransaction = () => {
  const { authToken } = useDynamicContext();
  const [destination, setDestination] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [ isSubmitted, setIsSubmitted ] = useState<boolean>(false);
  const [ txHash, setTxHash ] = useState<string>("");

  let { address } = useParams();

  const handleSubmit = async (event: React.FormEvent) => {
    setIsSubmitted(true)

    event.preventDefault()
    const data = {
      destination: destination,
      amount: amount,
    };
    try {
      const response = await fetch('http://localhost:8000/wallets/send_tx/' + address, { // TODO use env
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonData = await response.json()
          .then((data) => setTxHash(data.txHash));

        console.log('POST request successful');
      } else {
        console.error('POST request failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isSubmitted) {
    if (txHash == "") {
      return <div>Loading...</div>
    } else {
      return (
        <div>Transaction hash: {txHash}</div>
      ); 
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
          To:&nbsp;&nbsp;
          <input type="string" 
              value={destination}
              name="destination" 
              onChange={(e) => setDestination(e.target.value)}/>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
          Amount:&nbsp;&nbsp;
          <input type="number" 
              value={amount}
              name="amount" 
              onChange={(e) => setAmount(parseFloat(e.target.value))}/>
      </label>
      <br /><br />
      <button type="submit">Submit</button>
    </form>
  );
}

// getBalance() → balance: number (get the current balance on the wallet)
const CreateWallet = () => {
  const { authToken } = useDynamicContext();
  const [ address, setAddress ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/wallets/create_wallet", { // TODO use env
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`,
        }
    }).then((res) => res.json())
    .then((data) => setAddress(data.address))
    .then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!address) {
    return (
      <div>Failed to create a new wallet</div>
    ); 
  }
  return (
    <div>Newly created wallet address: {address}</div>
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
        <Route path="/wallets/get_balance/:address" element={<GetBalance />} />
        <Route path="/wallets/sign_msg/:address" element={<SignMessage />} />
        <Route path="/wallets/send_tx/:address" element={<SendTransaction />} />
        <Route path="/wallets/create_wallet" element={<CreateWallet />} />
      </Routes>
    </Router>
  </DynamicContextProvider>
);

export default App
