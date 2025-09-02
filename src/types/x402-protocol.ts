/**
 * x402 Protocol Types for Dock402
 * Multi-chain HTTP 402 Payment Required implementation
 * Supports: Base, Solana, Polygon, BSC, Sei, Peaq
 */

export type X402Network = 
  | 'base-mainnet'
  | 'base-sepolia'
  | 'solana-mainnet'
  | 'solana-devnet'
  | 'polygon'
  | 'bsc'
  | 'sei'
  | 'peaq';

export interface X402PaymentSpec {
  /** Protocol version */
  version: '1.0';
  
  /** Payment scheme - 'exact' for fixed amounts */
  scheme: 'exact' | 'max';
  
  /** Blockchain network */
  network: X402Network;
  
  /** Payment details */
  price: {
    /** Amount in smallest unit (wei, lamports, etc.) */
    amount: string;
    
    /** Token/currency */
    currency: 'USDC' | 'SOL' | 'ETH' | 'BNB' | 'MATIC' | 'SEI' | 'PEAQ';
    
    /** Token contract address (if applicable) */
    asset?: {
      address: string;
    };
  };
  
  /** Payment recipient */
  recipient: {
    address: string;
  };
  
  /** Resource being paid for */
  resource: {
    uri: string;
    description?: string;
  };
  
  /** Optional metadata */
  metadata?: {
    [key: string]: any;
  };
}

export interface X402PaymentProof {
  /** Transaction hash/signature */
  txHash: string;
  
  /** Blockchain network */
  network: X402Network;
  
  /** Payment sender address */
  from: string;
  
  /** Payment recipient address */
  to: string;
  
  /** Amount paid */
  amount: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Optional: Block number/slot */
  blockNumber?: number;
}

export interface X402PaymentRequest {
  /** HTTP status code */
  status: 402;
  
  /** Payment specification */
  payment: X402PaymentSpec;
  
  /** Human-readable message */
  message: string;
  
  /** Optional: Alternative payment methods */
  alternatives?: X402PaymentSpec[];
}

export interface X402PaymentResponse {
  /** Success status */
  success: boolean;
  
  /** Payment proof */
  proof: X402PaymentProof;
  
  /** Response data */
  data?: any;
  
  /** Optional: Receipt URL */
  receipt?: string;
}

export interface X402ServiceInfo {
  /** Service identifier */
  id: string;
  
  /** Service name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Endpoint URL */
  endpoint: string;
  
  /** Pricing information */
  pricing: {
    /** Price per request */
    perRequest: string;
    
    /** Supported currencies */
    currencies: string[];
    
    /** Supported networks */
    networks: X402Network[];
  };
  
  /** Service category */
  category: string;
  
  /** Service status */
  status: 'online' | 'offline' | 'maintenance';
}

/** x402 Headers for payment flow */
export const X402_HEADERS = {
  /** Payment specification header */
  PAYMENT_SPEC: 'X-402-Payment-Spec',
  
  /** Payment proof header */
  PAYMENT_PROOF: 'X-402-Payment-Proof',
  
  /** Protocol version header */
  VERSION: 'X-402-Version',
  
  /** Network header */
  NETWORK: 'X-402-Network',
} as const;

/** Supported chain IDs */
export const CHAIN_IDS = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  POLYGON: 137,
  BSC: 56,
  BSC_TESTNET: 97,
  SEI: 1329,
  PEAQ: 3338,
} as const;

/** USDC contract addresses by network */
export const USDC_ADDRESSES = {
  'base-mainnet': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'polygon': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  'bsc': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  'solana-mainnet': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'solana-devnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
} as const;
