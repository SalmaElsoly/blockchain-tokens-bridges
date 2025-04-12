import {
  Horizon,
} from "@stellar/stellar-sdk";

import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  ParsedAccountData,
  ComputeBudgetProgram,
  Keypair,
} from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import * as fs from "fs";

async function listenToStellarEvents(
  connection: Connection,
  keypair: Keypair,
  mintAddress: string
) {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const lastPayments = await server
    .payments()
    .forAccount("GDQYZBWGNVT2VJLVXJP32YOBTULUTZDAMSJYKTPDOHVRCIRB4SXORMZU")
    .order("desc")
    .limit(1)
    .call();

  const cursor =
    lastPayments.records.length > 0
      ? lastPayments.records[0].paging_token
          : "now";
    console.log("Last payment cursor:", cursor);
  const stream = server
    .payments()
    .forAccount("GDQYZBWGNVT2VJLVXJP32YOBTULUTZDAMSJYKTPDOHVRCIRB4SXORMZU")
    .cursor(cursor)
    .stream({
      onmessage: (payment) => {
        if (
          payment.type === "payment" &&
          payment.asset_type === "credit_alphanum4"
        ) {
          console.log(
            `Received Stellar Payment: From ${payment.from} To ${payment.to} Amount ${payment.amount} Asset ${payment.asset_code}`
          );
          const amount = parseFloat(payment.amount);
          transferTokenOnSolana(
            connection,
            keypair,
            "tst9WMxkhdZXSQJ7UoyUDEiUxTMzBSHhGYWXGfKgZwT",
            mintAddress,
            amount
          );
        }
      },
      onerror: (error) => {
        console.error("Error in Stellar stream:", error);
      },
    });
}

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
  // Redacting part of the RPC URL for security/log clarity
  console.log(`Initialized Connection to Solana RPC: ${rpcUrl.slice(0, -32)}`);
  return connection;
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

function main() {
  const connection = initializeConnection();
  const keypair = initializeKeypair();
  const mintAddress = "mntsVuyDsJYihCuq7ehHALLNxPzaeEzwyfh1ie6YMje";

  listenToStellarEvents(connection, keypair, mintAddress);
}

main();
