const { ethers } = require("hardhat");

async function main() {
  // Get the first signer (deployer) from Hardhat
  const [deployer] = await ethers.getSigners();

  console.log(`🚀 Deploying contract using account: ${deployer.address}`);

  // Get provider to fetch balance
  const provider = ethers.provider;
  const balance = await provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log(`💰 Deployer balance: ${balanceInEth} ETH`);

  // Ensure deployer has enough balance
  const minRequiredEth = ethers.parseEther("0.01"); // Adjust as needed
  if (balance < minRequiredEth) {
    console.error(`❌ Insufficient funds! Need at least 0.01 ETH.`);
    console.log("🔗 Get Sepolia ETH from: https://faucet.quicknode.com/ethereum/sepolia");
    process.exit(1);
  }

  // Deploy contract with oracle address
  const oracleAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Replace with actual oracle address
  const WeatherInsurance = await ethers.getContractFactory("WeatherInsurance");

  console.log("📜 Deploying WeatherInsurance contract...");
  const weatherInsurance = await WeatherInsurance.deploy(oracleAddress);
  await weatherInsurance.waitForDeployment();

  console.log(`✅ WeatherInsurance deployed at: ${await weatherInsurance.getAddress()}`);
}

// Run the script
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
