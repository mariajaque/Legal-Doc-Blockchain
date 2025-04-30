// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  LegalDocumentManager
 * @notice Stores the SHA-256 hash (or IPFS CID) of a legal document, the
 *         owner who submitted it, and an optional metadata URI.  Once stored,
 *         entries are immutable, providing tamper-evidence on-chain.
 */
contract LegalDocumentManager {
    struct Document {
        address owner;      // wallet that registered the doc
        string  cid;        // IPFS content-identifier (raw doc encrypted, if desired)
        uint256 timestamp;  // block time of registration
    }

    // docHash → Document
    mapping(bytes32 => Document) private documents;

    /// Emitted whenever a new document is recorded
    event DocumentStored(bytes32 indexed docHash, address indexed owner, string cid);

    /**
     * @dev Register a document. Fails if that hash already exists.
     * @param docHash 32-byte SHA-256 digest computed off-chain
     * @param cid     IPFS CID pointing to the document blob
     */
    function storeDocument(bytes32 docHash, string calldata cid) external {
        require(documents[docHash].owner == address(0), "Document exists");
        documents[docHash] = Document(msg.sender, cid, block.timestamp);
        emit DocumentStored(docHash, msg.sender, cid);
    }

    /// Read-only getter
    function getDocument(bytes32 docHash) external view returns (
        address owner, string memory cid, uint256 timestamp
    ) {
        Document storage d = documents[docHash];
        require(d.owner != address(0), "Not found");
        return (d.owner, d.cid, d.timestamp);
    }

    /// Lightweight existence / authenticity check
    function verify(bytes32 docHash) external view returns (bool) {
        return documents[docHash].owner != address(0);
    }
}
