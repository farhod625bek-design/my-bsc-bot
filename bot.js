const { ethers } = require("ethers");

async function start() {
    console.log("=== [🚀 AGRESSIV REJIM] BOT ISHGA TUSHDI ===");

    // Muhim ma'lumotlar (Environment variables)
    const RPC_URL = process.env.RPC_URL;
    const EXECUTOR_CONTRACT = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    // Minimal o'lja: 1000 POL
    const MIN_VALUE = ethers.parseEther("1000"); 

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
                const block = await provider.getBlock(blockNumber, true);
                if (!block) return;

                for (const tx of block.prefetchedTransactions) {
                    if (tx && tx.value >= MIN_VALUE) {
                        console.log([!] Kit topildi: ${tx.hash});
                        
                        const rewardAmount = (tx.value * 4n) / 1000n; 
                        const feeData = await provider.getFeeData();
                        
                        const gasSettings = {
                            gasLimit: 600000,
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 400n) / 100n,
                            maxFeePerGas: (feeData.maxFeePerGas * 250n) / 100n,
                        };

                        executor.fastExecute(tx.to, tx.data || "0x", "0x0000000000000000000000000000000000000000", rewardAmount, gasSettings)
                        .then(res => console.log([✅] MUVAFFAQIYAT! Hash: ${res.hash}))
                        .catch(e => console.log("[-] Rad etildi."));
                    }
                }
            } catch (err) {}
        });

    } catch (error) {
        console.error("Xato:", error.message);
    }
}

start();
