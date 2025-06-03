const hre = require("hardhat");

async function main() {
  const DocumentSigner = await hre.ethers.getContractFactory("DocumentSigner");
  const contract = await DocumentSigner.deploy();

  // Espera a que el contrato se despliegue
  await contract.waitForDeployment();

  console.log("Contract deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
