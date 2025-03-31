# Weather Insurance DApp

A decentralized weather insurance platform on the Ethereum blockchain. This application allows users to purchase insurance policies against specific weather conditions and receive automatic payouts when those conditions are met, without any intermediaries.

## Features

- Purchase parametric weather insurance policies with Ethereum
- Real-time weather data monitoring
- Automated claims processing and payouts
- MetaMask wallet integration
- Smart contract-based policy management

## Technologies Used

- **Frontend:** React with TailwindCSS and ShadcnUI
- **Blockchain:** Ethereum (Hardhat for local development)
- **Smart Contracts:** Solidity
- **Web3 Integration:** ethers.js
- **Development Environment:** Hardhat, Node.js

## Prerequisites

- Node.js and npm
- MetaMask browser extension
- Basic understanding of Ethereum transactions

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/weather-insurance-dapp.git
cd weather-insurance-dapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start a local Hardhat node

In a separate terminal window, run:

```bash
npx hardhat node
```

This will start a local Ethereum blockchain with pre-funded test accounts.

### 4. Deploy the contracts

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Note the deployed contract addresses in the console output.

### 5. Update the contract address

Open `client/src/lib/contracts.ts` and update the `CONTRACT_ADDRESS` value with your deployed WeatherInsurance contract address.

### 6. Start the application

```bash
npm run dev
```

## Using the Application

### 1. Connect MetaMask

1. Make sure MetaMask is installed in your browser
2. Add the local Hardhat network to MetaMask (Network Name: Hardhat, RPC URL: http://127.0.0.1:8545, Chain ID: 31337)
3. Import one of the private keys from the Hardhat node output to access a pre-funded account
4. Click "Connect Wallet" in the application

### 2. Buy an Insurance Policy

1. Navigate to the "Buy Policy" page
2. Select a location for your policy
3. Choose the weather event type you want to insure against
4. Set the threshold for the weather event
5. Select your coverage amount and policy duration
6. Submit the form to create your policy (MetaMask will prompt you to confirm the transaction)

### 3. View Your Active Policies

1. Navigate to the "My Policies" page to view your active policies
2. See details like coverage amount, premium paid, policy duration, and current weather conditions

### 4. Process Claims

1. When the weather conditions meet your policy's criteria, you'll see a "Claim" button on the policy
2. Click "Claim" to process the payout (MetaMask will prompt you to confirm the transaction)
3. Once processed, the funds will be sent to your wallet automatically

### 5. Simulate Weather Changes (For Testing)

When running locally, you can simulate weather changes using the provided script:

```bash
# Update temperature to 35.5°C
ORACLE_ADDRESS=your_oracle_address npx hardhat run scripts/update-weather.js --network localhost temp 35.5

# Update rainfall to 50mm in 24h and 150mm in 30d
ORACLE_ADDRESS=your_oracle_address npx hardhat run scripts/update-weather.js --network localhost rain 50 150

# Update days without rain to 20 days
ORACLE_ADDRESS=your_oracle_address npx hardhat run scripts/update-weather.js --network localhost drought 20

# Update wind speed to 25.5 km/h
ORACLE_ADDRESS=your_oracle_address npx hardhat run scripts/update-weather.js --network localhost wind 25.5
```

## Smart Contract Overview

### WeatherOracle.sol

Simulates a weather data oracle that provides temperature, rainfall, drought, and wind speed data. In a production environment, this would be replaced with Chainlink data feeds or another decentralized oracle solution.

### WeatherInsurance.sol

The main insurance contract that handles policy creation, storage, and claims processing. It uses the WeatherOracle to get weather data and processes payouts when conditions are met.

## Testing

Run the test suite with:

```bash
npx hardhat test
```

## Deployment to a Public Network

To deploy to a public testnet (e.g., Sepolia), update your `hardhat.config.js` with your network settings and run:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Note: You'll need to fund your account with testnet ETH from a faucet for this to work.

## License

MIT

## Contributors

- Your Name - Initial work