// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  LegalDocumentManager
 * @notice Stores the SHA-256 hash (or IPFS CID) of a legal document, the
 *         wallet that submitted it, a digital signature proving authorship,
 *         and a timestamp. Once stored, entries are immutable,
 *         providing tamper-evidence on-chain.
 */
contract LegalDocumentManager {
    struct Document {
        address owner;      // wallet that registered the document
        string cid;         // IPFS content identifier
        uint256 timestamp;  // block time of registration
        string signature;   // signature of doc hash (signed off-chain by wallet)
    }

    // Mapping: document hash → Document metadata
    mapping(bytes32 => Document) private documents;

    /// Emitted whenever a new document is recorded
    event DocumentStored(bytes32 indexed docHash, address indexed owner, string cid, string signature);

    /**
     * @notice Registers a document if its hash hasn't been recorded before.
     * @param docHash SHA-256 digest (32 bytes) of the document, computed off-chain
     * @param cid IPFS CID pointing to the document (can be encrypted)
     * @param signature Signature of the hash, signed off-chain by the sender's wallet
     */
    function storeDocument(bytes32 docHash, string calldata cid, string calldata signature) external {
        require(documents[docHash].owner == address(0), "Document already exists");
        documents[docHash] = Document(msg.sender, cid, block.timestamp, signature);
        emit DocumentStored(docHash, msg.sender, cid, signature);
    }

    /**
     * @notice Retrieves the stored metadata for a given document hash.
     * @param docHash Document hash to look up
     * @return owner Address that registered the document
     * @return cid IPFS CID of the document
     * @return timestamp Block timestamp when registered
     * @return signature Signature submitted at registration
     */
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

    /**
     * @notice Checks if a document has been registered.
     * @param docHash Document hash to verify
     * @return True if the document exists
     */
    function verify(bytes32 docHash) external view returns (bool) {
        return documents[docHash].owner != address(0);
    }
}
