import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory } from "ecpair";
import axios from "axios";

const ECPair = ECPairFactory(ecc);

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
async function transferOnBTC(amount: number) {
  
  const keypair = ECPair.fromWIF(
    "cRBbgtmQZjy32feGMQgvAKjRUiFPe98r3rxF1wzN5Q8gpwFtwRUi",
    bitcoin.networks.testnet
  );

  const sender = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(keypair.publicKey),
    network: bitcoin.networks.testnet,
  });

  const utxos = await axios.get(
    `https://blockstream.info/testnet/api/address/${sender.address}/utxo`
  );
  const selectedUtxo = utxos.data[0]; 

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });

  psbt.addInput({
    hash: selectedUtxo.txid,
    index: selectedUtxo.vout,
    witnessUtxo: {
      script: sender.output!,
      value: selectedUtxo.value,
    },
  });

  psbt.addOutput({
    address: "tb1qkkpk6rtlp3gtfjra9y8g887dr45qtda4svu4t7",
    value: 1000, 
  });

  
  const runeMessage = "rune:TRANSFER:SOLA:1"; 
  const data = Buffer.from(runeMessage, "utf-8");
  const embed = bitcoin.payments.embed({ data: [data] });

  psbt.addOutput({
    script: embed.output!,
    value: 0,
  });

  
 psbt.signInput(0, {
   sign: (hash) => keypair.sign(hash),
   publicKey: Buffer.from(keypair.publicKey), 
 } as bitcoin.Signer);
  
  psbt.finalizeAllInputs();
  const tx = psbt.extractTransaction().toHex();

  console.log("Raw TX:", tx);

  await axios.post("https://blockstream.info/testnet/api/tx", tx);
}
async function main() {
  const signer = await connectToEthereum();
  const contractAddress = "0x040aF936d9b44B9B00eD7b931e150A3aFEF57F9f";
  const contractABI = [
    "event TokensLocked(address indexed user, uint256 amount, string destinationChain, string recipient)",
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  contract.on(
    "TokensLocked",
    async (user, amount, destinationChain, recipient) => {
      amount = Number(amount) / Math.pow(10, 18);
      console.log(
        `Tokens Locked: User - ${user}, Amount - ${amount}, Destination Chain - ${destinationChain}, Recipient - ${recipient}`
      );

      if (destinationChain === "BTC") {
        transferOnBTC(amount);
      }
    }
  );
}
