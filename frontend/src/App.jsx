import { useState, useEffect } from "react";
import UploadDocument from "./components/UploadDocument";
import CheckDocument from "./components/CheckDocument";
import RetrieveDocument from "./components/RetrieveDocument";
import About from "./components/About";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem("documents");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("about");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(docs));
  }, [docs]);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setUserAddress(await signer.getAddress());
    })();
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "upload":
        return <UploadDocument docs={docs} setDocs={setDocs} />;
      case "check":
        return <CheckDocument docs={docs} />;
      case "retrieve":
        return <RetrieveDocument />;
      case "about":
        return <About />;
      default:
        return null;
    }
  };

  return (
    <>
      <header>
        <div className="header-content">
          <div className="header-logo">⚖️</div>
          <div>
            <h1 className="header-title">Legal Doc Vault</h1>
            <p className="contract-address">
              Contract: {import.meta.env.VITE_DOC_MANAGER}<br />
              You: {userAddress}
            </p>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <button onClick={() => setActiveTab("about")} className={activeTab === "about" ? "active" : ""}>About</button>
        <button onClick={() => setActiveTab("upload")} className={activeTab === "upload" ? "active" : ""}>Upload & Sign</button>
        <button onClick={() => setActiveTab("check")} className={activeTab === "check" ? "active" : ""}>Verify</button>
        <button onClick={() => setActiveTab("retrieve")} className={activeTab === "retrieve" ? "active" : ""}>Retrieve</button>
      </nav>

      <main>{renderTab()}</main>

      <footer>
        &copy; {new Date().getFullYear()} María Jaque, Catalina Royo-Villanova and Victoria García
      </footer>
    </>
  );
}
