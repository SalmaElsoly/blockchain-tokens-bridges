import init,{ defaultConfig, connect, ReceiveAmount, PayAmount } from "@breeztech/breez-sdk-liquid";
import { generateMnemonic } from "bip39";
import path from "path";

async function connectToBreez(mnemonic?: string, walletName: string = "wallet") {
    await init
    const config = defaultConfig('testnet', 'MIIBdjCCASigAwIBAgIHPgGdrU+duTAFBgMrZXAwEDEOMAwGA1UEAxMFQnJlZXowHhcNMjUwNDIyMTE0ODQ4WhcNMzUwNDIwMTE0ODQ4WjAtMRQwEgYDVQQKEwtDb2Rlc2NhbGVyczEVMBMGA1UEAxMMU2FsbWEgRWxzb2x5MCowBQYDK2VwAyEA0IP1y98gPByiIMoph1P0G6cctLb864rNXw1LRLOpXXejgYMwgYAwDgYDVR0PAQH/BAQDAgWgMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNo5o+5ea0sNMlW/75VgGJCv2AcJMB8GA1UdIwQYMBaAFN6q1pJW843ndJIW/Ey2ILJrKJhrMCAGA1UdEQQZMBeBFXNhbG1hZWxzb2x5QGdtYWlsLmNvbTAFBgMrZXADQQAUKSbmFuyov/xqmWKBkxybvGGewj2yjo5rl/FMO4wYoEIusedUGtTH1jcZd12DogsWddKn8+gkuMDUwC+b9oIM');
    config.workingDir = path.join(__dirname, walletName);
    const sdk = await connect({ mnemonic: mnemonic !== undefined ? mnemonic : generateMnemonic(), config });
    return sdk;
}

async function main() {
    const firstWallet = await connectToBreez(undefined, "firstWallet");
    const secondWallet = await connectToBreez(undefined, "secondWallet");

    const currentLimits = await firstWallet.fetchLightningLimits();
    console.log(`Minimum amount, in sats: ${currentLimits.receive.minSat}`);
    console.log(`Maximum amount, in sats: ${currentLimits.receive.maxSat}`);

    const optionalRecieveAmount: ReceiveAmount = {
      type: "bitcoin",
      payerAmountSat: 10,
    };

    const prepareRecieveResponse = await firstWallet.prepareReceivePayment({
      paymentMethod: "lightning",
      amount: optionalRecieveAmount,
    });
    console.log(`Invoice: ${prepareRecieveResponse}`);

    const receiveFeesSat = prepareRecieveResponse.feesSat;
    console.log(`Fees: ${receiveFeesSat} sats`);

    const optionalDescription = "<description>";
    const res = await firstWallet.receivePayment({
      prepareResponse: prepareRecieveResponse,
      description: optionalDescription,
    });

    const destination = res.destination;


    const optionalSendAmount: PayAmount = {
      type: "bitcoin",
      receiverAmountSat: 10,
    };

    
    const prepareSendResponse = await secondWallet.prepareSendPayment({
      destination: destination,
      amount: optionalSendAmount,
    });

    const sendFeesSat = prepareSendResponse.feesSat;
    console.log(`Fees: ${sendFeesSat} sats`);

    const sendResponse = await secondWallet.sendPayment({
      prepareResponse: prepareSendResponse,
    });
    const payment = sendResponse.payment;
}

main();