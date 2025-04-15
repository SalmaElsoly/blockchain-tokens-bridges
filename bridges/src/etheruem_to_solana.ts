import { ethers } from "ethers";


import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Keypair,
  ParsedAccountData,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import * as fs from "fs";

async function getNumberDecimals(
  mintAddress: PublicKey,
  connection: Connection
): Promise<number> {
  const info = await connection.getParsedAccountInfo(mintAddress);
  const decimals = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  console.log(`Token Decimals: ${decimals}`);
  return decimals;
}

function initializeKeypair(): Keypair {
  const privateKey = Uint8Array.from(
    JSON.parse(
      fs.readFileSync(
        "../tokens/solana/EHrHLVBC6Mi4pAjFubsuqgnyBoc73GF3cwqUSApSnmgV.json",
        "utf8"
      )
    )
  );
  const keypair = Keypair.fromSecretKey(privateKey);
  console.log(
    `Initialized Keypair: Public Key - ${keypair.publicKey.toString()}`
  );
  return keypair;
}

function initializeConnection(): Connection {
  const rpcUrl = "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: rpcUrl.replace("http", "ws"),
  });
  
  console.log(`Initialized Connection to Solana RPC: ${rpcUrl.slice(0, -32)}`);
  return connection;
}

function connectToEthereum(): Promise<ethers.Signer> {
  const provider = new ethers.WebSocketProvider(
    "wss://ethereum-sepolia-rpc.publicnode.com"
  );
  const signer = new ethers.Wallet(
    "620e0792ed252ea1a26f3dbcb377e9a5a343b64ae5cd348f2c0a430b585d5676",
    provider
  );
  return Promise.resolve(signer);
}

async function transferTokenOnSolana(
  connection: Connection,
  keypair: Keypair,
  recipientAddress: string,
  mintAddress: string,
  amount: number
): Promise<void> {
  const mint = new PublicKey(mintAddress);
  const recipient = new PublicKey(recipientAddress);

  let senderAssociatedTokenAddress;
  try {
    senderAssociatedTokenAddress = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
      false,
      "confirmed",
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  } catch (error) {
    console.error("Error creating sender associated token account:", error);
    return;
  }

  const recipientAssociatedTokenAddress =
    await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      recipient,
      false,
      "confirmed",
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

  const decimals = await getNumberDecimals(mint, connection);
  
  //from human readable to solana readable
  const perciseAmount = Math.floor(amount * Math.pow(10, decimals));
  const transferTransaction = createTransferInstruction(
    // Those addresses are the Associated Token Accounts belonging to the sender and receiver
    senderAssociatedTokenAddress.address,
    recipientAssociatedTokenAddress.address,
    keypair.publicKey,
    perciseAmount,
    [],
    TOKEN_2022_PROGRAM_ID
  );
  let latestBlockhash = await connection.getLatestBlockhash("confirmed");

  const priorityRate = 100; // 1 SOL = 1,000,000 microLamports

  const priorityFeeInstructions = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityRate,
  });

  const messageV0 = new TransactionMessage({
    payerKey: keypair.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [priorityFeeInstructions, transferTransaction],
  }).compileToV0Message();
  const versionedTransaction = new VersionedTransaction(messageV0);
  versionedTransaction.sign([keypair]);

  try {
    const txid = await connection.sendTransaction(versionedTransaction, {
      maxRetries: 20,
    });
    console.log(`Transaction Submitted: ${txid}`);

    const confirmation = await connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );
    if (confirmation.value.err) {
      throw new Error("🚨Transaction not confirmed.");
    }
    console.log(
      `Transaction Successfully Confirmed! 🎉 View on Solana Explorer https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );
  } catch (error) {
    console.error("Transaction failed", error);
  }
}

async function main() {
  const ethSigner = await connectToEthereum();
  const connection = initializeConnection();
  const fromKeypair = initializeKeypair();
  const mint = new PublicKey("mntsVuyDsJYihCuq7ehHALLNxPzaeEzwyfh1ie6YMje");

  const contractAddress = "0x040aF936d9b44B9B00eD7b931e150A3aFEF57F9f";
  const contractABI = [
    "event TokensLocked(address indexed user, uint256 amount, string destinationChain, string recipient)",
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, ethSigner);

  contract.on(
    "TokensLocked",
    async (user, amount, destinationChain, recipient) => {
     
      amount = Number(amount) / Math.pow(10, 18);
      console.log(
        `Tokens Locked: User - ${user}, Amount - ${amount}, Destination Chain - ${destinationChain}, Recipient - ${recipient}`
      );

      if (destinationChain === "solana") {
        await transferTokenOnSolana(
          connection,
          fromKeypair,
          recipient,
          "mntsVuyDsJYihCuq7ehHALLNxPzaeEzwyfh1ie6YMje",
          Number(amount)
        );
      }
    }
  );
}

main();
