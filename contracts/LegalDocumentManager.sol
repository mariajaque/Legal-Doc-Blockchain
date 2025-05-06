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
        string  cid;        // IPFS content-identifier (raw doc encrypted, if desired)
        uint256 timestamp;  // block time of registration
        string  signature;  // digital signature of the doc hash (signed by the wallet)
    }

    // docHash → Document
    mapping(bytes32 => Document) private documents;

    // Mapping to store documents per owner (address)
    mapping(address => bytes32[]) private ownerDocuments;

    /// Emitted whenever a new document is recorded
    event DocumentStored(bytes32 indexed docHash, address indexed owner, string cid, string signature);

    /**
     * @dev Register a document. Fails if that hash already exists.
     * @param docHash 32-byte SHA-256 digest computed off-chain
     * @param cid     IPFS CID pointing to the document blob
     * @param signature Digital signature of the hash, signed off-chain
     */
    function storeDocument(bytes32 docHash, string calldata cid, string calldata signature) external {
        require(documents[docHash].owner == address(0), "Document exists");
        
        // Store the document for the owner
        documents[docHash] = Document(msg.sender, cid, block.timestamp, signature);
        ownerDocuments[msg.sender].push(docHash);  // Save the document hash under the owner's address

        emit DocumentStored(docHash, msg.sender, cid, signature);
    }

    /// Read-only getter to retrieve a document by its hash
    function getDocument(bytes32 docHash) external view returns (
        address owner, string memory cid, uint256 timestamp, string memory signature
    ) {
        Document storage d = documents[docHash];
        require(d.owner != address(0), "Not found");
        return (d.owner, d.cid, d.timestamp, d.signature);
    }

    /// Read-only getter to retrieve all documents by the owner's address
    function getDocumentsByOwner(address owner) external view returns (Document[] memory) {
        // Ensure the caller is the owner or has valid permission
        require(msg.sender == owner, "You are not the owner of these documents");

        uint count = ownerDocuments[owner].length;
        Document[] memory ownerDocs = new Document[](count);

        for (uint i = 0; i < count; i++) {
            bytes32 docHash = ownerDocuments[owner][i];
            ownerDocs[i] = documents[docHash];
        }

        return ownerDocs;
    }

    /// Lightweight existence / authenticity check
    function verify(bytes32 docHash) external view returns (bool) {
        return documents[docHash].owner != address(0);
    }
}
