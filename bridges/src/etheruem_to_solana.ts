import { ethers } from "ethers";
import { BrowserProvider } from "ethers";

import{Rpc, RpcSubscriptions, createSolanaRpc, createSolanaRpcSubscriptions} from "@solana/kit";


function connectToEthereum(): Promise<ethers.Signer> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();
    return signer;
}

function connectToSolana():  {
    
}

