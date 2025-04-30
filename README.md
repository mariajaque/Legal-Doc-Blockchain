# Legal-Doc-Blockchain

### Team members:
- Victoria García Martínez-Echavarría
- Maria Jaque Oficialdegui
- Catalina Royo-Villanova Seguí

## Project description:
This project is a web application that allows users to upload, verify and redownload legal documents using blockchain technology. The application is built using React and Hardhat, and it uses IPFS for file storage. The smart contracts are written in Solidity and deployed on a local blockchain using Hardhat. The application also uses Pinata to upload files to IPFS and retrieve them later.

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

4. Verify that you have the correct configuration in your IPFS Desktop application. 

    In the IPFS Desktop application, click on the settings icon. Then, scroll down until you find the **IPFS Config** section. There, you will find a json file with the IPFS configuration. You have to verify that the "API" section has the following configuration:
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
    If you have edited the json, click on the **Save** button to save the changes. Then, restart the IPFS daemon to apply them.

### 1. Clone the repository:

```bash
git clone https://github.com/mariajaque/Legal-Doc-Blockchain.git
cd Legal-Doc-Blockchain
```

### 2. Install the required dependencies
1. Of the project:
    ```bash
    npm install
    ```

2. Of the frontend:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

### 3. Connect to IPFS using a pinata account:
1. Create a pinata account at [Pinata](https://pinata.cloud/) if you don't have one.
2. Go to the Pinata dashboard and click on the **API Keys** tab. Then, click on the `+ New Key` button. This will generate the following:
    - API key: `<API_KEY>`
    - API secret: `<API_SECRET>`
    - JWT: `<JWT_TOKEN>`

    The JWT token allways starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`.
3. Go to the frontend path and create a `.env` file where you will paste your resulting JWT token in the following format:
    ```bash
    VITE_PINATA_JWT=<JWT_TOKEN>
    ```


## Usage guide
### 1. Open the first terminal and run:
```bash
npx hardhat clean   # Clean the cache and artifacts
npx hardhat compile # Compile the smart contracts

npx hardhat node    # Start the local blockchain node
```
This creates 20 accounts with 10.000 ETH each and starts a local blockchain node on port `8545`. You can use the first account to deploy the smart contracts.


### 2. Open a second terminal and run:
```bash
npx hardhat ignition deploy ./ignition/modules/LegalDocModule.js --network localhost
```
This will deploy the LegalDocModule smart contract to the local blockchain.

You will have to copy the address of the deployed contract, and paste it in the `.env` file in the frontend folder. The file should look like this:
```bash
VITE_DOC_MANAGER=<CONTRACT_ADDRESS>
VITE_PINATA_JWT=<JWT_TOKEN>
```
Where `<CONTRACT_ADDRESS>` is the address of the deployed contract. It will look something like this: `0x5FbDB2315678afecb367f032d93F642f64180aa3`.

### 3. Open a third terminal and run:
```bash
cd frontend
npm run dev
```
This will launch the web application on http://localhost:5173. This application will be used to interact with the LegalDocModule smart contract.

### 4. Open the web application in your browser (http://localhost:5173) and connect your MetaMask wallet to the local blockchain.
When opening the web application, you will be asked to connect your MetaMask wallet. You have to do it in order to be able to interact with the smart contract.

### 5. Go to the MetaMask extension to create a custom network:
To do it, go to the MetaMask extension and click on the top left corner symbol. There, you will see the network selector. Click on the `+ Add a custom network` button. Complete the form with the following parameters:
- Network Name: Localhost 31337
- Default RPC URL: http://127.0.0.1:8545/
- Chain ID: 31337
- Currency Symbol: ETH
- Block Explorer URL: https://polygonscan.com/ (optional)

Then, click on the `Save` button. You will now be able to select the Localhost 31337 network in your MetaMask wallet.


### 6. Go to the MetaMask extension to create another account:
To do it, go to the MetaMask extension and click on the account selector. Then click on the `+ Add account or hardware wallet` button. Then in the `Import a wallet or account`, select the `Private key` option. Paste the private key of the first account shown in the first terminal. Finally, click on the `Import` button.

You will now be able to use the web application to interact with the LegalDocModule smart contract with this account, so you will be able to pay the gas fees with it.

### 7. Interact with the web application:
You can now use the web application to interact with the LegalDocModule smart contract. You can create, sign and verify legal documents. You can also upload and download files from IPFS using Pinata.
