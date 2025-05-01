# Legal-Doc-Blockchain

### Team members:
- Victoria García Martínez-Echavarría
- Maria Jaque Oficialdegui
- Catalina Royo-Villanova Seguí

## Project Description

**Legal Doc Vault** is a secure web application that enables users to upload, verify, and retrieve legal documents using blockchain and decentralized technologies. Built with **React** and **Hardhat**, the platform integrates **AES encryption**, **IPFS** (via **Pinata**), and smart contracts written in **Solidity** to ensure document integrity, privacy, and tamper-resistance.

### Features

- 🔐 **Secure upload** of documents encrypted with a user-defined password before storage.
- 🧾 **Hash verification** to check if a document has been previously registered on-chain.
- 📥 **Decryption-based retrieval**, requiring the correct password to access and download files.
- 🌐 **Decentralized file storage** using **IPFS** and **Pinata**, ensuring availability without relying on centralized servers.
- ⛓️ **Blockchain-backed authenticity**, with **SHA-256** hashes stored immutably via smart contracts.
- 🧑‍💼 **User-friendly interface** with an “About” section that explains the purpose, usage, and real-world applications of the platform.


### Why This Project

In today’s digital era, verifying the authenticity of sensitive documents—such as contracts, academic certificates, or property deeds—is more critical than ever. Fraudulent documents can be easily altered or forged, and most users lack a secure way to prove that a file hasn’t been tampered with after being issued.

Legal Doc Vault addresses this problem by combining three powerful tools:

- **Blockchain** for immutable registration of document hashes.
- **Encryption** for confidentiality during upload and storage.
- **IPFS** for decentralized, persistent access to the document itself.

#### Real-Life Use Case

> A lawyer receives a contract from a third party. Before signing, they want to confirm it's the original version previously agreed upon.
> By dragging the document into the “Verify” tab of Legal Doc Vault, the system checks the document’s hash against the blockchain. If it was already registered, the lawyer can confirm it hasn’t been modified — all without needing to trust the sender or any centralized authority.


### Tech Stack

- **Frontend:** React, Vite
- **Blockchain:** Solidity, Hardhat
- **File Storage:** IPFS (via Pinata)
- **Encryption:** Web Crypto API (AES-GCM)
- **Smart Contract Deployment:** Local Hardhat network


## Installation guide
### 0. Pre-requisites:

1. Verify that you have the following installed on your system:
    - Node.js (v22.15.0)
    - npm (v10.9.2)
    - Git (v2.37.1 or higher)
    - Hardhat (v2.23.0)
    - MetaMask browser wallet
    - Pinata account
    - Alchemy account

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
    - [MetaMask](https://metamask.io/download/)

3. If you don't have an account in Pinata or Alchemy, you can create one for free. You can do it from the following links:
    - [Pinata](https://pinata.cloud/)
    - [Alchemy](https://www.alchemy.com/)

4. You can then install hardhat globally using npm:
    ```bash
    npm i -g hardhat
    ```

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

### 4. Create an Alchemy new app:
1. Create an Alchemy account at [Alchemy](https://www.alchemy.com/) if you don't have one.
2. Go to the Alchemy dashboard and create a new app. Select the **Ethereum** network and the **Sepolia** testnet. This will generate the following:
    - API key
    - HTTP URL
3. Copy the HTTP URL and paste it in the `.env` file in the root folder of the project in the following format:
    ```bash
    SEPOLIA_RPC_URL=<HTTP_URL>
    ```

### 5. Select the Sepolia network in your MetaMask wallet:
1. Go to the MetaMask extension and click on the network selector on the top left corner. Then, select the `Sepolia` testnet. If you don't see it, make sure you have the `Show test networks` option enabled at the bottom of the networks list.
2. Go to the account selector and, on your preferred account, click on the three dots on the right. There, choose the `Account details` option and copy the private key.
3. Go to the `.env` file in the root folder of the project and paste the private key in the following format:
    ```bash
    SEPOLIA_RPC_URL=<HTTP_URL>
    PRIVATE_KEY=<PRIVATE_KEY>
    ```


## Usage guide
### 1. Open the first terminal and run:
```bash
npx hardhat clean   # Clean the cache and artifacts
npx hardhat compile # Compile the smart contracts
```

### 2. Open a second terminal and run:
```bash
npx hardhat ignition deploy ./ignition/modules/LegalDocModule.js --network sepolia
```
This will deploy the LegalDocModule smart contract to the Sepolia testnet.

You will have to copy the address of the deployed contract, and paste it in the `.env` file in the frontend folder. The file should look like this:
```bash
VITE_DOC_MANAGER=<CONTRACT_ADDRESS>
VITE_PINATA_JWT=<JWT_TOKEN>
```
Where `<CONTRACT_ADDRESS>` is the address of the deployed contract.

### 3. Open a third terminal and run:
```bash
cd frontend
npm run dev
```
This will launch the web application on http://localhost:5173. This application will be used to interact with the LegalDocModule smart contract.

### 4. Open the web application in your browser (http://localhost:5173) and connect your MetaMask wallet to the local blockchain.
When opening the web application, you will be asked to connect your MetaMask wallet. You have to do it in order to be able to interact with the smart contract.

### 5. Interact with the web application:
You can now use the web application to interact with the LegalDocModule smart contract.
