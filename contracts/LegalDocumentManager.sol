// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LegalDocumentManager
 * @notice Registers SHA-256 hashes of legal docs plus their IPFS CIDs.
 *         Registration is immutable and verifiable on-chain.
 */
contract LegalDocumentManager {
    struct Document {
        address owner;
        string  cid;
        uint256 timestamp;
    }

    mapping(bytes32 => Document) private documents;

    /// Emitted on first time storage
    event DocumentStored(bytes32 indexed docHash, address indexed owner, string cid);
    /// Emitted each time somebody verifies an existing document
    event DocumentVerified(bytes32 indexed docHash, address indexed viewer);

    /// Store a new document (reverts on duplicates)
    function storeDocument(bytes32 docHash, string calldata cid) external {
        require(documents[docHash].owner == address(0), "Document exists");
        documents[docHash] = Document(msg.sender, cid, block.timestamp);
        emit DocumentStored(docHash, msg.sender, cid);
    }

    /// Fetch full metadata
    function getDocument(bytes32 docHash)
        external
        view
        returns (address owner, string memory cid, uint256 timestamp)
    {
        Document storage d = documents[docHash];
        require(d.owner != address(0), "Not found");
        return (d.owner, d.cid, d.timestamp);
    }

    /// True ⇢ registered, False ⇢ unknown
    function documentExists(bytes32 docHash) public view returns (bool) {
        return documents[docHash].owner != address(0);
    }

    /// Read-only authenticity check + event
    function verify(bytes32 docHash) external returns (bool) {
        bool ok = documentExists(docHash);
        if (ok) emit DocumentVerified(docHash, msg.sender);
        return ok;
    }
}
