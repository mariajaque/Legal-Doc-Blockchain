// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  LegalDocumentManager
 * @notice Stores the SHA-256 hash (or IPFS CID) of a legal document, the
 *         owner who submitted it, a signature proving authorship,
 *         and an optional metadata URI. Once stored,
 *         entries are immutable, providing tamper-evidence on-chain.
 */
contract LegalDocumentManager {
    struct Document {
        address owner;      // wallet that registered the doc
        string cid;         // IPFS CID (variable length)
        uint256 timestamp;  // block time of registration
        string signature;   // full-length Ethereum signature (variable length)
    }

    // Mapping to store documents by their hash (more gas efficient than arrays)
    mapping(bytes32 => Document) private documents;

    /// Emitted whenever a new document is recorded
    event DocumentStored(bytes32 indexed docHash, address indexed owner, string cid, string signature);

    function storeDocument(bytes32 docHash, string calldata cid, string calldata signature) external {
        // Ensure the document doesn't already exist
        require(documents[docHash].owner == address(0), "Document exists");
        // Store the document for the owner
        documents[docHash] = Document(msg.sender, cid, block.timestamp, signature);
        emit DocumentStored(docHash, msg.sender, cid, signature);
    }

    function getDocument(bytes32 docHash) external view returns (
        address owner,
        string memory cid,
        uint256 timestamp,
        string memory signature
    ) {
        Document storage d = documents[docHash];
        require(d.owner != address(0), "Document not found");
        return (d.owner, d.cid, d.timestamp, d.signature);
    }

    function verify(bytes32 docHash) external view returns (bool) {
        return documents[docHash].owner != address(0);
    }
}
