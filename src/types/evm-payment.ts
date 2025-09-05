/**
 * EVM Chain Payment Types for x402
 * Supports: Base, Polygon, BSC, Sei, Peaq
 */

import { X402Network, X402PaymentSpec, X402PaymentProof } from './x402-protocol';

export type EVMNetwork = Extract<X402Network, 
  | 'base-mainnet' 
  | 'base-sepolia' 
  | 'polygon' 
  | 'bsc' 
  | 'sei' 
  | 'peaq'
>;

export interface EVMTransactionRequest {
  /** Recipient address */
  to: string;
  
  /** Transaction value (for native token transfers) */
  value?: string;
  
  /** Transaction data (for contract calls) */
  data?: string;
  
  /** Gas limit */
  gasLimit?: string;
  
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: string;
  
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: string;
  
  /** Chain ID */
  chainId: number;
}

export interface EVMPaymentPayload {
  /** x402 protocol version */
  x402Version: '1.0';
  
  /** Payment scheme */
  scheme: 'exact';
  
  /** EVM network */
  network: EVMNetwork;
  
  /** Token contract address (0x0 for native token) */
  asset: string;
  
  /** Amount in smallest unit (wei) */
  amount: string;
  
  /** Recipient address */
  recipient: string;
  
  /** Transaction request data */
  transaction: EVMTransactionRequest;
}

export interface EVMPaymentProof extends X402PaymentProof {
  /** EVM-specific fields */
  network: EVMNetwork;
  
  /** Block number */
  blockNumber: number;
  
  /** Transaction index in block */
  transactionIndex?: number;
  
  /** Gas used */
  gasUsed?: string;
  
  /** Effective gas price */
  effectiveGasPrice?: string;
}

/**
 * Create an EVM transaction request for x402 payment
 */
export function createEVMTransactionRequest(
  spec: X402PaymentSpec
): EVMTransactionRequest {
  const isNativeToken = !spec.price.asset || spec.price.asset.address === '0x0000000000000000000000000000000000000000';
  
  if (isNativeToken) {
    // Native token transfer (ETH, BNB, MATIC, etc.)
    return {
      to: spec.recipient.address,
      value: spec.price.amount,
      chainId: getChainId(spec.network as EVMNetwork),
    };
  } else {
    // ERC-20 token transfer
    const transferData = encodeERC20Transfer(
      spec.recipient.address,
      spec.price.amount
    );
    
    return {
      to: spec.price.asset!.address,
      data: transferData,
      chainId: getChainId(spec.network as EVMNetwork),
    };
  }
}

/**
 * Encode ERC-20 transfer function call
 */
function encodeERC20Transfer(to: string, amount: string): string {
  // transfer(address,uint256)
  const functionSelector = '0xa9059cbb';
  const paddedAddress = to.slice(2).padStart(64, '0');
  const paddedAmount = BigInt(amount).toString(16).padStart(64, '0');
  
  return `${functionSelector}${paddedAddress}${paddedAmount}`;
}

/**
 * Get chain ID for EVM network
 */
function getChainId(network: EVMNetwork): number {
  const chainIds: Record<EVMNetwork, number> = {
    'base-mainnet': 8453,
    'base-sepolia': 84532,
    'polygon': 137,
    'bsc': 56,
    'sei': 1329,
    'peaq': 3338,
  };
  
  return chainIds[network];
}

/**
 * Verify EVM payment proof
 */
export async function verifyEVMPayment(
  proof: EVMPaymentProof,
  spec: X402PaymentSpec,
  rpcUrl: string
): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Fetch the transaction receipt from the blockchain
    // 2. Verify the transaction was successful
    // 3. Verify the recipient matches
    // 4. Verify the amount matches
    // 5. Verify the token contract (if applicable)
    
    // For now, just basic validation
    return (
      proof.to.toLowerCase() === spec.recipient.address.toLowerCase() &&
      proof.amount === spec.price.amount &&
      proof.network === spec.network &&
      !!proof.txHash
    );
  } catch (error) {
    console.error('EVM payment verification failed:', error);
    return false;
  }
}
