require("dotenv").config();
const { ethers } = require("ethers");

/**
 * 🚀 SUPER-YIRTQICH REJIMIDAGI POLYGON BOT
 * Bu kod maksimal tezlik va yuqori komissiya (gas) bilan ishlashga sozlangan.
 */

async function start() {
    console.log("=== [🚀 SUPER-YIRTQICH] BOT ISHGA TUSHDI ===");

    // Render Dashboard -> Environment Variables bo'limidan olinadi
    const RPC_URL = process.env.RPC_URL;
    const EXECUTOR_CONTRACT = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    if (!RPC_URL || !EXECUTOR_CONTRACT || !privateKey) {
        console.error("XATO: Environment Variables (RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY) to'liq emas!");
        return;
    }

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
        // WebSocket orqali real-vaqt rejimida ulanish
        const provider = new ethers.WebSocketProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

        console.log(`Hamyon ulandi: ${wallet.address}`);

        provider.on("block", async (blockNumber) => {
            try {
                // Blokni barcha tranzaksiyalari bilan birga tezkor olish
                const block = await provider.getBlock(blockNumber, true);
                if (!block || !block.prefetchedTransactions) return;

                for (const tx of block.prefetchedTransactions) {
                    // Faqat katta tranzaksiyalarni (Kit) saralash
                    if (tx && tx.value >= MIN_VALUE) {
                        console.log(`[!] KIT TOPILDI: ${tx.hash} | Qiymat: ${ethers.formatEther(tx.value)} POL`);
                        
                        // 0.4% kutilayotgan foyda
                        const rewardAmount = (tx.value * 4n) / 1000n; 
                        
                        // Tarmoqning joriy Gaz holatini olish
                        const feeData = await provider.getFeeData();
                        
                        // 🔥 ULTRA-AGRESSIV GAS SOZLAMALARI
                        const gasSettings = {
                            gasLimit: 800000, 
                            // PriorityFee ni 1000% ga oshirdik (10 baravar ko'p pora)
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 1000n) / 100n,
                            // Umumiy Gaz limitini 5 baravar oshirdik
                            maxFeePerGas: (feeData.maxFeePerGas * 500n) / 100n,
                        };

                        console.log(`[⚡] HUJUM BOSHLANDI... (Gas: ${ethers.formatUnits(gasSettings.maxPriorityFeePerGas, "gwei")} Gwei)`);

                        // Kontraktni chaqirish
                        executor.fastExecute(
                            tx.to, 
                            tx.data || "0x", 
                            "0x0000000000000000000000000000000000000000", 
                            rewardAmount, 
                            gasSettings
                        )
                        .then(res => {
                            console.log(`[✅] MUVAFFAQIYAT! Foyda hamyonga yo'l oldi. Hash: ${res.hash}`);
                        })
                        .catch(e => {
                            console.log("[-] Raqobatda boy berildi: Boshqa bot tezroq chiqdi yoki ko'proq gaz to'ladi.");
                        });
                    }
                }
            } catch (err) {
                console.error("Blok tahlilida xato:", err.message);
            }
        });

        // Ulanish uzilsa avtomatik qayta ulanish
        provider.websocket.onclose = () => {
            console.log("WSS ulanish uzildi. Qayta ulanmoqda...");
            setTimeout(start, 3000);
        };

    } catch (error) {
        console.error("Kritik xato:", error.message);
        setTimeout(start, 5000);
    }
}

start();
