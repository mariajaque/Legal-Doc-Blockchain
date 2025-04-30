# Legal-Doc-Blockchain


## Installation guide
### 0. Pre-requisites:

1. Verify that you have the following installed on your system:
    - Node.js (v22.15.0)
    - npm (v10.9.2)
    - Git (v2.37.1 or higher)
    - Hardhat (v2.23.0)
    - IPFS Desktop (GUI)
    - MetaMask browser wallet

    You can check if you have some of these installed by running the following commands in your terminal:
    ```bash
    node --version          # This should print "v22.15.0".
    npm --version           # This should print "10.9.2".
    npx hardhat --version   # This should print "v2.23.0".
    git --version           # This should be higher than "2.37.1".
    ```
2. If you don't have them installed, you can download and install them from the following links:

    - [Node.js and npm](https://nodejs.org/en/download)
    - [Git](https://git-scm.com/downloads)
    - [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
    - [MetaMask](https://metamask.io/download/)

3. You can then install hardhat globally using npm:
    ```bash
    npm i -g hardhat
    ```

### 1. Clone the repository:
```bash
git clone https://github.com/mariajaque/Legal-Doc-Blockchain.git
cd Legal-Doc-Blockchain
```

### 2. Install the required dependencies
```bash
npm install
```

### 3. Compile the smart contracts:
```bash
npx hardhat compile
```

### 4. Test that everything is working:
```bash
npx hardhat test
```

### 5. Run the frontend:
```bash
cd frontend
npm install
npm start
```
This will start the frontend application on http://localhost:3000.


### 7. Deploy the smart contracts to the local blockchain:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
- This will deploy the smart contracts to the local blockchain and print the contract addresses in the terminal.
--> Copy the printed address; you’ll need it in tests and the frontend.






## Usage guide
### 0. Pre-requisites:
- Open IPFS Desktop and make sure it is running. You can check if it is running by opening the IPFS Desktop application and checking if the status is "Connected".
  - Go to settings in IPFS Desktop and make sure the json has the following config on the "API" value:
    ```json
    "API": {
        "HTTPHeaders": {
            "Access-Control-Allow-Credentials": [
                "true"
            ],
            "Access-Control-Allow-Methods": [
                "POST",
                "PUT",
                "GET",
                "OPTIONS"
            ],
            "Access-Control-Allow-Origin": [
                "https://webui.ipfs.io",
                "http://webui.ipfs.io.ipns.localhost:8080",
                "http://localhost:5173"
            ],
            "ListenAddress": [
                "/ip4/127.0.0.1/tcp/5001"
            ]
        }
    },
    ```

### 1. Open terminal 1 and run:
```bash
npx hardhat clean   # Clean the cache and artifacts
npx hardhat compile # Compile the smart contracts

npx hardhat node # Start the local blockchain node
```
This creates 20 accounts with 10.000 ETH each and starts a local blockchain node on port 8545. You can use the first account to deploy the smart contracts.


### 2. Open terminal 2 and run:
```bash
npx hardhat ignition deploy ./ignition/modules/LegalDocModule.js --network localhost
```
This will deploy the LegalDocModule smart contract to the local blockchain. You can use the address of this contract in the frontend to interact with it.

### 3. Open terminal 3 and run:
```bash
cd frontend
npm run dev
```
This will launch the web application on http://localhost:5173. You can use this application to interact with the LegalDocModule smart contract.

### 4. Open the web application in your browser and connect your MetaMask wallet to the local blockchain.
TO do it, you have ti create a custom network in MetaMask with the following parameters:
- Network Name: Localhost 31337
- Default RPC URL: 127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

### 5. Add an account to your MetaMask wallet:
In metamask, go to select an account, and click the add account or hardware wallet button. Then in the import a wallet or account, select the private key option. Paste the private key of the first account in the terminal.

You will now be able to use the web application to interact with the LegalDocModule smart contract as when you have to pay this account will be used to pay the gas fees.
