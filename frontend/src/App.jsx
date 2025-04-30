import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import artifact from "./abis/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";
import "./App.css";

const ipfs = ipfsHttpClient({ url: "http://127.0.0.1:5001/api/v0" });
const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function App() {
  const [contract, setContract] = useState();
  const [docs, setDocs] = useState([]);

  /* 1. Wallet + contract hookup */
  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Install MetaMask first!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  /* 2. Handle upload */
  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f || !contract) return;
  
    // 2-a hash
    const buf = await f.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const hash =
      "0x" +
      [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
  
    // 2-b IPFS: add with pin
    const { cid } = await ipfs.add(f, { pin: true });

    await ipfs.pin.add(cid);
  
    // 2-c on-chain
    const tx = await contract.storeDocument(hash, cid.toString());
    await tx.wait();
  
    setDocs((d) => [...d, { hash, cid: cid.toString() }]);
  };
  

  return (
    <main className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Legal Doc Vault</h1>

      <label className="block mb-4">
        <span>Select PDF / DOCX</span>
        <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} className="mt-2" />
      </label>

      <h2 className="text-xl mb-2">Your documents</h2>
      <ul className="list-disc ml-6">
        {docs.map(({ hash, cid }) => (
          <li key={hash} className="mb-1">
            <code>{hash.slice(0, 10)}…</code> — CID&nbsp;
            <a
              href={`https://ipfs.io/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600"
            >
              {cid}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
