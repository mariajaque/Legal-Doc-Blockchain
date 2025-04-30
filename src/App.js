import { useState } from "react";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";
import deployment from "../ignition/deployments/localhost/LegalDocModule.json";

const CONTRACT = deployment.contracts.LegalDocumentManager.address;
const ABI      = deployment.artifacts.LegalDocumentManager.abi; // Ignition ships ABI

/* ---------- helpers ---------- */

// turn ArrayBuffer → hex string with 0x-prefix
const toHex = buf =>
  "0x" +
  [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

async function sha256(arrayBuffer) {
  const hashBuf = await crypto.subtle.digest("SHA-256", arrayBuffer); // :contentReference[oaicite:0]{index=0}
  return toHex(hashBuf);
}

/* ---------- main React component ---------- */

export default function App() {
  const [status, setStatus] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("Hashing…");

    // 1️⃣   Hash locally
    const arrayBuf = await file.arrayBuffer();
    const hash = await sha256(arrayBuf);

    // 2️⃣   Upload to IPFS / Filecoin via web3.storage
    setStatus("Uploading to IPFS…");
    const client = new Web3Storage({ token: process.env.REACT_APP_W3_TOKEN }); // :contentReference[oaicite:1]{index=1}
    const cid = await client.put([file]);                                       // :contentReference[oaicite:2]{index=2}
    const gatewayUrl = `https://${cid}.ipfs.w3s.link/${file.name}`;

    // 3️⃣   Write on-chain
    setStatus("Waiting for wallet…");
    await window.ethereum?.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const mgr      = new ethers.Contract(CONTRACT, ABI, signer);

    setStatus("Sending transaction…");
    const tx = await mgr.storeDocument(hash, cid);
    await tx.wait();

    setStatus(`✅ Stored!  Tx: ${tx.hash.slice(0, 10)}…`);
    setFileUrl(gatewayUrl);
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
