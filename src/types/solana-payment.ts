/**
 * Solana Payment Types for x402
 * Supports: Solana Mainnet, Solana Devnet
 */

import { X402Network, X402PaymentSpec, X402PaymentProof } from './x402-protocol';

export type SolanaNetwork = Extract<X402Network, 
  | 'solana-mainnet' 
  | 'solana-devnet'
>;

export interface SolanaTransactionRequest {
  /** Recent blockhash */
  recentBlockhash: string;
  
  /** Fee payer public key */
  feePayer: string;
  
  /** Instructions */
  instructions: SolanaInstruction[];
  
  /** Compute budget (optional) */
  computeBudget?: {
    units?: number;
    microLamports?: number;
  };
}

export interface SolanaInstruction {
  /** Program ID */
  programId: string;
  
  /** Account keys */
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  
  /** Instruction data */
  data: Buffer | Uint8Array | number[];
}

export interface SolanaPaymentPayload {
  /** x402 protocol version */
  x402Version: '1.0';
  
  /** Payment scheme */
  scheme: 'exact';
  
  /** Solana network */
  network: SolanaNetwork;
  
  /** Token mint address (SOL = native) */
  mint: string;
  
  /** Amount in smallest unit (lamports for SOL, token decimals for SPL) */
  amount: string;
  
  /** Recipient address */
  recipient: string;
  
  /** Transaction request data */
  transaction: SolanaTransactionRequest;
}

export interface SolanaPaymentProof extends X402PaymentProof {
  /** Solana-specific fields */
  network: SolanaNetwork;
  
  /** Slot number */
  slot: number;
  
  /** Transaction signature */
  signature: string;
  
  /** Confirmation status */
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  
  /** Fee paid (lamports) */
  fee?: number;
}

/**
 * Create a Solana transaction request for x402 payment
 */
export function createSolanaTransactionRequest(
  spec: X402PaymentSpec,
  recentBlockhash: string,
  feePayer: string
): SolanaTransactionRequest {
  const isNativeSOL = !spec.price.asset || spec.price.asset.address === 'native';
  
  if (isNativeSOL) {
    // Native SOL transfer
    return {
      recentBlockhash,
      feePayer,
      instructions: [
        {
          programId: '11111111111111111111111111111111', // System Program
          keys: [
            { pubkey: feePayer, isSigner: true, isWritable: true },
            { pubkey: spec.recipient.address, isSigner: false, isWritable: true },
          ],
          data: encodeSOLTransfer(spec.price.amount),
        },
      ],
    };
  } else {
    // SPL Token transfer
    return {
      recentBlockhash,
      feePayer,
      instructions: [
        {
          programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
          keys: [
            { pubkey: getAssociatedTokenAddress(feePayer, spec.price.asset!.address), isSigner: false, isWritable: true },
            { pubkey: spec.price.asset!.address, isSigner: false, isWritable: false },
            { pubkey: getAssociatedTokenAddress(spec.recipient.address, spec.price.asset!.address), isSigner: false, isWritable: true },
            { pubkey: feePayer, isSigner: true, isWritable: false },
          ],
          data: encodeSPLTokenTransfer(spec.price.amount),
        },
      ],
    };
  }
}

/**
 * Encode SOL transfer instruction
 */
function encodeSOLTransfer(amount: string): number[] {
  const instruction = 2; // Transfer instruction
  const lamports = BigInt(amount);
  
  // Simple encoding: [instruction, ...lamports as 8 bytes]
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);
  view.setUint32(0, instruction, true);
  view.setBigUint64(4, lamports, true);
  
  return Array.from(new Uint8Array(buffer));
}

/**
 * Encode SPL Token transfer instruction
 */
function encodeSPLTokenTransfer(amount: string): number[] {
  const instruction = 3; // Transfer instruction for SPL Token
  const tokenAmount = BigInt(amount);
  
  // Simple encoding: [instruction, ...amount as 8 bytes]
  const buffer = new ArrayBuffer(9);
  const view = new DataView(buffer);
  view.setUint8(0, instruction);
  view.setBigUint64(1, tokenAmount, true);
  
  return Array.from(new Uint8Array(buffer));
}

/**
 * Get associated token address (simplified)
 * In production, use @solana/spl-token's getAssociatedTokenAddress
 */
function getAssociatedTokenAddress(owner: string, mint: string): string {
  // This is a placeholder - in production, properly derive the ATA
  return `${owner}_${mint}_ata`;
}

/**
 * Verify Solana payment proof
 */
export async function verifySolanaPayment(
  proof: SolanaPaymentProof,
  spec: X402PaymentSpec,
  rpcUrl: string
): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Fetch the transaction from Solana RPC
    // 2. Verify the transaction was successful
    // 3. Verify the recipient matches
    // 4. Verify the amount matches
    // 5. Verify the token mint (if applicable)
    // 6. Check confirmation status is 'finalized'
    
    // For now, just basic validation
    return (
      proof.to.toLowerCase() === spec.recipient.address.toLowerCase() &&
      proof.amount === spec.price.amount &&
      proof.network === spec.network &&
      !!proof.signature &&
      proof.confirmationStatus === 'finalized'
    );
  } catch (error) {
    console.error('Solana payment verification failed:', error);
    return false;
  }
}

/**
 * Get Solana RPC endpoint
 */
export function getSolanaRPC(network: SolanaNetwork): string {
  const endpoints: Record<SolanaNetwork, string> = {
    'solana-mainnet': 'https://api.mainnet-beta.solana.com',
    'solana-devnet': 'https://api.devnet.solana.com',
  };
  
  return endpoints[network];
}
