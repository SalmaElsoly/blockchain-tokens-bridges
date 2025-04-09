import { ethers } from "ethers";
import {
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Keypair,
  Horizon,
  Account,
} from "@stellar/stellar-sdk";

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

async function connectToStellar(): Promise<{
  server: Horizon.Server;
  account: any;
}> {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const account = await server.loadAccount(
    "GBEA3YTRGDRM6CQNQ5UORIEO5H6IJ2WRXX2XJNOQYNGVMCSNKWOXHRR6"
  );
  return { server, account };
}

async function transferTokenOnStellar(
  server: Horizon.Server,
  sourceAccount: any,
  destinationAccount: string,
  asset: Asset,
  amount: number
): Promise<void> {
  //const perciseAmount = Math.floor(amount * Math.pow(10, 6));

  // const recipientAccount = await server.loadAccount(destinationAccount);
  // const recipientKeypair = Keypair.fromPublicKey(destinationAccount);
  // const trustTx = new TransactionBuilder(recipientAccount, {
  //   fee: "100000",
  //   networkPassphrase: Networks.TESTNET,
  // })
  //   .addOperation(
  //     Operation.changeTrust({
  //       asset: asset,
  //       limit: "1000000000",
  //     })
  //   )
  //   .setTimeout(60)
  //   .build();

  // trustTx.sign(recipientKeypair);
  // await server.submitTransaction(trustTx);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: "100000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destinationAccount,
        asset: asset,
        amount: amount.toString(),
      })
    )
    .setTimeout(60)
    .build();

  const distributionKey = Keypair.fromSecret(
    "SBLGLQAIHJO4YW2FRAIPQUNEUJKQVKY32LLUERT24JKSARDN4W56WZX3"
  );
  transaction.sign(distributionKey);
  try {
    const result = await server.submitTransaction(transaction);
    console.log("✅ Transaction successful!", result);
  } catch (e: any) {
    if (e.response?.data?.extras?.result_codes) {
      console.error(
        "❌ Transaction failed with Stellar result codes:",
        e.response.data.extras.result_codes
      );
    } else {
      console.error("❌ Unknown error:", e);
    }
  }
}

async function main() {
  const signer = await connectToEthereum();
  const { server, account } = await connectToStellar();
  console.log("Connected to Ethereum and Stellar");

  const solaContractAddress = "0x040aF936d9b44B9B00eD7b931e150A3aFEF57F9f";

  const contract = new ethers.Contract(
    solaContractAddress,
    [
      "event TokensLocked(address indexed user, uint256 amount, string destinationChain, string recipient)",
    ],
    signer
  );

  const customAsset = new Asset(
    "SOLA",
    "GD3T6HSKD4AH2ZE2PYMJK6CWKDFSRC35C4J2ZH3FBUVVRN454FJALNPS"
  );

  contract.on(
    "TokensLocked",
    async (user, amount, destinationChain, recipient) => {
      amount = Number(amount) / Math.pow(10, 18);
      console.log(
        `Tokens locked by ${user} for ${amount} on ${destinationChain} to ${recipient}`
      );
      const recipientStellar = await server.loadAccount(recipient);
      await transferTokenOnStellar(
        server,
        account,
        recipient,
        customAsset,
        amount
      );
    }
  );
}

main();
