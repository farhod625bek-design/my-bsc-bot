require("dotenv").config();
const { ethers } = require("ethers");

async function start() {
    console.log("=== [🚀 SUPERAGRESSIV REJIM] BOT ISHGA TUSHDI ===");

    const RPC_URL = process.env.RPC_URL;
    const EXECUTOR_CONTRACT = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    // Minimal o'lja: 1000 POL (taxminiy foyda: 4-5 POL)
    const MIN_VALUE = ethers.parseUnits("1000", "ether"); 

    // KONKRAKT BILAN ALOQA UCHUN ABI
    const ABI = [{
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
    }];

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

        console.log("Hamyon balansi: 60 POL. Skanerlash boshlandi...");

        provider.on("block", async (blockNumber) => {
            try {
                // Yangi blokni va uning ichidagi barcha tranzaksiyalarni olish
                const block = await provider.getBlock(blockNumber, true);
                if (!block || !block.transactions) return;

                for (const tx of block.prefetchedTransactions) {
                    // Agar tranzaksiya qiymati 1000 POLdan katta bo'lsa
                    if (tx && tx.value >= MIN_VALUE) {
                        console.log([!] Kit topildi: ${tx.hash} | Qiymat: ${ethers.formatEther(tx.value)} POL);
                        
                        const rewardAmount = (tx.value * 4n) / 1000n; // 0.4% foyda kutish
                        const feeData = await provider.getFeeData();
                        
                        // AGRESSIV GAZ SOZLAMALARI (Pora berish)
                        const gasSettings = {
                            gasLimit: 600000,
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 400n) / 100n, // 400% ustunlik
                            maxFeePerGas: (feeData.maxFeePerGas * 250n) / 100n,
                        };

                        // HUJUM BOSHLASH
                        executor.fastExecute(tx.to, tx.data || "0x", "0x0000000000000000000000000000000000000000", rewardAmount, gasSettings)
                        .then(res => console.log([✅] MUVAFFAQIYAT! Hash: ${res.hash}))
                        .catch(e => console.log("[-] Raqobatda boy berildi yoki yetarli foyda yo'q."));
                    }
                }
            } catch (err) {
                // Blokni o'qishda xato bo'lsa, davom etaveradi
            }
        });

    } catch (error) {
        console.error("Xato:", error.message);
        setTimeout(start, 5000); // Xato bo'lsa 5 sekunddan keyin qayta urinish
    }
}

start();
