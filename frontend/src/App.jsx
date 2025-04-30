import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "./abis/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";
import "./App.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export default function App() {
  const [contract, setContract] = useState();
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem("documents");
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedCID, setCopiedCID] = useState(null);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Please install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(docs));
  }, [docs]);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !contract) return;

    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const hash =
      "0x" +
      [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      console.error("Error uploading to Pinata:", await res.text());
      return;
    }

    const data = await res.json();
    const cid = data.IpfsHash;

    const tx = await contract.storeDocument(hash, cid);
    await tx.wait();

    setDocs((d) => [...d, { hash, cid }]);
  };

  const copyCID = (cid) => {
    navigator.clipboard.writeText(cid);
    setCopiedCID(cid);
    setTimeout(() => setCopiedCID(null), 2000);
  };

  const forceDownload = async (cid) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cid}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };
  

  return (
    <>
      <header>
        <div className="logo">⚖️</div>
        <h1>Legal Doc Vault</h1>
      </header>

      <main>
        <div className="container">
          <label className="block mb-6">
            <span className="text-gray-700 font-medium">Select PDF / DOCX file</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onFile}
              className="mt-2"
            />
          </label>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Documents</h2>
          <ul className="space-y-2">
            {docs.map(({ hash, cid }) => (
              <li key={hash}>
                <div>
                  <code>{hash}</code>
                </div>
                <div>
                  CID: <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noreferrer">{cid}</a>
                </div>
                <div className="actions">
                  <button onClick={() => copyCID(cid)}>
                    {copiedCID === cid ? "Copied!" : "Copy CID"}
                  </button>
                  <button onClick={() => forceDownload(cid)}>Download</button>
                  <button onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank')}>Open</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}