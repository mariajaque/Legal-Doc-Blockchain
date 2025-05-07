import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import artifact from "../../../artifacts/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export default function UploadDocument({ docs, setDocs }) {
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();
  const [copiedHash, setCopiedHash] = useState(null);
  const [copiedCID, setCopiedCID] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const getDocumentDetails = async (docHash) => {
    try {
      const [owner, cid, timestamp, signature] = await contract.getDocument(docHash);
      const timestampString = new Date(Number(timestamp) * 1000).toLocaleString();
      return { owner, cid, timestamp: timestampString, signature };
    } catch (error) {
      console.error("Error fetching document details:", error);
      return null;
    }
  };

  const deriveKeyFromSignature = async (signer, docHash) => {
    const message = "Encrypting doc: " + docHash;
    const signature = await signer.signMessage(message);
    const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
    return crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  };

  const encryptData = async (data, signer, docHash, filename) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyFromSignature(signer, docHash);

    const payload = {
      name: filename,
      data: Array.from(new Uint8Array(data)),
    };
    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedPayload);

    return new Blob([iv, new Uint8Array(encrypted)]);
  };

  const decryptData = async (encryptedBlob, signer, docHash) => {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const iv = arrayBuffer.slice(0, 12);
    const data = arrayBuffer.slice(12);
    const key = await deriveKeyFromSignature(signer, docHash);

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
    setLoading(true);

    (async () => {
      const buf = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buf);
      const hash = "0x" + [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");

      const encryptedBlob = await encryptData(buf, signer, hash, file.name);
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
        setLoading(false);
        return;
      }

      const data = await res.json();
      const cid = data.IpfsHash;

      try {
        const tx = await contract.storeDocument(hash, cid, signature, { gasLimit: 10000000 });
        await tx.wait();
      } catch (err) {
        console.error("Error storing document in contract:", err);
        setLoading(false);
        return;
      }

      const documentDetails = await getDocumentDetails(hash);

      if (documentDetails) {
        setDocs((d) => [
          ...d,
          {
            hash,
            cid,
            name: file.name,
            timestamp: documentDetails.timestamp,
          },
        ]);
      }
      e.target.value = null;
      setLoading(false);
    })();
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

  const forceDownload = async (cid, hash) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!response.ok) throw new Error("Download failed");

      const encryptedBlob = await response.blob();
      const { filename, buffer } = await decryptData(encryptedBlob, signer, hash);

      const url = window.URL.createObjectURL(new Blob([buffer]));
      const a = document.createElement("a");
      a.download = filename || "decrypted-file";
      a.href = url;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Decryption error:", err);
      alert("An error occurred. Try again.");
    }
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
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div> {/* Spinner */}
          </div>
        )}
      </section>

      <section className="container" aria-label="Document list">
        <h2>Your Documents</h2>
        {docs.length === 0 ? (
          <p>No documents found</p>
        ) : (
          <ul>
            {docs.map(({ hash, cid, timestamp }) => (
              <li key={hash}>
                <div>
                  <strong>Uploaded at:</strong> <span>{timestamp}</span>
                </div>
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
                  <button onClick={() => forceDownload(cid, hash)}>Download</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
