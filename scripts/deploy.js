const hre = require("hardhat");

async function main() {
  const tms = await hre.ethers.getContractFactory("JourneyFactory");
  const contract = await tms.deploy(); //instance of contract

  await contract.deployed();
  console.log("Address of contract:", contract.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});