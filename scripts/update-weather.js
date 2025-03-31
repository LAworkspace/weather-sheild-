const hre = require("hardhat");

async function main() {
  // Get deployed oracle address
  const oracleAddress = process.env.ORACLE_ADDRESS;
  if (!oracleAddress) {
    console.error("Please set the ORACLE_ADDRESS environment variable");
    return;
  }

  // Connect to WeatherOracle contract
  const weatherOracle = await hre.ethers.getContractAt("WeatherOracle", oracleAddress);
  
  console.log("Connected to WeatherOracle at address:", oracleAddress);
  
  // Get current weather data
  const currentData = await weatherOracle.getAllWeatherData();
  console.log("Current Weather Data:");
  console.log("Temperature:", currentData[0].toString() / 10, "°C");
  console.log("Rainfall (24h):", currentData[1].toString() / 10, "mm");
  console.log("Rainfall (30d):", currentData[2].toString(), "mm");
  console.log("Days without rain:", currentData[3].toString());
  console.log("Wind speed:", currentData[4].toString() / 10, "km/h");
  console.log("Last updated:", new Date(Number(currentData[5]) * 1000).toLocaleString());
  
  // Command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("\nUsage:");
    console.log("npx hardhat run scripts/update-weather.js --network localhost [command] [value]");
    console.log("\nCommands:");
    console.log("  temp [value]    - Update temperature (in °C, e.g. 25.5)");
    console.log("  rain [24h] [30d] - Update rainfall (in mm, e.g. 10.5 150)");
    console.log("  drought [days]  - Update days without rain");
    console.log("  wind [speed]    - Update wind speed (in km/h, e.g. 15.5)");
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case "temp":
      if (args.length < 2) {
        console.error("Please provide temperature value");
        return;
      }
      const temp = Math.round(parseFloat(args[1]) * 10); // Convert to tenths of a degree
      await weatherOracle.updateTemperature(temp);
      console.log(`\nTemperature updated to ${args[1]}°C`);
      break;
      
    case "rain":
      if (args.length < 3) {
        console.error("Please provide 24h and 30d rainfall values");
        return;
      }
      const rain24h = Math.round(parseFloat(args[1]) * 10); // Convert to tenths of a mm
      const rain30d = Math.round(parseFloat(args[2]));
      await weatherOracle.updateRainfall(rain24h, rain30d);
      console.log(`\nRainfall updated to ${args[1]}mm (24h) and ${args[2]}mm (30d)`);
      break;
      
    case "drought":
      if (args.length < 2) {
        console.error("Please provide days without rain value");
        return;
      }
      const days = parseInt(args[1]);
      await weatherOracle.updateDrought(days);
      console.log(`\nDays without rain updated to ${days}`);
      break;
      
    case "wind":
      if (args.length < 2) {
        console.error("Please provide wind speed value");
        return;
      }
      const wind = Math.round(parseFloat(args[1]) * 10); // Convert to tenths of a km/h
      await weatherOracle.updateWindSpeed(wind);
      console.log(`\nWind speed updated to ${args[1]} km/h`);
      break;
      
    default:
      console.error("Unknown command:", command);
  }
  
  // Get updated weather data
  const updatedData = await weatherOracle.getAllWeatherData();
  console.log("\nUpdated Weather Data:");
  console.log("Temperature:", updatedData[0].toString() / 10, "°C");
  console.log("Rainfall (24h):", updatedData[1].toString() / 10, "mm");
  console.log("Rainfall (30d):", updatedData[2].toString(), "mm");
  console.log("Days without rain:", updatedData[3].toString());
  console.log("Wind speed:", updatedData[4].toString() / 10, "km/h");
  console.log("Last updated:", new Date(Number(updatedData[5]) * 1000).toLocaleString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});