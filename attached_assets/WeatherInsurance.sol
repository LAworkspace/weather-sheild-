// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract WeatherInsurance {
    address public insurer;
    AggregatorV3Interface internal weatherOracle;

    struct Policy {
        address policyHolder;
        uint256 premiumPaid;
        uint256 insuredAmount;
        uint256 minTemperature;
        uint256 maxTemperature;
        bool isActive;
    }

    mapping(address => Policy) public policies;

    event PolicyPurchased(address indexed user, uint256 amount, uint256 minTemp, uint256 maxTemp);
    event PayoutProcessed(address indexed user, uint256 payoutAmount);
    
    modifier onlyInsurer() {
        require(msg.sender == insurer, "Only insurer can perform this action");
        _;
    }

    constructor(address _oracleAddress) {
        insurer = msg.sender;
        weatherOracle = AggregatorV3Interface(_oracleAddress);
    }

    function buyPolicy(uint256 _minTemp, uint256 _maxTemp) public payable {
        require(msg.value > 0, "Must send ETH as premium");

        policies[msg.sender] = Policy({
            policyHolder: msg.sender,
            premiumPaid: msg.value,
            insuredAmount: msg.value * 2,
            minTemperature: _minTemp,
            maxTemperature: _maxTemp,
            isActive: true
        });

        emit PolicyPurchased(msg.sender, msg.value, _minTemp, _maxTemp);
    }

    function checkWeatherAndProcessPayout() public {
        require(policies[msg.sender].isActive, "No active policy found");

        (, int256 temperature,,,) = weatherOracle.latestRoundData();
        uint256 temp = uint256(temperature);

        Policy storage policy = policies[msg.sender];

        if (temp < policy.minTemperature || temp > policy.maxTemperature) {
            uint256 payoutAmount = policy.insuredAmount;
            policy.isActive = false;
            payable(policy.policyHolder).transfer(payoutAmount);

            emit PayoutProcessed(policy.policyHolder, payoutAmount);
        }
    }
}
