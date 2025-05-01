import { useState, useEffect } from "react";
import { ethers } from "ethers";
import PasswordPopUp from "./PasswordPopUp";
import artifact from "../abis/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;

export default function RetrieveDocument() {
  const [contract, setContract] = useState();
  const [hash, setHash] = useState("");
  const [cid, setCID] = useState(null);
  const [copiedCID, setCopiedCID] = useState(null);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") retrieve();
  };

  const copyCID = (cid) => {
    navigator.clipboard.writeText(cid);
    setCopiedCID(cid);
    setTimeout(() => setCopiedCID(null), 2000);
  };

  async function getKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function decryptData(encryptedBlob, password) {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const salt = arrayBuffer.slice(0, 16);
    const iv = arrayBuffer.slice(16, 28);
    const data = arrayBuffer.slice(28);
    const key = await getKeyFromPassword(password, salt);
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
  }

  const handleDownload = () => {
    setPendingAction(() => async (password) => {
      try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        const encryptedBlob = await response.blob();
        const decryptedBuffer = await decryptData(encryptedBlob, password);
        const blob = new Blob([decryptedBuffer]);

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "document.pdf"; // or dynamic name if needed
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      } catch (err) {
        alert("Failed to decrypt or download file.");
        console.error(err);
      }
    });
    setModalOpen(true);
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
          <div className="cid-wrapper">
            <div className="cid-label">CID:</div>
            <code>{cid}</code>
          </div>
          <div className="actions">
            <button onClick={() => copyCID(cid)}>
              {copiedCID === cid ? "Copied!" : "Copy CID"}
            </button>
            <button onClick={handleDownload}>Download</button>
          </div>
        </div>
      )}

      <PasswordPopUp
        isOpen={modalOpen}
        title="Enter the password to decrypt"
        onSubmit={async (pw) => {
          setModalOpen(false);
          if (pendingAction) await pendingAction(pw);
          setPendingAction(null);
        }}
        onCancel={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
      />
    </section>
  );
}
