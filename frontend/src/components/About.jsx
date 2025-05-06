export default function About() {
  return (
    <section className="container" aria-label="About Legal Doc Vault">
      <h2>About Legal Doc Vault</h2>

      <div className="about-section">
        <p>
          <strong>Who we are:</strong> We are a team of three Computer Engineering students — 
          <span className="highlight"> María Jaque</span>, <span className="highlight">Catalina Royo-Villanova</span>, and <span className="highlight">Victoria García</span> — 
          passionate about using cutting-edge technology to improve digital trust and document security through the use of blockchain and decentralized systems.
        </p>

        <p>
          <strong>Why this project matters:</strong> In the current digital landscape, ensuring the authenticity of legal documents is crucial. Documents such as contracts, certificates, and legal agreements are often susceptible to fraud and alteration. Unfortunately, users lack a secure way to verify the integrity of such files after issuance. Legal Doc Vault solves this problem by integrating blockchain technology with decentralized storage (IPFS), ensuring the immutability and trustworthiness of legal documents. Moreover, it functions as a decentralized notary, enabling users to sign documents securely and validate their authenticity.
        </p>

        <p><em>Imagine this:</em> A lawyer receives a contract and needs to ensure it's the original, unaltered version. By checking the document’s hash on Legal Doc Vault, they can instantly confirm whether the document is registered and unmodified—without relying on third parties or centralized platforms. Additionally, the document's signature can be verified against the signer’s address on the blockchain, ensuring its validity and preventing forgery.</p>

        <p>
          <strong>What we built:</strong> Legal Doc Vault is a decentralized application (dApp) that allows users to upload, sign, verify, and retrieve legal documents securely. Using the Ethereum blockchain to store document hashes, digital signatures, and IPFS for decentralized file storage, it guarantees that each document is tamper-proof and easily verifiable. The signing functionality acts as a decentralized notary, ensuring the document's authenticity. The system ensures that documents are registered, signed, and immutable. Access the repository here: <a
            href="https://github.com/mariajaque/Legal-Doc-Blockchain.git" target="_blank" rel="noopener noreferrer">GitHub Repository
          </a>.
        </p>

        <p className="assumptions">
          <strong>⚠ Assumptions:</strong> This website assumes there is a way to map a physical person to their Ethereum wallet address for the purposes of signing and verifying documents.
        </p>

        <p>
          <strong>What this project does:</strong>
        </p>
        <ul className="pill-list">
          <li>🔐 Upload and encrypt legal documents securely</li>
          <li>📜 Sign documents using your Ethereum address, acting as a decentralized notary</li>
          <li>📦 Store the document hash, digital signature, and IPFS CID on the blockchain</li>
          <li>✅ Verify whether a document has already been registered and if it matches the signature</li>
          <li>🔓 Retrieve and decrypt uploaded documents using a secure password</li>
        </ul>

        <p>
          <strong>How to use it:</strong>
        </p>
        <ul className="pill-list usage">
          <li><strong>Upload & Sign:</strong> Go to the "Upload" tab, select a document, choose a password to encrypt it, and sign it using your Ethereum address.</li>
          <li><strong>Verify:</strong> Use the "Verify" tab to check if a document is already registered and verify the authenticity of the document's signature.</li>
          <li><strong>Retrieve:</strong> In the "Retrieve" tab, input a known document hash and use the password to decrypt and download the document.</li>
        </ul>

        <p className="footnote">
          All files are stored via IPFS (Pinata) and their integrity is guaranteed using SHA-256 hashing, blockchain smart contracts, and digital signatures for secure verification.
        </p>
      </div>
    </section>
  );
}
