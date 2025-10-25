# dock402

<img width="1500" height="500" alt="image" src="https://github.com/user-attachments/assets/5571b9e8-df61-4809-a698-b34b7cecf600" />

*Multi-chain x402 payment infrastructure for decentralized applications*

dock402 delivers production-ready payment processing capabilities built for the x402 protocol across multiple blockchain networks. This SDK enables developers to integrate sophisticated microtransaction functionality into web applications, supporting automated payment flows that scale with blockchain-native performance characteristics.

## Overview

The dock402 SDK provides comprehensive tooling for implementing payment-gated resources using x402's multi-chain infrastructure. Applications can leverage automated transaction processing across Base, Solana, Polygon, BSC, Sei, and Peaq networks with multi-wallet compatibility and enterprise-grade security features.

**Core Capabilities:**
- Multi-chain support (Base, Solana, Polygon, BSC, Sei, Peaq)
- Automated payment interception and processing
- Universal wallet adapter compatibility (MetaMask, Phantom, Rabby, WalletConnect)
- Type-safe TypeScript implementation with comprehensive validation
- Framework-agnostic architecture supporting major web frameworks
- Production-optimized performance with sub-second transaction finality
- Comprehensive audit trails and compliance logging

## Setup

Add dock402 to your project using your preferred package manager:

```bash
npm install dock402-x402-sdk
# or
yarn add dock402-x402-sdk  
# or
pnpm add dock402-x402-sdk
```

## Implementation Guide

### Client-Side Integration

Implement automatic payment handling in browser environments:

```typescript
import { createX402Client } from 'dock402-x402-sdk/client';
import { useAccount } from 'wagmi';

export function usePaymentClient() {
  const { address, signTransaction } = useAccount();

  const client = createX402Client({
    wallet: { 
      address: address, 
      signTransaction 
    },
    network: 'base', // or 'solana', 'polygon', 'bsc', 'sei', 'peaq'
    maxAmount: BigInt(50_000_000_000_000_000_000n), // Safety limit
  });

  const requestPaidResource = async (endpoint: string, options?: RequestInit) => {
    return await client.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  };

  return { requestPaidResource };
}
```

### Server-Side Configuration

Configure payment verification and settlement on your backend:

```typescript
import { X402PaymentProcessor } from 'dock402-x402-sdk/server';
import { Request, Response } from 'express';

const processor = new X402PaymentProcessor({
  network: 'base', // or 'solana', 'polygon', etc.
  treasuryWallet: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorEndpoint: process.env.FACILITATOR_ENDPOINT!,
});

export async function handlePaymentGatedEndpoint(req: Request, res: Response) {
  const incomingPayment = processor.extractPayment(req.headers);
  
  const paymentSpec = await processor.createPaymentRequirements({
    price: {
      amount: "10000000000000000", // 0.01 ETH on Base
      asset: {
        address: "0x0000000000000000000000000000000000000000" // Native token
      }
    },
    network: 'base',
    config: {
      description: 'API Access Fee',
      resource: req.url,
    }
  });
  
  if (!incomingPayment) {
    const paymentRequest = processor.createPaymentRequest(paymentSpec);
    return res.status(402).json(paymentRequest);
  }

  const verified = await processor.verifyPayment(incomingPayment, paymentSpec);
  if (!verified) {
    return res.status(402).json({ error: 'Invalid payment' });
  }

  // Execute protected business logic
  const result = await processProtectedOperation(req.body);
  
  // Complete payment settlement
  await processor.settlePayment(incomingPayment, paymentSpec);
  
  res.json({ data: result });
}
```

## Project Structure

