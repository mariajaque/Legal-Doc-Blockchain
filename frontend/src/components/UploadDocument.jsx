import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import artifact from "../../../artifacts/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";
import PasswordPopUp from "./PasswordPopUp";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export default function UploadDocument({ docs, setDocs }) {
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();
  const [copiedHash, setCopiedHash] = useState(null);
  const [copiedCID, setCopiedCID] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Please install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setSigner(signer);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  const getKeyFromPassword = async (password, salt) => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
    return crypto.subtle.deriveKey({
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  };

  const encryptData = async (data, password, filename) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKeyFromPassword(password, salt);

    const payload = {
      name: filename,
      data: Array.from(new Uint8Array(data)), // convert ArrayBuffer to array
    };
    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedPayload);

    return new Blob([salt, iv, new Uint8Array(encrypted)]);
  };

  const decryptData = async (encryptedBlob, password) => {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const salt = arrayBuffer.slice(0, 16);
    const iv = arrayBuffer.slice(16, 28);
    const data = arrayBuffer.slice(28);
    const key = await getKeyFromPassword(password, salt);

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
    const decoded = new TextDecoder().decode(decrypted);
    const { name, data: rawData } = JSON.parse(decoded);
    return {
      filename: name,
      buffer: new Uint8Array(rawData).buffer,
    };
  };

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file || !contract || !signer) return;

    setModalTitle("Enter a password to encrypt the document");
    setPendingAction(() => async (password) => {
      const buf = await file.arrayBuffer();
      const encryptedBlob = await encryptData(buf, password, file.name);
      const digest = await crypto.subtle.digest("SHA-256", buf);
      const hash = "0x" + [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");

      // Hash digital signature
      const signature = await signer.signMessage(hash);

      const formData = new FormData();
      formData.append("file", encryptedBlob, file.name + ".enc");

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      });

      if (!res.ok) {
        console.error("Error uploading to Pinata:", await res.text());
        return;
      }

      const data = await res.json();
      const cid = data.IpfsHash;

      const tx = await contract.storeDocument(hash, cid, signature, { gasLimit: 1000000 });
      await tx.wait();

      setDocs((d) => [...d, { hash, cid, name: file.name }]);
      e.target.value = null;
    });
    setModalOpen(true);
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const copyCID = (cid) => {
    navigator.clipboard.writeText(cid);
    setCopiedCID(cid);
    setTimeout(() => setCopiedCID(null), 2000);
  };

  const forceDownload = (cid) => {
    setModalTitle("Enter password to decrypt the document");
    setPendingAction(() => async (password) => {
      try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!response.ok) throw new Error("Download failed");

        const encryptedBlob = await response.blob();
        const { filename, buffer } = await decryptData(encryptedBlob, password);

        const url = window.URL.createObjectURL(new Blob([buffer]));
        const a = document.createElement("a");
        a.download = filename || "decrypted-file";
        a.href = url;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        if (err.name === "OperationError") {
          alert("Incorrect password or corrupted file.");
        } else {
          console.error("Decryption error:", err);
          alert("An error occurred. Try again.");
        }
      }
    });
    setModalOpen(true);
  };

  return (
    <>
      <section className="container" aria-label="Uploader">
        <h2>Upload a Document</h2>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onFile}
          ref={fileInputRef}
          aria-label="Select a PDF or DOCX file"
        />
      </section>

      <section className="container" aria-label="Document list">
        <h2>Your Documents</h2>
        <ul>
          {docs.map(({ hash, cid }) => (
            <li key={hash}>
              <div>
                <strong>Hash:</strong> <code>{hash}</code>
              </div>
              <div>
                <strong>CID:</strong> <code>{cid}</code>
              </div>
              <div className="actions">
                <button onClick={() => copyHash(hash)}>
                  {copiedHash === hash ? "Copied!" : "Copy Hash"}
                </button>
                <button onClick={() => copyCID(cid)}>
                  {copiedCID === cid ? "Copied!" : "Copy CID"}
                </button>
                <button onClick={() => forceDownload(cid)}>Download</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <PasswordPopUp
        isOpen={modalOpen}
        title={modalTitle}
        onSubmit={async (pw) => {
          setModalOpen(false);
          if (pendingAction) await pendingAction(pw);
          setPendingAction(null);
        }}
        onCancel={() => {
          setModalOpen(false);
          setPendingAction(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
        }}
      />
    </>
  );
}
