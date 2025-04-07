import {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";

import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { TransactionSigner,  } from "@solana/kit";

export type Client = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
    wallet: TransactionSigner or Messa
};

export function createClient(rpcUrl: String): Client {
    const rpc = createSolanaRpc(rpcUrl);
    const rpcSubscriptions = createSolanaRpcSubscriptions(rpcUrl);
    return { rpc, rpcSubscriptions };
}