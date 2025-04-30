import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/LegalDocumentManager.json"; // Asegúrate de crear este archivo
import { uploadToPinata } from "./utils/uploadToPinata";

// Dirección del contrato desplegado en Sepolia
const CONTRACT = import.meta.env.VITE_DOC_MANAGER;
const ABI = abi;

const toHex = (buf) =>
  "0x" +
  [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function sha256(arrayBuffer) {
  const hashBuf = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return toHex(hashBuf);
}

export default function App() {
  const [status, setStatus] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setStatus("Hashing…");

      // 1. Hash the file
      const arrayBuf = await file.arrayBuffer();
      const hash = await sha256(arrayBuf);

      // 2. Upload to Pinata
      setStatus("Uploading to IPFS (Pinata)...");
      const cid = await uploadToPinata(file);
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      // 3. Register on-chain
      setStatus("Connecting wallet…");
      await window.ethereum?.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mgr = new ethers.Contract(CONTRACT, ABI, signer);

      setStatus("Sending transaction...");
      const tx = await mgr.storeDocument(hash, cid);
      await tx.wait();

      setStatus(`✅ Stored! Tx: ${tx.hash.slice(0, 10)}...`);
      setFileUrl(gatewayUrl);
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  }

  return (
    <div className="p-6 space-y-4 font-sans">
      <h1 className="text-2xl font-bold">Legal-Doc-Chain Uploader</h1>

      <label className="block border-dashed border-2 rounded p-6 cursor-pointer">
        <input type="file" accept="application/pdf"
               onChange={handleFile} className="hidden" />
        <p>Click or drop a PDF here to register it on-chain</p>
      </label>

      {status && <p>{status}</p>}
      {fileUrl && (
        <p>
          View on IPFS:{" "}
          <a href={fileUrl} target="_blank" rel="noreferrer"
             className="text-blue-600 underline">
            {fileUrl.slice(0, 45)}…
          </a>
        </p>
      )}
    </div>
  );
}
