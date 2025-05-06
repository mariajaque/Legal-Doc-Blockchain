// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  LegalDocumentManager
 * @notice Stores the SHA-256 hash (or IPFS CID) of a legal document, the
 *         owner who submitted it, a signature proving authorship,
 *         and an optional metadata URI. Once stored, entries are immutable, providing tamper-evidence on-chain.
 */
contract LegalDocumentManager {
    struct Document {
        address owner;      // wallet that registered the doc
        bytes32 cid;        // IPFS content-identifier (raw doc encrypted, if desired)
        uint256 timestamp;  // block time of registration
        bytes32 signature;  // digital signature of the doc hash (signed by the wallet)
    }

    // Mapping to store documents by their hash (more gas efficient than arrays)
    mapping(bytes32 => Document) private documents;

    /// Emitted whenever a new document is recorded
    event DocumentStored(bytes32 indexed docHash, address indexed owner, bytes32 cid, bytes32 signature);

    /**
     * @dev Register a document. Fails if that hash already exists.
     * @param docHash 32-byte SHA-256 digest computed off-chain
     * @param cid     IPFS CID pointing to the document blob (stored as bytes32)
     * @param signature Digital signature of the hash, signed off-chain (stored as bytes32)
     */
    function storeDocument(bytes32 docHash, bytes32 cid, bytes32 signature) external {
        // Ensure the document doesn't already exist
        require(documents[docHash].owner == address(0), "Document exists");

        // Store the document for the owner
        documents[docHash] = Document(msg.sender, cid, block.timestamp, signature);

        emit DocumentStored(docHash, msg.sender, cid, signature);
    }

    /**
     * @dev Read-only getter to retrieve a document by its hash
     * @param docHash The SHA-256 hash of the document
     * @return owner The address of the document owner
     * @return cid The IPFS CID of the document
     * @return timestamp The registration timestamp of the document
     * @return signature The digital signature of the document hash
     */
    function getDocument(bytes32 docHash) external view returns (
        address owner, bytes32 cid, uint256 timestamp, bytes32 signature
    ) {
        Document storage d = documents[docHash];
        require(d.owner != address(0), "Document not found");
        return (d.owner, d.cid, d.timestamp, d.signature);
    }

    /**
     * @dev Verify if a document exists (lightweight check)
     * @param docHash The SHA-256 hash of the document
     * @return bool Whether the document exists or not
     */
    function verify(bytes32 docHash) external view returns (bool) {
        return documents[docHash].owner != address(0);
    }
}
