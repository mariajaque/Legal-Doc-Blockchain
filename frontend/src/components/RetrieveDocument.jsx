import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "../../../artifacts/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function RetrieveDocument() {
  const [contract, setContract] = useState();
  const [hash, setHash] = useState("");
  const [cid, setCID] = useState(null);
  const [signature, setSignature] = useState(null);
  const [recoveredAddress, setRecoveredAddress] = useState(null);
  const [timestamp, setTimestamp] = useState(""); // State for timestamp
  const [copiedCID, setCopiedCID] = useState(null);
  const [error, setError] = useState(null);
  const [signer, setSigner] = useState();

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Please install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, provider);
      const writeContract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signerInstance);

      setSigner(signerInstance);
      setContract(readOnlyContract);
    })();
  }, []);

  const retrieve = async () => {
    if (!hash || !contract) return;

    try {
      const [owner, ipfsCID, ts, sig] = await contract.getDocument(hash);

      if (!ipfsCID || ipfsCID === "") {
        setCID(null);
        setError("No document found for that hash.");
        return;
      }

      setCID(ipfsCID);
      setSignature(sig);
      setTimestamp(new Date(Number(ts) * 1000).toLocaleString());
      setRecoveredAddress(null); // Reset address when a new document is fetched
      setError(null);
    } catch (err) {
      console.error(err);
      setError("An error occurred while retrieving the document.");
    }
  };

  // Automatically verify the signature and get the recovered address
  useEffect(() => {
    if (signature) {
      try {
        const recovered = ethers.verifyMessage(hash, signature);
        setRecoveredAddress(recovered);
      } catch (err) {
        console.error("Error verifying the signature", err);
        setRecoveredAddress(null); // Reset if verification fails
      }
    }
  }, [signature, hash]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") retrieve();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCID(text);
    setTimeout(() => setCopiedCID(null), 2000);
  };

  async function deriveKeyFromSignature(signer, docHash) {
    const message = "Encrypting doc: " + docHash;
    const signature = await signer.signMessage(message);
    const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
    return crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["decrypt"]);
  }

  async function decryptData(encryptedBlob, signer, hash) {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const iv = arrayBuffer.slice(0, 12); // match UploadDocument
    const data = arrayBuffer.slice(12);  // rest is encrypted content
    const key = await deriveKeyFromSignature(signer, hash);
  
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
    const decoded = new TextDecoder().decode(decrypted);
    const { name, data: rawData } = JSON.parse(decoded);
    return {
      filename: name,
      buffer: new Uint8Array(rawData).buffer,
    };
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const encryptedBlob = await response.blob();
      const { filename, buffer } = await decryptData(encryptedBlob, signer, hash);
      const blob = new Blob([buffer]);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      alert("Failed to decrypt or download file.");
      console.error(err);
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
          {timestamp && (
            <div className="timestamp-wrapper">
              <div className="timestamp-label">Uploaded at:</div>
              <span>{timestamp}</span>
            </div>
          )}
          <div className="actions">
            <button onClick={handleDownload}>Download</button>
          </div>
          <div className="cid-wrapper">
            <div className="cid-label">CID:</div>
            <code>{cid}</code>
          </div>
          <div className="actions">
            <button onClick={() => copyToClipboard(cid)}>
              {copiedCID === cid ? "Copied!" : "Copy CID"}
            </button>
          </div>
          <div className="signature-wrapper">
            <div className="signature-label">Signature:</div>
            <code>{signature}</code>
          </div>
          <div className="actions">
            <button onClick={() => copyToClipboard(signature)}>
              {copiedCID === signature ? "Copied!" : "Copy Signature"}
            </button>
          </div>
          <div className="address-wrapper">
            <div className="address-label">Recovered Address:</div>
            <code>{recoveredAddress || "Not verified yet"}</code>
          </div>
          <div className="actions">
            <button onClick={() => copyToClipboard(recoveredAddress)}>
              {copiedCID === recoveredAddress ? "Copied!" : "Copy Address"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
