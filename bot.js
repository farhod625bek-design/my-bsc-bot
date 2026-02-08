require("dotenv").config();
const { ethers } = require("ethers");

// 1. ASOSIY SOZLAMALAR
const RPC_URL = "https://polygon-rpc.com"; 
const EXECUTOR_CONTRACT = "0x68A7516D9d28FA59e43FD7dFb04c84ccab5E0e00";
const MIN_VALUE = ethers.parseEther("1000"); // 1000 POL dan katta tranzaksiyalar uchun

// 2. KONTRAKT ABI KODI
const ABI = [
    "function fastExecute(address target, bytes data, address rewardToken, uint256 rewardAmount) payable public",
    "function SERVICE_FEE() view returns (uint256)",
    "function FEE_DENOMINATOR() view returns (uint256)",
    "function TREASURY() view returns (address)"
];

async function start() {
    console.log("--- UNIVERSAL KIT OVCHISI ISHGA TUSHDI (POLYGON) ---");
    
    // Provayder va hamyonni ulash
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Xavfsizlik uchun Private Key .env faylidan olinadi
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("XATOLIK: .env faylida PRIVATE_KEY topilmadi!");
        return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

    console.log(`Hamyon manzili: ${wallet.address}`);
    console.log(`Monitoring boshlandi...`);

    provider.on("block", async (blockNumber) => {
        try {
            // Blokni barcha tranzaksiyalari bilan birga olish
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.transactions) return;

            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                
                // 1000 POL dan katta tranzaksiya bo'lsa
                if (tx && tx.value >= MIN_VALUE) {
                    console.log(`\n[!] KIT ANIQLANDI!`);
                    console.log(`Blok: ${blockNumber}`);
                    console.log(`Hash: ${tx.hash}`);
                    console.log(`Qiymat: ${ethers.formatEther(tx.value)} POL`);
                    
                    const feeData = await provider.getFeeData();
                    
                    // fastExecute funksiyasini chaqirish
                    executor.fastExecute(
                        tx.to, 
                        tx.data || "0x", 
                        ethers.ZeroAddress, 
                        0, 
                        {
                            gasLimit: 800000,
                            // Gaz narxini 2 baravar oshirish
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 200n) / 100n, 
                            maxFeePerGas: feeData.maxFeePerGas,
                        }
                    ).then(res => {
                        console.log(`[+] OV MUVAFFARIYATLI! Hash: ${res.hash}`);
                    }).catch(e => {
                        console.log("[-] Tranzaksiya rad etildi (Mablag' yetishmovchiligi yoki Reverted).");
                    });
                }
            }
        } catch (e) {
            console.error("Blok tahlilida xatolik:", e.message);
        }
    });
}

start();
