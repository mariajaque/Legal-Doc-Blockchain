const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LegalDocumentManager", () => {
  it("stores and verifies a document hash", async () => {
    const [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("LegalDocumentManager");
    const mgr = await Factory.deploy();

    const hash = ethers.keccak256(ethers.toUtf8Bytes("dummy"));
    await expect(mgr.storeDocument(hash, "CID123")).to.emit(
      mgr,
      "DocumentStored"
    );

    const [docOwner] = await mgr.getDocument(hash);
    expect(docOwner).to.equal(owner.address);
    expect(await mgr.verify(hash)).to.be.true;
    expect(await mgr.verify(ethers.keccak256("0x01"))).to.be.false;
  });

  it("prevents duplicates", async () => {
    const Factory = await ethers.getContractFactory("LegalDocumentManager");
    const mgr = await Factory.deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc"));
    await mgr.storeDocument(hash, "");
    await expect(mgr.storeDocument(hash, "")).to.be.revertedWith("Document exists");
  });
});
