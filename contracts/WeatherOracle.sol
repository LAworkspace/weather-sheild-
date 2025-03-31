// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WeatherOracle
 * @dev Contract to simulate a weather oracle for testing purposes
 * In a production environment, this would be replaced with Chainlink data feeds
 */
contract WeatherOracle is Ownable {
    // Current temperature in the specified location (stored with 1 decimal place, e.g. 250 = 25.0°C)
    int private temperature;
    
    // Rainfall amount in the last 24 hours (in mm, with 1 decimal precision, e.g. 25 = 2.5mm)
    uint private rainfall24h;
    
    // Rainfall amount in the last 30 days (in mm)
    uint private rainfall30d;
    
    // Number of days without rain
    uint private daysWithoutRain;
    
    // Wind speed (in km/h, with 1 decimal precision, e.g. 155 = 15.5 km/h)
    uint private windSpeed;
    
    // Last updated timestamp
    uint private lastUpdated;
    
    // Data update events
    event TemperatureUpdated(int temperature, uint timestamp);
    event RainfallUpdated(uint rainfall24h, uint rainfall30d, uint timestamp);
    event DroughtUpdated(uint daysWithoutRain, uint timestamp);
    event WindSpeedUpdated(uint windSpeed, uint timestamp);
    
    constructor() Ownable(msg.sender) {
        // Initialize with some default values
        temperature = 200; // 20.0°C
        rainfall24h = 0;   // 0mm in last 24h
        rainfall30d = 100; // 100mm in last 30d
        daysWithoutRain = 2;
        windSpeed = 100;   // 10.0 km/h
        lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Updates the current temperature
     * @param _temperature New temperature value (with 1 decimal place, e.g. 250 = 25.0°C)
     */
    function updateTemperature(int _temperature) external onlyOwner {
        temperature = _temperature;
        lastUpdated = block.timestamp;
        emit TemperatureUpdated(_temperature, block.timestamp);
    }
    
    /**
     * @dev Updates rainfall data
     * @param _rainfall24h New 24h rainfall value (with 1 decimal precision, e.g. 25 = 2.5mm)
     * @param _rainfall30d New 30-day rainfall value
     */
    function updateRainfall(uint _rainfall24h, uint _rainfall30d) external onlyOwner {
        rainfall24h = _rainfall24h;
        rainfall30d = _rainfall30d;
        
        // If there's rainfall, reset days without rain counter
        if (_rainfall24h > 0) {
            daysWithoutRain = 0;
        }
        
        lastUpdated = block.timestamp;
        emit RainfallUpdated(_rainfall24h, _rainfall30d, block.timestamp);
    }
    
    /**
     * @dev Updates days without rain counter
     * @param _daysWithoutRain New days without rain counter
     */
    function updateDrought(uint _daysWithoutRain) external onlyOwner {
        daysWithoutRain = _daysWithoutRain;
        lastUpdated = block.timestamp;
        emit DroughtUpdated(_daysWithoutRain, block.timestamp);
    }
    
    /**
     * @dev Updates wind speed
     * @param _windSpeed New wind speed value (with 1 decimal precision, e.g. 155 = 15.5 km/h)
     */
    function updateWindSpeed(uint _windSpeed) external onlyOwner {
        windSpeed = _windSpeed;
        lastUpdated = block.timestamp;
        emit WindSpeedUpdated(_windSpeed, block.timestamp);
    }
    
    /**
     * @dev Gets the current temperature
     * @return Current temperature with 1 decimal place
     */
    function getTemperature() external view returns (int) {
        return temperature;
    }
    
    /**
     * @dev Gets the current rainfall data
     * @return Current 24h rainfall, 30d rainfall, and days without rain
     */
    function getRainfallData() external view returns (uint, uint, uint) {
        return (rainfall24h, rainfall30d, daysWithoutRain);
    }
    
    /**
     * @dev Gets the current wind speed
     * @return Current wind speed with 1 decimal place
     */
    function getWindSpeed() external view returns (uint) {
        return windSpeed;
    }
    
    /**
     * @dev Gets the last updated timestamp
     * @return Last updated timestamp
     */
    function getLastUpdated() external view returns (uint) {
        return lastUpdated;
    }
    
    /**
     * @dev Gets all weather data at once
     * @return All current weather measurements and last updated timestamp
     */
    function getAllWeatherData() external view returns (
        int, uint, uint, uint, uint, uint
    ) {
        return (
            temperature,
            rainfall24h,
            rainfall30d,
            daysWithoutRain,
            windSpeed,
            lastUpdated
        );
    }
}