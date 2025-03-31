const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WeatherOracle first
  const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
  const weatherOracle = await WeatherOracle.deploy();
  await weatherOracle.waitForDeployment();
  
  const oracleAddress = await weatherOracle.getAddress();
  console.log("WeatherOracle deployed to:", oracleAddress);

  // Deploy WeatherInsurance with the oracle address
  const WeatherInsurance = await hre.ethers.getContractFactory("WeatherInsurance");
  const weatherInsurance = await WeatherInsurance.deploy(oracleAddress);
  await weatherInsurance.waitForDeployment();
  
  const insuranceAddress = await weatherInsurance.getAddress();
  console.log("WeatherInsurance deployed to:", insuranceAddress);

  // Set up some initial weather data
  console.log("Setting initial weather data...");
  
  // Set temperature to 25.0°C
  await weatherOracle.updateTemperature(250);
  
  // Set rainfall: 2.5mm in last 24h, 50mm in last 30d
  await weatherOracle.updateRainfall(25, 500);
  
  // Set 3 days without rain
  await weatherOracle.updateDrought(3);
  
  // Set wind speed to 12.5 km/h
  await weatherOracle.updateWindSpeed(125);
  
  console.log("Initial weather data set successfully!");
  
  console.log("Deployment completed successfully!");
  console.log("-------------------------------------");
  console.log("Contract Addresses:");
  console.log("WeatherOracle:", oracleAddress);
  console.log("WeatherInsurance:", insuranceAddress);
  console.log("-------------------------------------");
  console.log("Update frontend configuration in client/src/lib/contracts.ts with the WeatherInsurance address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});