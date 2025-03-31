# Deploying the Weather Insurance DApp

This guide provides detailed instructions for deploying the Weather Insurance DApp to various environments.

## Local Development Deployment

### 1. Start the Local Hardhat Node

Start a local Ethereum blockchain with pre-funded accounts:

```bash
npx hardhat node
```

Keep this terminal window open as it runs your local blockchain.

### 2. Deploy Smart Contracts

In a new terminal, deploy the contracts to your local blockchain:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

The script will output the addresses where your contracts are deployed. Note these addresses, especially the WeatherInsurance contract address.

### 3. Update Contract Address

Open `client/src/lib/contracts.ts` and update the `CONTRACT_ADDRESS` constant with your deployed WeatherInsurance contract address:

```typescript
// Contract address - will be updated after deployment
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed contract address
```

### 4. Start the Frontend Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Testnet Deployment (Sepolia)

### 1. Set Up Environment Variables

Create a `.env` file in the project root with your Ethereum wallet private key and an Infura or Alchemy API key:

```
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key_here
```

### 2. Update Hardhat Configuration

Ensure your `hardhat.config.js` includes the Sepolia network configuration:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
};
```

### 3. Fund Your Wallet

Ensure your wallet has enough Sepolia ETH for deployment. You can get testnet ETH from a Sepolia faucet.

### 4. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Note the deployed contract addresses from the console output.

### 5. Update Contract Address

Update `client/src/lib/contracts.ts` with the Sepolia contract address.

### 6. Update Frontend Configuration

Ensure your frontend is configured to connect to Sepolia by updating any network-specific code.

### 7. Build and Deploy Frontend

Build your React application:

```bash
npm run build
```

Deploy the built files to your hosting service of choice (Netlify, Vercel, etc.).

## Mainnet Deployment

### 1. Prepare Environment Variables

Similar to testnet deployment, but use your mainnet credentials:

```
PRIVATE_KEY=your_mainnet_private_key
MAINNET_RPC_URL=your_mainnet_rpc_url
```

### 2. Update Hardhat Configuration

Add Mainnet configuration to your `hardhat.config.js`:

```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [PRIVATE_KEY],
  gasPrice: 50000000000, // 50 gwei
},
```

### 3. Audit Smart Contracts

Before deploying to mainnet:

1. Get your contracts audited by a professional security firm
2. Run extensive tests on testnets
3. Consider a bug bounty program

### 4. Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### 5. Verify Contracts on Etherscan

Verify your contract source code on Etherscan for transparency:

```bash
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS constructor_argument1 constructor_argument2
```

### 6. Update Frontend

Update the contract address and build the frontend for production:

```bash
npm run build
```

## Setting Up Oracle Data Feeds (For Production)

For a production deployment, replace the simulated WeatherOracle with Chainlink data feeds:

1. Create a Chainlink node or subscribe to an existing data provider
2. Update the WeatherInsurance contract to use Chainlink oracles
3. Test the integration thoroughly on a testnet before mainnet deployment

## Monitoring and Maintenance

After deployment:

1. Set up monitoring for your smart contracts
2. Monitor gas prices and transaction costs
3. Implement a system to update the oracle with current weather data
4. Create a emergency response plan for contract vulnerabilities

## Governance and Upgrades

Consider implementing:

1. A timelock mechanism for contract upgrades
2. A governance system for parameter changes
3. A transparent upgrade path for future improvements

## Troubleshooting

Common deployment issues:

- **Contract deployment fails**: Check gas price and limits
- **Frontend can't connect to contracts**: Verify contract addresses and ABI
- **MetaMask not connecting**: Ensure network configuration is correct
- **Transactions failing**: Check contract balance and function requirements