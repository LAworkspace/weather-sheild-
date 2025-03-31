const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Weather Insurance", function () {
  let weatherOracle;
  let weatherInsurance;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy WeatherOracle
    const WeatherOracle = await ethers.getContractFactory("WeatherOracle");
    weatherOracle = await WeatherOracle.deploy();
    await weatherOracle.waitForDeployment();

    // Deploy WeatherInsurance with the oracle address
    const WeatherInsurance = await ethers.getContractFactory("WeatherInsurance");
    weatherInsurance = await WeatherInsurance.deploy(await weatherOracle.getAddress());
    await weatherInsurance.waitForDeployment();

    // Set initial weather data
    await weatherOracle.updateTemperature(250); // 25.0°C
    await weatherOracle.updateRainfall(25, 500); // 2.5mm in 24h, 50mm in 30d
    await weatherOracle.updateDrought(3); // 3 days without rain
    await weatherOracle.updateWindSpeed(125); // 12.5 km/h
  });

  describe("Deployment", function () {
    it("Should set the right owner for both contracts", async function () {
      expect(await weatherOracle.owner()).to.equal(owner.address);
      expect(await weatherInsurance.owner()).to.equal(owner.address);
    });

    it("Should set the oracle address correctly", async function () {
      const oracleAddress = await weatherOracle.getAddress();
      expect(await weatherInsurance.oracle()).to.equal(oracleAddress);
    });
  });

  describe("Weather Oracle", function () {
    it("Should update and retrieve weather data correctly", async function () {
      // Update temperature
      await weatherOracle.updateTemperature(300); // 30.0°C
      expect(await weatherOracle.getTemperature()).to.equal(300);

      // Update rainfall
      await weatherOracle.updateRainfall(50, 600); // 5mm in 24h, 60mm in 30d
      const rainfallData = await weatherOracle.getRainfallData();
      expect(rainfallData[0]).to.equal(50); // 24h rainfall
      expect(rainfallData[1]).to.equal(600); // 30d rainfall
      expect(rainfallData[2]).to.equal(0); // Days without rain (reset because of rainfall)

      // Update drought
      await weatherOracle.updateDrought(5); // 5 days without rain
      const droughtData = await weatherOracle.getRainfallData();
      expect(droughtData[2]).to.equal(5);

      // Update wind speed
      await weatherOracle.updateWindSpeed(150); // 15.0 km/h
      expect(await weatherOracle.getWindSpeed()).to.equal(150);

      // Get all weather data
      const allData = await weatherOracle.getAllWeatherData();
      expect(allData[0]).to.equal(300); // Temperature
      expect(allData[1]).to.equal(50); // 24h rainfall
      expect(allData[2]).to.equal(600); // 30d rainfall
      expect(allData[3]).to.equal(5); // Days without rain
      expect(allData[4]).to.equal(150); // Wind speed
    });

    it("Should only allow owner to update data", async function () {
      await expect(
        weatherOracle.connect(user1).updateTemperature(300)
      ).to.be.revertedWithCustomError(weatherOracle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Weather Insurance", function () {
    it("Should allow users to buy a policy", async function () {
      // Premium amount in ETH
      const premium = ethers.parseEther("1.0");
      
      // Buy a policy with temperature range 10.0°C to 30.0°C
      await weatherInsurance.connect(user1).buyPolicy(100, 300, { value: premium });
      
      // Check if policy was created correctly
      const policy = await weatherInsurance.getPolicy(user1.address);
      expect(policy.policyHolder).to.equal(user1.address);
      expect(policy.premiumPaid).to.equal(premium);
      expect(policy.insuredAmount).to.equal(premium * BigInt(2)); // 2x premium
      expect(policy.minTemperature).to.equal(100);
      expect(policy.maxTemperature).to.equal(300);
      expect(policy.isActive).to.equal(true);
    });

    it("Should not allow users to buy multiple policies", async function () {
      // Buy first policy
      await weatherInsurance.connect(user1).buyPolicy(100, 300, { value: ethers.parseEther("1.0") });
      
      // Try to buy second policy
      await expect(
        weatherInsurance.connect(user1).buyPolicy(100, 300, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("You already have an active policy");
    });

    it("Should process payouts when temperature is outside the policy range", async function () {
      // Buy a policy with temperature range 10.0°C to 20.0°C
      const premium = ethers.parseEther("1.0");
      await weatherInsurance.connect(user1).buyPolicy(100, 200, { value: premium });
      
      // Current temperature is 25.0°C, which is above max temperature (20.0°C)
      // So policy should trigger a payout
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      // Process payout
      await weatherInsurance.connect(user1).checkWeatherAndProcessPayout();
      
      // Check if policy is now inactive
      const policy = await weatherInsurance.getPolicy(user1.address);
      expect(policy.isActive).to.equal(false);
      
      // Check if payout was received
      const finalBalance = await ethers.provider.getBalance(user1.address);
      // Balance should increase by roughly the insured amount (minus gas)
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
    
    it("Should not process payout when temperature is within range", async function () {
      // Buy a policy with temperature range 20.0°C to 30.0°C
      const premium = ethers.parseEther("1.0");
      await weatherInsurance.connect(user1).buyPolicy(200, 300, { value: premium });
      
      // Current temperature is 25.0°C, which is within range
      // Update oracle temperature to 25.0°C
      await weatherOracle.updateTemperature(250);
      
      // Process payout (should not trigger)
      await weatherInsurance.connect(user1).checkWeatherAndProcessPayout();
      
      // Check if policy is still active
      const policy = await weatherInsurance.getPolicy(user1.address);
      expect(policy.isActive).to.equal(true);
    });
  });
});