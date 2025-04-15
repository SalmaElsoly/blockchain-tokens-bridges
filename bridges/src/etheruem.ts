import { ethers } from "ethers";

async function connectToEthereum(): Promise<ethers.Signer> {
  const provider = new ethers.WebSocketProvider(
    "wss://ethereum-sepolia-rpc.publicnode.com"
  );
  const signer = new ethers.Wallet(
    "620e0792ed252ea1a26f3dbcb377e9a5a343b64ae5cd348f2c0a430b585d5676",
    provider
  );
  return Promise.resolve(signer);
}

async function lockTokens() {
  const contractAddress = "0x040aF936d9b44B9B00eD7b931e150A3aFEF57F9f";
  const contractABI = [
    "function lockTokens(uint amount, string memory destinationChain, string memory recipient) public",
    "event TokensLocked(address indexed user, uint256 amount, string destinationChain, string recipient)",
  ];
  const signer = await connectToEthereum();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const amount = 20;
  const destinationChain = "stellar";
  const recipient = "GDQYZBWGNVT2VJLVXJP32YOBTULUTZDAMSJYKTPDOHVRCIRB4SXORMZU";

  try {
    const tx = await contract.lockTokens(amount, destinationChain, recipient);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed!");
  } catch (err) {
    console.error("Contract call failed:", err);
  }
}

lockTokens();