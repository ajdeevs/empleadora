# Wallet Adapter Implementation

This document describes the MetaMask wallet adapter implementation for the Empleadora freelance platform.

## Overview

The wallet adapter allows clients to connect their MetaMask wallet and fund project milestones directly on the blockchain, eliminating the need for server-side wallet management.

## Features

- **MetaMask Integration**: Connect to MetaMask wallet
- **Client-Side Transactions**: All blockchain transactions happen on the client side
- **Real-time Balance**: Display wallet balance in real-time
- **Transaction Status**: Show transaction progress and confirmation
- **Security**: Only project clients can fund their own milestones

## Components

### 1. WalletAdapter.tsx

The main wallet context provider that manages:

- Wallet connection state
- MetaMask integration
- Transaction signing
- Balance checking

### 2. ClientFundingModal.tsx

A modal component for funding project milestones that:

- Shows project and milestone details
- Displays wallet status and balance
- Handles milestone funding transactions
- Updates backend after successful funding

### 3. WalletConnectButton.tsx

A reusable button component for connecting/disconnecting wallets.

## How to Use

### 1. Connect Wallet

```tsx
import { WalletConnectButton } from "@/components/shared/WalletAdapter";

// In your component
<WalletConnectButton />;
```

### 2. Use Wallet Context

```tsx
import { useWallet } from "@/components/shared/WalletAdapter";

const MyComponent = () => {
  const { isConnected, address, connect, getBalance } = useWallet();

  // Use wallet functions
};
```

### 3. Fund a Project

```tsx
import { ClientFundingModal } from "@/components/shared/ClientFundingModal";

<ClientFundingModal
  project={projectData}
  onFundingComplete={() => {
    // Refresh data after funding
  }}
/>;
```

## Setup Requirements

### Frontend Dependencies

```bash
npm install ethers
```

### Backend Endpoints

The following endpoints are required:

1. `GET /admin/contract-info` - Returns contract address and network info
2. `PUT /milestones/:id/mark-funded` - Updates milestone funding status

### Environment Variables

Make sure these are set in your backend `.env`:

```
CONTRACT_ADDRESS=your_deployed_contract_address
RPC_URL=your_avalanche_rpc_url
```

## Network Configuration

The wallet adapter is configured for **Avalanche Fuji Testnet**. Users should:

1. Add Avalanche Fuji Testnet to MetaMask:

   - Network Name: Avalanche Fuji C-Chain
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Currency Symbol: AVAX

2. Get test AVAX from the faucet: https://faucet.avax.network/

## Security Features

- **Client Verification**: Only the project client can fund milestones
- **Balance Checking**: Prevents transactions with insufficient funds
- **Transaction Validation**: Validates transaction parameters before sending
- **Error Handling**: Comprehensive error handling and user feedback

## Testing

Visit `/wallet-test` to test the wallet adapter functionality:

1. Connect your MetaMask wallet
2. Verify your address and balance are displayed
3. Go to Funding Management to test actual funding

## Troubleshooting

### Common Issues

1. **"MetaMask not found"**

   - Ensure MetaMask is installed and unlocked
   - Check if the site is allowed to connect

2. **"Insufficient balance"**

   - Get test AVAX from the faucet
   - Ensure you're on the correct network

3. **"Transaction failed"**
   - Check gas settings in MetaMask
   - Verify contract address is correct
   - Ensure you're the project client

### Debug Mode

Enable console logging to debug issues:

```tsx
// In WalletAdapter.tsx, uncomment console.log statements
console.log("Wallet connection:", { isConnected, address });
```

## Future Enhancements

- Support for multiple wallet providers (WalletConnect, etc.)
- Token-based funding (ERC-20 tokens)
- Batch funding for multiple milestones
- Transaction history and receipts
- Gas estimation and optimization
