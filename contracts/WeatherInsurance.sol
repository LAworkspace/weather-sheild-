// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WeatherOracle.sol";

/**
 * @title WeatherInsurance
 * @dev Smart contract for parametric weather insurance policies
 */
contract WeatherInsurance is ReentrancyGuard, Ownable {
    // Oracle for weather data
    WeatherOracle public oracle;
    
    // Premium calculation parameters
    uint public constant PREMIUM_PERCENTAGE = 5; // 5% of insured amount
    uint public constant COVERAGE_MULTIPLIER = 2; // Payout is 2x premium
    
    // Policy struct to store policy details
    struct Policy {
        address policyHolder;
        uint premiumPaid;
        uint insuredAmount;
        int minTemperature;
        int maxTemperature;
        bool isActive;
    }
    
    // Mapping to store policies by address
    mapping(address => Policy) public policies;
    
    // Events
    event PolicyPurchased(
        address indexed user,
        uint amount,
        int minTemp,
        int maxTemp
    );
    
    event PayoutProcessed(
        address indexed user,
        uint payoutAmount
    );
    
    /**
     * @dev Constructor
     * @param _oracleAddress Address of the deployed WeatherOracle
     */
    constructor(address _oracleAddress) Ownable(msg.sender) {
        oracle = WeatherOracle(_oracleAddress);
    }
    
    /**
     * @dev Update oracle address
     * @param _newOracleAddress Address of the new oracle
     */
    function updateOracle(address _newOracleAddress) external onlyOwner {
        oracle = WeatherOracle(_newOracleAddress);
    }
    
    /**
     * @dev Purchase a new insurance policy
     * @param _minTemp Minimum temperature for policy (in tenths of a degree)
     * @param _maxTemp Maximum temperature for policy (in tenths of a degree)
     */
    function buyPolicy(int _minTemp, int _maxTemp) external payable nonReentrant {
        // Check if user already has an active policy
        require(!policies[msg.sender].isActive, "You already have an active policy");
        
        // Check if min temperature is less than max temperature
        require(_minTemp < _maxTemp, "Min temperature must be less than max temperature");
        
        // Calculate insured amount based on premium paid
        uint insuredAmount = msg.value * COVERAGE_MULTIPLIER;
        
        // Create a new policy
        policies[msg.sender] = Policy({
            policyHolder: msg.sender,
            premiumPaid: msg.value,
            insuredAmount: insuredAmount,
            minTemperature: _minTemp,
            maxTemperature: _maxTemp,
            isActive: true
        });
        
        // Emit event
        emit PolicyPurchased(msg.sender, msg.value, _minTemp, _maxTemp);
    }
    
    /**
     * @dev Check weather conditions and process payout if conditions are met
     */
    function checkWeatherAndProcessPayout() external nonReentrant {
        // Get the policy for the caller
        Policy storage policy = policies[msg.sender];
        
        // Check if the caller has an active policy
        require(policy.isActive, "No active policy found");
        
        // Get current temperature from oracle
        int currentTemperature = oracle.getTemperature();
        
        // Check if payout conditions are met
        bool payoutTriggered = false;
        
        // Check if temperature is outside policy range
        if (currentTemperature <= policy.minTemperature || currentTemperature >= policy.maxTemperature) {
            payoutTriggered = true;
        }
        
        // Process payout if conditions are met
        if (payoutTriggered) {
            // Mark policy as inactive
            policy.isActive = false;
            
            // Transfer insured amount to policy holder
            (bool sent, ) = policy.policyHolder.call{value: policy.insuredAmount}("");
            require(sent, "Failed to send payout");
            
            // Emit payout event
            emit PayoutProcessed(policy.policyHolder, policy.insuredAmount);
        }
    }
    
    /**
     * @dev Get contract balance
     * @return Current contract balance
     */
    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }
    
    /**
     * @dev Check if an address has an active policy
     * @param _address Address to check
     * @return Boolean indicating if address has an active policy
     */
    function hasActivePolicy(address _address) external view returns (bool) {
        return policies[_address].isActive;
    }
    
    /**
     * @dev Get policy details
     * @param _address Address of the policy holder
     * @return Policy details
     */
    function getPolicy(address _address) external view returns (Policy memory) {
        return policies[_address];
    }
    
    /**
     * @dev Allow contract owner to withdraw funds in emergency
     * @param _amount Amount to withdraw
     */
    function withdraw(uint _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        (bool sent, ) = owner().call{value: _amount}("");
        require(sent, "Failed to send funds");
    }
}