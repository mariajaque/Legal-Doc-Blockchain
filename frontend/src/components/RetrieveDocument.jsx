import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "../abis/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function RetrieveDocument() {
  const [contract, setContract] = useState();
  const [hash, setHash] = useState("");
  const [cid, setCID] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Please install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  const retrieve = async () => {
    if (!hash || !contract) return;

    try {
      const result = await contract.getDocument(hash);
      const [, ipfsCID] = result;
      if (!ipfsCID || ipfsCID === "") {
        setCID(null);
        setError("No document found for that hash.");
      } else {
        setCID(ipfsCID);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while retrieving the document.");
    }
  };

  const forceDownload = async () => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cid;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      retrieve();
    }
  };

  return (
    <section className="container" aria-label="Retriever">
      <h2>Retrieve Document</h2>
      <div className="retrieve-form">
        <input
          type="text"
          placeholder="Enter document hash"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Hash input"
        />
        <button onClick={retrieve}>Retrieve</button>
      </div>


      {error && <p className="error-msg">{error}</p>}

      {cid && (
        <div className="retrieve-result">
          <p>
            <strong>CID:</strong>{" "}
            <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noreferrer">
              {cid}
            </a>
          </p>
          <div className="actions">
            <button onClick={forceDownload}>Download</button>
            <button onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, "_blank")}>
              Open
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
