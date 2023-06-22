# VenCura - A Custodial Wallet App

### Overview
The VenCura application is accessible [here](http://34.16.134.164:3000/). It currently supports the Ethereum Sepolia testnet only.

VenCura is built using Typescript with an Express backend, React frontend, and a Mongo database. Here is an overview of how the app operates:

When a user authenticates through Dynamic, the backend verifies the provided JWT and creates a user entry in the database if the user does not already exist. In the database, each user is represented by a `User` object, keyed by the `sub` field of the JWT. This object contains an array of `Wallet`s, where a `Wallet` is simply an account address - encrypted private key pair. For non-custodial wallets created outside of VenCura, the private key field is empty. When a user creates a wallet within VenCura, the backend symmetrically encrypts the private key before storing it.

VenCura currently supports two actions on custodial wallets: signing a message and sending a send-ETH transaction. Upon receiving a user request, the backend decrypts the private key to perform these actions. This process poses security risks, such as potential key exposure in the memory during encryption or decryption, necessitating further security measures like utilizing a hardware security module. In addition, the responsibility of securing the private key can be shared in part with the end-user by encrypting it with a key derived from the user's password.

Here are some other issues that must be addressed:
- Since the backend currently does not keep a blacklist of revoked JWTs, an intercepted JWT can be accepted even after its session has been logged out.
- React's `Link` component does not work reliably, especially in local environment. 
- Authorization does not cause an error when Metamask is set to Ethereum mainnet instead of Sepolia testnet.
- Authorization through Metamask QR code does not work.


### How to Build and Run Using Docker

First, set up the environment for the project by creating two `.env` files — one in the `frontend` directory and another in the `backend` directory. Examples are provided by the `.env.example` files.

Then, to build and run containerized frontend and backend services, run the following commands:
```
docker-compose build --no-cache frontend backend
docker-compose up
```


### Running tests
Make sure the environment has been set up properly. To run the backend tests that cover all routes, run the following commands from the project root:
```
cd backend
npm test
```
