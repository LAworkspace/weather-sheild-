const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, user] = await ethers.getSigners();
  console.log("Testing with accounts:", {
    deployer: deployer.address,
    user: user.address
  });

  // Get deployed contract addresses from environment variables
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const insuranceAddress = process.env.INSURANCE_ADDRESS;
  
  if (!oracleAddress || !insuranceAddress) {
    console.error("Please set ORACLE_ADDRESS and INSURANCE_ADDRESS environment variables");
    return;
  }
  
  console.log("Contract addresses:", {
    oracle: oracleAddress,
    insurance: insuranceAddress
  });

  // Connect to deployed contracts
  const weatherOracle = await ethers.getContractAt("WeatherOracle", oracleAddress);
  const weatherInsurance = await ethers.getContractAt("WeatherInsurance", insuranceAddress);
  
  // Get current temperature
  const currentTemp = await weatherOracle.getTemperature();
  console.log(`Current temperature: ${currentTemp / 10}°C`);
  
  // Check contract balances
  const userInitialBalance = await ethers.provider.getBalance(user.address);
  const contractInitialBalance = await weatherInsurance.getContractBalance();
  
  console.log("Initial balances:", {
    user: ethers.formatEther(userInitialBalance) + " ETH",
    contract: ethers.formatEther(contractInitialBalance) + " ETH"
  });
  
  // Check if user has a policy
  const hasPolicy = await weatherInsurance.hasActivePolicy(user.address);
  console.log(`User has active policy: ${hasPolicy}`);
  
  if (!hasPolicy) {
    console.log("Creating a new policy...");
    
    // Buy a policy with temperature range (5°C to 15°C)
    // Current temperature is 25°C, so this should trigger a payout
    const premiumAmount = ethers.parseEther("1.0");
    const minTemp = 50; // 5.0°C
    const maxTemp = 150; // 15.0°C
    
    const tx = await weatherInsurance.connect(user).buyPolicy(minTemp, maxTemp, { value: premiumAmount });
    await tx.wait();
    console.log(`Policy created with temperature range: ${minTemp/10}°C to ${maxTemp/10}°C`);
    
    // Get policy details
    const policy = await weatherInsurance.getPolicy(user.address);
    console.log("Policy created:", {
      holder: policy.policyHolder,
      premiumPaid: ethers.formatEther(policy.premiumPaid) + " ETH",
      insuredAmount: ethers.formatEther(policy.insuredAmount) + " ETH",
      minTemperature: policy.minTemperature / 10 + "°C",
      maxTemperature: policy.maxTemperature / 10 + "°C",
      isActive: policy.isActive
    });
  }
  
  // Process payout
  console.log("Processing payout...");
  const claimTx = await weatherInsurance.connect(user).checkWeatherAndProcessPayout();
  await claimTx.wait();
  
  // Check if policy is still active
  const policyAfterClaim = await weatherInsurance.getPolicy(user.address);
  console.log(`Policy active after claim: ${policyAfterClaim.isActive}`);
  
  // Check balances after payout
  const userFinalBalance = await ethers.provider.getBalance(user.address);
  const contractFinalBalance = await weatherInsurance.getContractBalance();
  
  console.log("Final balances:", {
    user: ethers.formatEther(userFinalBalance) + " ETH",
    contract: ethers.formatEther(contractFinalBalance) + " ETH"
  });
  
  if (!policyAfterClaim.isActive) {
    console.log("Payout successful! Policy has been deactivated.");
    
    // Calculate payout amount (accounting for gas)
    const balanceDiff = userFinalBalance - userInitialBalance;
    console.log(`User balance change: ${ethers.formatEther(balanceDiff)} ETH`);
  } else {
    console.log("No payout was triggered. Check weather conditions against policy terms.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});