import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "../../../artifacts/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function VerifyDocument() {
  const [contract, setContract] = useState();
  const [file, setFile] = useState(null);
  const [inputAddress, setInputAddress] = useState("");
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");
  const [matchStatus, setMatchStatus] = useState("");
  const [timestamp, setTimestamp] = useState(""); // State for timestamp
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

  const getDocumentTimestamp = async (docHash) => {
    try {
      const [, , timestamp] = await contract.getDocument(docHash);
      const timestampString = new Date(Number(timestamp) * 1000).toLocaleString(); // Convert BigInt to number
      setTimestamp(timestampString); // Set timestamp in state
    } catch (error) {
      console.error("Error fetching document timestamp:", error);
      setTimestamp("");
    }
  };

  const handleVerify = async () => {
    if (!file || !inputAddress || !contract) return;

    setStatus("Calculating hash…");
    setHash("");
    setTimestamp(""); // Reset timestamp on new verification attempt
    setCopied(false);
    setMatchStatus("");

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
      if (!exists) {
        setStatus("❌ Document is NOT registered on the blockchain");
        return;
      }

      setStatus("✅ Document is registered on the blockchain");

      // Fetch document details including the timestamp
      await getDocumentTimestamp(h); // Fetch the timestamp

      const [, , , signature] = await contract.getDocument(h);
      const recovered = ethers.verifyMessage(h, signature);
      if (recovered.toLowerCase() === inputAddress.toLowerCase()) {
        setMatchStatus("✅ The document was signed by the provided address.");
      } else {
        setMatchStatus("❌ The signature does NOT match the provided address.");
      }
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
      <h2>Verify Document and Signature</h2>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files[0])}
        aria-label="Select a file"
      />

      <div className="verify-form">
        <input
          type="text"
          placeholder="Enter Ethereum address"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          aria-label="Address input"
          style={{ marginTop: "10px", width: "100%" }}
        />
      </div>

      <div className="actions">
        <button
          onClick={handleVerify}
          disabled={!file || !inputAddress}
          style={{ marginTop: "10px" }}
        >
          Verify
        </button>
      </div>

      {hash && (
        <div className="retrieve-result">
          {/* Display Timestamp First */}
          {timestamp && (
            <div className="timestamp-wrapper">
              <div className="timestamp-label">Uploaded at:</div>
              <span>{timestamp}</span> {/* Display the timestamp */}
            </div>
          )}

          {/* Display Hash */}
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
      {matchStatus && <p>{matchStatus}</p>}
    </section>
  );
}