```
dock402/
├── client/
│   ├── payment-interceptor.ts    # Automatic payment detection
│   ├── transaction-builder.ts    # Multi-chain transaction assembly
│   └── wallet-adapter.ts        # Universal wallet interface
├── server/  
│   ├── payment-processor.ts     # Payment validation engine
│   ├── facilitator-client.ts    # Network communication layer
│   └── middleware.ts           # Framework integration utilities  
├── types/
│   ├── x402-protocol.ts        # x402 protocol definitions
│   ├── evm-payment.ts          # EVM chain types
│   └── solana-payment.ts       # Solana-specific types
└── utils/
    ├── crypto.ts              # Cryptographic operations
    ├── validation.ts          # Input sanitization
    └── conversion.ts          # Currency formatting
```

## Configuration Reference

### Runtime Environment

Configure your application environment with the required variables:

```bash
# Network Settings
NEXT_PUBLIC_X402_NETWORK=base
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.base.org

# Payment Processing
TREASURY_WALLET_ADDRESS=your_treasury_address
FACILITATOR_ENDPOINT=https://api.dock402.com/facilitator

# Application Config  
NEXT_PUBLIC_BASE_URL=https://your-application.com
X402_MAX_PAYMENT_AMOUNT=50000000000000000000
```

## Supported Networks

dock402 supports the following blockchain networks:

| Network | Native Token | Transaction Speed | Avg. Cost |
|---------|--------------|-------------------|-----------|
| Base | ETH | ~2 seconds | < $0.01 |
| Solana | SOL | < 1 second | < $0.001 |
| Polygon | MATIC | ~2 seconds | < $0.01 |
| BSC | BNB | ~3 seconds | ~$0.10 |
| Sei | SEI | ~1 second | < $0.01 |
| Peaq | PEAQ | ~2 seconds | < $0.01 |

## Security Implementation

**Cryptographic Security:**
- End-to-end encryption for all payment communications
- Non-custodial architecture - applications never control user funds  
- Complete audit logging for regulatory compliance requirements
- Built-in rate limiting and abuse prevention mechanisms
- Cryptographic signature verification for payment authenticity

## Wallet Compatibility Matrix

| Provider | EVM Chains | Solana | Special Features |
|----------|-----------|---------|------------------|
| MetaMask | ✓ | ✗ | Mobile support, auto-approval |
| Phantom | ✗ | ✓ | Solana-native, mobile support |
| Rabby | ✓ | ✗ | Multi-chain support |
| WalletConnect | ✓ | ✓ | Universal protocol |
| Coinbase Wallet | ✓ | ✗ | Multi-chain support |

## Quality Assurance

### Test Suite Execution

```bash
npm run test              # Complete unit test coverage
npm run test:integration  # End-to-end integration testing  
npm run test:e2e          # Full payment flow validation
```

## Framework Integration

Compatible with modern web development stacks:

**Frontend Frameworks:** Next.js, React, Vue.js, Svelte, Angular
**Backend Systems:** Express.js, Fastify, NestJS, Koa.js  
**Runtime Environments:** Node.js, Edge Runtime, Serverless, Cloudflare Workers
**Blockchain Integration:** Multi-chain dApp compatibility

## Use Case Applications

Target applications for dock402 implementation:

**Automated Commerce:** IoT device micropayments for sensor data transmission
**AI Services:** Autonomous agent resource consumption and service billing
**Infrastructure Billing:** Granular pay-per-use API and compute resource pricing
**Media Distribution:** Per-consumption content access and streaming payments  
**Service Metering:** Usage-based billing models for SaaS applications
**Cross-chain Payments:** Unified payment interface across multiple blockchains

## Development Workflow

```bash
git clone https://github.com/dock402/dock402
cd dock402
pnpm install
pnpm build  
pnpm test
```

## License

MIT License - see LICENSE file for details

## Community Resources

**Documentation:** [docs.dock402.com](https://dock402.com/docs)
**GitHub:** [github.com/dock402/dock402](https://github.com/dock402/dock402)
**Twitter:** [@dock402](https://x.com/dock402)
**Website:** [dock402.com](https://dock402.com)

---

*dock402: The App Store for x402*
