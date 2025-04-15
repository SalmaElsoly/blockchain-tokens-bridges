import {
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Keypair,
  Horizon,
  Account,
} from "@stellar/stellar-sdk";

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
    console.log("Transaction successful!", result.hash);
  } catch (e: any) {
    if (e.response?.data?.extras?.result_codes) {
      console.error(
        "Transaction failed with Stellar result codes:",
        e.response.data.extras.result_codes
      );
    } else {
      console.error("Unknown error:", e);
    }
  }
}

async function main() {
    const { server, account } = await connectToStellar();
    const destinationAccount =
        "GDQYZBWGNVT2VJLVXJP32YOBTULUTZDAMSJYKTPDOHVRCIRB4SXORMZU";
    const amount = 20;
    const asset = new Asset(
      "SOLA",
      "GD3T6HSKD4AH2ZE2PYMJK6CWKDFSRC35C4J2ZH3FBUVVRN454FJALNPS"
    );
    transferTokenOnStellar(server, account, destinationAccount, asset, amount);
}

main();