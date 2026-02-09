require("dotenv").config();
const { ethers } = require("ethers");

// 1. TARMOQ VA KONTRAKT SOZLAMALARI
const RPC_URL = "wss://polygon-mainnet.g.alchemy.com/v2/yn3DIQEeppmgiiX6vcdyh"; 
const EXECUTOR_CONTRACT = "0x83a47D3f73efb0e7De350e0a7Bb90B9CAd2e237d"; 
const MIN_VALUE = ethers.parseEther("1000"); // 1000 POL dan kattasini poylaydi

// KONTRAKT ABI
const ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "target", "type": "address"},
      {"internalType": "bytes", "name": "data", "type": "bytes"},
      {"internalType": "address", "name": "rewardToken", "type": "address"},
      {"internalType": "uint256", "name": "rewardAmount", "type": "uint256"}
    ],
    "name": "fastExecute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function start() {
    console.log("=== BOT ISHGA TUSHDI (POLYGON WSS) ===");
    
    const provider = new ethers.WebSocketProvider(RPC_URL);
    
    // PRIVATE KEYNI RENDER DASHBOARD'DAN O'QIYDI (KODDA KO'RINMAYDI)
    const privateKey = process.env.PRIVATE_KEY; 
    
    if (!privateKey) {
        console.error("XATO: Private Key topilmadi! Render Dashboard -> Environment bo'limiga PRIVATE_KEY qo'shing.");
        return;
    }

    // Hamyon va Kontraktni ulash
    const wallet = new ethers.Wallet(privateKey, provider);
    const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

    console.log(`Ishlayotgan hamyon: ${wallet.address}`);
    console.log(`Ulangan kontrakt: ${EXECUTOR_CONTRACT}`);
    
    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions) return;

            for (const tx of block.prefetchedTransactions) {
                // Katta tranzaksiya filtri
                if (tx && tx.value >= MIN_VALUE) {
                    console.log(`[!] Kit topildi: ${tx.hash} | Qiymat: ${ethers.formatEther(tx.value)} POL`);
                    
                    // 0.4% komissiya
                    const rewardAmount = (tx.value * 4n) / 1000n; 
                    const feeData = await provider.getFeeData();
                    
                    executor.fastExecute(
                        tx.to, 
                        tx.data || "0x", 
                        "0x0000000000000000000000000000000000000000", 
                        rewardAmount, 
                        {
                            gasLimit: 600000,
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 200n) / 100n,
                            maxFeePerGas: (feeData.maxFeePerGas * 150n) / 100n,
                        }
                    ).then(res => {
                        console.log(`[+] Muvaffaqiyatli! Hash: ${res.hash}`);
                    }).catch(e => {
                        console.log("[-] Tranzaksiya o'tmadi.");
                    });
                }
            }
        } catch (e) {
            console.error("Xato:", e.message);
        }
    });

    provider._websocket.on("close", () => {
        console.log("WSS ulanish uzildi. Qayta ulanmoqda...");
        setTimeout(start, 3000);
    });
}

start();
