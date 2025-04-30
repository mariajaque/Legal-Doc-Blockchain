import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Single-contract deployment for LegalDocumentManager
 *
 * Ignition will compile, deploy, and export the address so you
 * can copy it into frontend/.env as VITE_DOC_MANAGER.
 */
export default buildModule("LegalDocModule", (m) => {
  // Deploy the contract with no constructor params
  const manager = m.contract("LegalDocumentManager");

  // Return anything you want scripts/tests to access later
  return { manager };
});
