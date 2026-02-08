require("dotenv").config();
const { ethers } = require("ethers");

// 1. SOZLAMALAR
const RPC_URL = "https://polygon-rpc.com"; // Tezroq ishlashi uchun Alchemy yoki Infura tavsiya etiladi
const EXECUTOR_CONTRACT_ADDRESS = "0x68A7516D9d28FA59e43FD7dFb04c84ccab5E0e00";
const MIN_VALUE = ethers.parseUnits("1000", "ether"); // 1000 POL

// 2. KONTRAKT ABI (Faqat kerakli funksiyalar)
const ABI = [
    "function fastExecute(address target, bytes data, address rewardToken, uint256 rewardAmount) payable public",
    "function SERVICE_FEE() view returns (uint256)"
];

async function main() {
    console.log("--- UNIVERSAL KIT OVCHISI ISHGA TUSHDI ---");

    // Provayder va Hamyonni sozlash
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // .env faylidan Private Keyni o'qiymiz
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Xatolik: .env faylida PRIVATE_KEY topilmadi!");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const executorContract = new ethers.Contract(EXECUTOR_CONTRACT_ADDRESS, ABI, wallet);

    console.log(`Kuzatuv boshlandi: ${wallet.address}`);

    // Yangi bloklarni kuzatish
    provider.on("block", async (blockNumber) => {
        try {
            // Blokni barcha tranzaksiyalari bilan birga olish
            const block = await provider.getBlock(blockNumber, true);
            if (!block) return;

            for (const tx of block.prefetchedTransactions) {
                // 1000 POL dan katta tranzaksiyalarni filtrlash
                if (tx.value && tx.value >= MIN_VALUE) {
                    console.log(`\n[!] KIT TOPILDI!`);
                    console.log(`Hash: ${tx.hash}`);
                    console.log(`Qiymat: ${ethers.formatEther(tx.value)} POL`);

                    // Tranzaksiyani amalga oshirish
                    try {
                        const feeData = await provider.getFeeData();
                        
                        // fastExecute funksiyasini chaqirish
                        const txResponse = await executorContract.fastExecute(
                            tx.to, 
                            tx.data || "0x", 
                            ethers.ZeroAddress, 
                            0, 
                            {
                                gasLimit: 500000,
                                // Gaz narxini 50% ga oshirish (tezroq o'tishi uchun)
                                maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 150n) / 100n,
                                maxFeePerGas: feeData.maxFeePerGas
                            }
                        );

                        console.log(`[+] OV MUVAFFARIYATLI! Hash: ${txResponse.hash}`);
                    } catch (err) {
                        console.log("[-] Tranzaksiya bajarilmadi (Simulyatsiya xatosi yoki mablag' yetishmovchiligi)");
                    }
                }
            }
        } catch (error) {
            console.error("Blok tahlilida xato:", error.message);
        }
    });
}

main().catch((error) => {
    console.error("Kutilmagan xato:", error);
});
