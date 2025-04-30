// ignition/modules/LegalDocModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Deploys a single instance of LegalDocumentManager.
 * Ignition will remember the address per network and
 * skip redeploying if it already exists.
 */
module.exports = buildModule("LegalDocModule", (m) => {
  // The contract name *must* match the .sol filename
  const manager = m.contract("LegalDocumentManager");
  return { manager };
});
