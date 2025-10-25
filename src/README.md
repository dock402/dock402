# @dock402/x402-sdk

Multi-chain x402 payment infrastructure for decentralized applications.

## Features

- ✅ **Multi-Chain**: Support for Base, Solana, Polygon, BSC, Sei, and Peaq
- ✅ **Client-side**: Automatic 402 payment handling with any wallet provider
- ✅ **Server-side**: Payment verification and settlement with facilitator
- ✅ **Framework agnostic**: Works with any wallet provider (MetaMask, Phantom, Rabby, etc.)
- ✅ **HTTP framework agnostic**: Works with Next.js, Express, Fastify, etc.
- ✅ **TypeScript**: Full type safety with comprehensive validation
- ✅ **EVM & Solana**: Built for both EVM chains and Solana

## Installation

```bash
npm install @dock402/x402-sdk
# or
yarn add @dock402/x402-sdk
# or
pnpm add @dock402/x402-sdk
```

### Dependencies

```bash
npm install ethers @solana/web3.js zod wagmi viem
```

## Quick Start

### Client Side (React/Frontend)

```typescript
import { createX402Client } from '@dock402/x402-sdk/client';
import { useAccount } from 'wagmi';

function MyComponent() {
  const { address, signTransaction } = useAccount();

  // Create x402 client
  const client = createX402Client({
    wallet: { address, signTransaction },
    network: 'base', // or 'solana', 'polygon', 'bsc', 'sei', 'peaq'
    maxPaymentAmount: BigInt('10000000000000000'), // Optional: max 0.01 ETH
  });

  // Make a paid request - automatically handles 402 payments
  const response = await client.fetch('/api/paid-endpoint', {
    method: 'POST',
    body: JSON.stringify({ data: 'your request' }),
  });

  const result = await response.json();
}
```

### Server Side (Next.js API Route)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from '@dock402/x402-sdk/server';

const x402 = new X402PaymentHandler({
  network: 'base',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: process.env.FACILITATOR_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  // 1. Extract payment header
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    const response = await x402.create402Response({
      amount: '10000000000000000',  // 0.01 ETH in wei
      description: 'API Request',
      resource: `${process.env.NEXT_PUBLIC_BASE_URL}/api/endpoint`,
    });
    return NextResponse.json(response.body, { status: response.status });
  }

  // 2. Create payment requirements (store this for verify/settle)
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: '10000000000000000',
    description: 'API Request',
    resource: `${process.env.NEXT_PUBLIC_BASE_URL}/api/endpoint`,
  });

  // 3. Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
  }

  // 4. Process your business logic
  const result = await yourBusinessLogic(req);

  // 5. Settle payment
  await x402.settlePayment(paymentHeader, paymentRequirements);

  // 6. Return response
  return NextResponse.json(result);
}
```

### Server Side (Express)

```typescript
import express from 'express';
import { X402PaymentHandler } from '@dock402/x402-sdk/server';

const app = express();
const x402 = new X402PaymentHandler({
  network: 'base',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: process.env.FACILITATOR_ENDPOINT!,
});

app.post('/api/paid-endpoint', async (req, res) => {
  // Extract payment
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    const response = await x402.create402Response({
      amount: '10000000000000000',
      description: 'API Request',
    });
    return res.status(response.status).json(response.body);
  }

  // Create payment requirements
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: '10000000000000000',
    description: 'API Request',
  });

  // Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return res.status(402).json({ error: 'Invalid payment' });
  }

  // Your business logic here
  const result = await yourBusinessLogic(req);

  // Settle payment
  await x402.settlePayment(paymentHeader, paymentRequirements);

  res.json(result);
});
```

## Supported Networks

| Network | Chain Type | Native Token | Status |
|---------|-----------|--------------|---------|
| Base | EVM (L2) | ETH | ✅ Live |
| Solana | Solana | SOL | 🔄 Coming Soon |
| Polygon | EVM (L2) | MATIC | 🔄 Coming Soon |
| BSC | EVM | BNB | 🔄 Coming Soon |
| Sei | EVM | SEI | 🔄 Coming Soon |
| Peaq | EVM | PEAQ | 🔄 Coming Soon |

## API Reference

### Client

#### `createX402Client(config)`

Creates a new x402 client instance.

**Config:**
```typescript
{
  wallet: WalletAdapter;              // Wallet with signTransaction method
  network: X402Network;                // 'base', 'solana', 'polygon', etc.
  rpcUrl?: string;                    // Optional custom RPC
  maxPaymentAmount?: bigint;          // Optional safety limit
}
```

**Methods:**
- `client.fetch(input, init)` - Make a fetch request with automatic payment handling

### Server

#### `new X402PaymentHandler(config)`

Creates a new payment handler instance.

**Config:**
```typescript
{
  network: X402Network;                // Network identifier
  treasuryAddress: string;            // Where payments are sent
  facilitatorUrl: string;             // Facilitator service URL
  rpcUrl?: string;                    // Optional custom RPC
}
```

**Methods:**
- `extractPayment(headers)` - Extract X-402-Payment-Proof header from request
- `createPaymentRequirements(options)` - Create payment requirements object
- `create402Response(options)` - Create 402 response body
- `verifyPayment(header, requirements)` - Verify payment with facilitator
- `settlePayment(header, requirements)` - Settle payment with facilitator

## Configuration

### Environment Variables

```bash
# Network
NEXT_PUBLIC_X402_NETWORK=base

# Treasury wallet address (where payments are sent)
TREASURY_WALLET_ADDRESS=your_treasury_address

# Facilitator endpoint
FACILITATOR_ENDPOINT=https://api.dock402.com/facilitator

# Optional: Custom RPC URLs
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Base URL for resource field
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Wallet Compatibility

### EVM Chains (Base, Polygon, BSC, Sei, Peaq)
- MetaMask
- Rabby Wallet
- Trust Wallet
- Coinbase Wallet
- WalletConnect
- Any EVM-compatible wallet

### Solana
- Phantom
- Solflare
- Backpack
- Any Solana wallet adapter

## Payment Amounts

Payment amounts are in the smallest unit of each chain:
- **EVM chains**: wei (18 decimals)
  - 1 ETH = 1,000,000,000,000,000,000 wei
  - 0.01 ETH = 10,000,000,000,000,000 wei
- **Solana**: lamports (9 decimals)
  - 1 SOL = 1,000,000,000 lamports
  - 0.01 SOL = 10,000,000 lamports

## Architecture

```
src/
├── client/                    # Client-side code
│   ├── transaction-builder.ts # Multi-chain transaction construction
│   ├── payment-interceptor.ts # 402 payment fetch interceptor
│   └── index.ts              # Main client export
├── server/                    # Server-side code
│   ├── facilitator-client.ts # Facilitator API communication
│   ├── payment-handler.ts    # Payment verification & settlement
│   └── index.ts              # Main server export
├── types/                     # TypeScript types
│   ├── x402-protocol.ts      # x402 protocol types
│   ├── evm-payment.ts        # EVM-specific types
│   ├── solana-payment.ts     # Solana-specific types
│   └── index.ts
├── utils/                     # Utilities
│   ├── helpers.ts            # Helper functions
│   └── index.ts
└── index.ts                   # Main package export
```

## Documentation

For full documentation, visit [docs.dock402.com](https://dock402.com/docs)

## Community

- Website: [dock402.com](https://dock402.com)
- Twitter: [@dock402](https://x.com/dock402)
- GitHub: [github.com/dock402](https://github.com/dock402)

## License

MIT - see LICENSE file for details
