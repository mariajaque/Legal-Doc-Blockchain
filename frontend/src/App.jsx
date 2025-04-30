import { useState, useEffect } from "react";
import { ethers } from "ethers";
import artifact from "../../artifacts/contracts/LegalDocumentManager.sol/LegalDocumentManager.json";
import "./App.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_DOC_MANAGER;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export default function App() {
  const [contract, setContract] = useState();
  const [docs, setDocs] = useState([]);

  // 1. Conectar wallet y contrato
  useEffect(() => {
    (async () => {
      if (!window.ethereum) return alert("Instala MetaMask primero.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer));
    })();
  }, []);

  // 2. Manejar carga de archivo
  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !contract) return;

    // 2-a. Calcular hash SHA-256
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const hash =
      "0x" +
      [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");

    // 2-b. Subir a Pinata
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
      console.error("Error al subir a Pinata:", await res.text());
      return;
    }

    const data = await res.json();
    const cid = data.IpfsHash;

    // 2-c. Almacenar en la cadena
    const tx = await contract.storeDocument(hash, cid);
    await tx.wait();

    setDocs((d) => [...d, { hash, cid }]);
  };

  return (
    <main className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Legal Doc Vault</h1>

      <label className="block mb-4">
        <span>Selecciona PDF / DOCX</span>
        <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} className="mt-2" />
      </label>

      <h2 className="text-xl mb-2">Tus documentos</h2>
      <ul className="list-disc ml-6">
        {docs.map(({ hash, cid }) => (
          <li key={hash} className="mb-1">
            <code>{hash.slice(0, 10)}…</code> — CID&nbsp;
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600"
            >
              {cid}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
