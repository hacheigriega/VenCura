import { DynamicContextProvider, DynamicWidget, useDynamicContext} from '@dynamic-labs/sdk-react';
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import './App.css'

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL
console.log(`BASE URL ADDED ${BASE_URL}`)

interface Wallet {
  address: string;
  privateKey: string;
}

const Home = () => {
  const {
    handleLogOut,
    setShowAuthFlow,
    showAuthFlow,
    primaryWallet,
    authToken,
    isAuthenticated
  } = useDynamicContext();

  const [ wallets, setWallets ] = useState<Wallet[]>([]);
  const [ fetched, setFetched ] = useState<boolean>(false);
  
  if (isAuthenticated) {
    if (!fetched) {
      console.log('fetching') // debug
      setFetched(true)

      fetch(`${BASE_URL}/wallets/get_wallets`, {
        method: 'GET',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`,
        }
      }).then((res) => res.json())
      .then((data) => setWallets(data.wallets));
    }

    return (
      <div>
        <h2>Your Wallet Addresses (Sepolia)</h2>
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

// getBalance() → balance: number 
// (Current balance on the wallet)
const GetBalance = () => {
  const { authToken } = useDynamicContext();
  const [ balance, setBalance ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  let { address } = useParams();

  useEffect(() => {
    fetch(`${BASE_URL}/wallets/get_balance/` + address, {
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

// signMessage(msg: string) → signedMessage: string 
// (Signed message with the private key) 
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
      const response = await fetch(`${BASE_URL}/wallets/sign_msg/` + address, {
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

// sendTransaction(to: string, amount: number) → transactionHash: string 
// (Sends a transaction on the blockchain)
const SendTransaction = () => {
  const { authToken } = useDynamicContext();
  const [destination, setDestination] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [ isSubmitted, setIsSubmitted ] = useState<boolean>(false);
  const [ errorMsg, setErrorMsg ] = useState<string>("");
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
      const response = await fetch(`${BASE_URL}/wallets/send_tx/` + address, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await response.json()
          .then((data) => setTxHash(data.txHash));
      } else {
        await response.json()
          .then((data) => setErrorMsg(data.msg));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isSubmitted) {
    if (txHash == "" && errorMsg == "") {
      return <div>Processing transaction...</div>
    } else if (errorMsg != "") {
      return (
        <div>{errorMsg}</div>
      ); 
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

const CreateWallet = () => {
  const { authToken } = useDynamicContext();
  const [ address, setAddress ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${BASE_URL}/wallets/create_wallet`, {
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
