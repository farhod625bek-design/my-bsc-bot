require("dotenv").config();
const { ethers } = require("ethers");

// 1. SOZLAMALAR
const RPC_URL = "https://polygon-rpc.com/"; 
const EXECUTOR_CONTRACT = "0x68A7516D9d28FA59e43FD7dFb04c84ccab5E0e00";
const MIN_VALUE = ethers.parseEther("1000"); // 1000 POL

const ABI = [
    "function fastExecute(address target, bytes data, address rewardToken, uint256 rewardAmount) payable public"
];

async function start() {
    console.log("=== BOT ISHGA TUSHDI ===");
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // .env faylidan o'qiydi
    const privateKey = "0x9c626fee6d5f7b16ca4ef327b474a436aca6d7812049e6e6f2d1517b88b47a7a"
    if (!privateKey) {
        console.error("A!");
        return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

    console.log(`Hamyon: ${wallet.address}`);

    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.transactions) return;

            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                
                if (tx && tx.value >= MIN_VALUE) {
                    console.log(`[!] Kit topildi: ${tx.hash} | Qiymat: ${ethers.formatEther(tx.value)} POL`);
                    
                    const feeData = await provider.getFeeData();
                    
                    executor.fastExecute(tx.to, tx.data || "0x", ethers.ZeroAddress, 0, {
                        gasLimit: 800000,
                        maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 200n) / 100n,
                        maxFeePerGas: feeData.maxFeePerGas,
                    }).then(res => {
                        console.log(`[+] Muvaffaqiyatli! Hash: ${res.hash}`);
                    }).catch(e => {
                        console.log("[-] Tranzaksiya rad etildi.");
                    });
                }
            }
        } catch (e) {
            console.error("Xato:", e.message);
        }
    });
}

start();
