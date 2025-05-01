export default function About() {
    return (
      <section className="container" aria-label="About Legal Doc Vault">
        <h2>About Legal Doc Vault</h2>
  
        <div className="about-section">
          <p>
            <strong>Who we are:</strong> We are a team of three Computer Engineering students —
            <span className="highlight"> María Jaque</span>, <span className="highlight">Catalina Royo-Villanova</span>, and <span className="highlight">Victoria García</span> —
            passionate about using cutting-edge technology to improve digital trust and document security.
          </p>
  
          <p>
            <strong>Why this project matters:</strong> In today's digital era, verifying the authenticity of sensitive documents such as legal agreements, contracts, academic certificates, and property deeds is more critical than ever. Fraudulent documents can be easily modified or forged using basic tools, and users typically lack a secure way to prove that a file hasn't been tampered with after issuance. Our project addresses this by combining encryption, decentralized storage (IPFS), and a tamper-proof blockchain registry to ensure the integrity of legal documents.
          </p>

          <p><em>Imagine this:</em> A lawyer receives a contract and needs to ensure it's the original, unedited version previously agreed upon. By checking the document's hash on Legal Doc Vault, the lawyer can instantly verify whether it was registered and remains unchanged—without needing to trust the sender or use centralized platforms.</p>
  
          <p>
            <strong>What we built:</strong> Legal Doc Vault is a decentralized application (dApp) that allows users to upload, verify, and retrieve legal documents securely. It uses the Ethereum blockchain to store document hashes and IPFS for decentralized file storage, ensuring that documents are tamper-proof and easily verifiable. You can access the repository in the following link:
            <a href="https://github.com/mariajaque/Legal-Doc-Blockchain.git" target="_blank" rel="noopener noreferrer"> GitHub Repository</a>.
          </p>
          <p>
            <strong>What this project does:</strong>
          </p>
          <ul className="pill-list">
            <li>🔐 Upload and encrypt legal documents securely</li>
            <li>📦 Store the document hash and IPFS CID on a blockchain</li>
            <li>✅ Verify if a document has already been registered</li>
            <li>🔓 Retrieve and decrypt uploaded documents using a secure password</li>
          </ul>
  
          <p>
            <strong>How to use it:</strong>
          </p>
          <ul className="pill-list usage">
            <li><strong>Upload:</strong> Go to the "Upload" tab, select a document, and choose a password to encrypt it.</li>
            <li><strong>Verify:</strong> Use the "Verify" tab to check if a document is already registered by uploading it.</li>
            <li><strong>Retrieve:</strong> In the "Retrieve" tab, paste a known hash and use your password to decrypt and download the document.</li>
          </ul>
  
          <p className="footnote">
            All files are stored via IPFS (Pinata) and their integrity is guaranteed using SHA-256 hashing and a blockchain smart contract.
          </p>
        </div>
      </section>
    );
  }
  