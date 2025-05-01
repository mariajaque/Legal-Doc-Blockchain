import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "../abis/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function VerifyDocument() {
  const [contract, setContract] = useState();
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Please install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !contract) return;

    setStatus("Calculating hash…");
    setHash("");
    setCopied(false);

    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      const h =
        "0x" +
        [...new Uint8Array(digest)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
      setHash(h);

      const exists = await contract.verify(h);
      setStatus(exists ? "✅ Document is registered on the blockchain" : "❌ Document is NOT registered");
    } catch (err) {
      console.error(err);
      setStatus("Error during verification.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="container" aria-label="Verifier">
      <h2>Verify Document</h2>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onFile}
        aria-label="Select a file"
      />
      {hash && (
        <div className="retrieve-result">
          <div className="cid-wrapper">
            <div className="cid-label">Hash:</div>
            <code>{hash}</code>
          </div>
          <div className="actions">
            <button onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy Hash"}
            </button>
          </div>
        </div>
      )}
      {status && <p>{status}</p>}
    </section>
  );
}
