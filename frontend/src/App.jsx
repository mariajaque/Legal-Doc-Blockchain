import { useState, useEffect } from "react";
import UploadDocument from "./components/UploadDocument";
import CheckDocument from "./components/CheckDocument";
import RetrieveDocument from "./components/RetrieveDocument";
import "./App.css";

export default function App() {
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem("documents");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(docs));
  }, [docs]);

  const renderTab = () => {
    switch (activeTab) {
      case "upload":
        return <UploadDocument docs={docs} setDocs={setDocs} />;
      case "check":
        return <CheckDocument docs={docs} />;
      case "retrieve":
        return <RetrieveDocument />;
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
              Contract: {import.meta.env.VITE_DOC_MANAGER}
            </p>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <button
          onClick={() => setActiveTab("upload")}
          className={activeTab === "upload" ? "active" : ""}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab("check")}
          className={activeTab === "check" ? "active" : ""}
        >
          Verify
        </button>
        <button
          onClick={() => setActiveTab("retrieve")}
          className={activeTab === "retrieve" ? "active" : ""}
        >
          Retrieve
        </button>
      </nav>

      <main>{renderTab()}</main>

      <footer>
        &copy; {new Date().getFullYear()} María Jaque, Catalina Royo-Villanova and Victoria García
      </footer>
    </>
  );
}
