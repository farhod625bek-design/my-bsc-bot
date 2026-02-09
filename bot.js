require("dotenv").config();
const { ethers } = require("ethers");

// 1. SIZ BERGAN MA'LUMOTLAR BILAN SOZLANGAN QISM
const RPC_URL = "wss://polygon-mainnet.g.alchemy.com/v2/yn3DIQEeppmgiiX6vcdyh"; 

// SIZNING KONTRAKT MANZILINGIZ SHU YERDA:
const EXECUTOR_CONTRACT = "0x83a47D3f73efb0e7De350e0a7Bb90B9CAd2e237d"; 

const MIN_VALUE = ethers.parseEther("1000"); // 1000 POL dan kattasini poylaydi

// SIZ BERGAN ABI KOD
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
    
    // WebSocket orqali ulanish (Siz bergan Alchemy API)
    const provider = new ethers.WebSocketProvider(RPC_URL);
    
    // !!! DIQQAT: Bu yerga YANGI HAMYONINGIZ PRIVATE KEYini qo'ying !!!
    const privateKey = "BU_YERGA_HAMYON_MAXFIY_KALITINI_YOZING"; 
    
    if (privateKey === "BU_YERGA_HAMYON_MAXFIY_KALITINI_YOZING") {
        console.error("XATO: Private Keyni yozmadingiz!");
        return;
    }

  
    const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

    console.log(`Ishlayotgan hamyon: ${wallet.address}`);
    console.log(`Ulangan kontrakt: ${EXECUTOR_CONTRACT}`);
    
    provider.on("block", async (blockNumber) => {
        try {
            // Blokni barcha tranzaksiyalari bilan olish
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions) return;

            for (const tx of block.prefetchedTransactions) {
                // Katta tranzaksiya (Kit) va u kontrakt bo'lmasa filtrlash
                if (tx && tx.value >= MIN_VALUE) {
                console.log(`[!] Kit topildi: ${tx.hash} | Qiymat: ${ethers.formatEther(tx.value)} POL`);
                    
                    // 0.4% komissiya hisoblash
                    const rewardAmount = (tx.value * 4n) / 1000n; 

                    const feeData = await provider.getFeeData();
                    
                    // Kontraktni chaqirish (fastExecute funksiyasi)
                    executor.fastExecute(
                        tx.to, 
                        tx.data || "0x", 
                        "0x0000000000000000000000000000000000000000", // POL uchun ZeroAddress
                        rewardAmount, 
                        {
                            gasLimit: 600000,
                            maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 200n) / 100n, // Ustunlik (Priority)
                            maxFeePerGas: (feeData.maxFeePerGas * 150n) / 100n,
                        }
                    ).then(res => {
                        // MANA SHU YERDAGI BACKTICK ( ` ) TO'G'IRLANDI:
                    console.log(`[+] Muvaffaqiyatli! 0.4% komissiya olindi. Hash: ${res.hash}`);
                    }).catch(e => {
                        console.log("[-] Tranzaksiya o'tmadi (Raqobatchilar tezroq chiqdi).");
                    });
                }
            }
        } catch (e) {
            console.error("Xato:", e.message);
        }
    });

    // Ulanish uzilsa qayta tiklash
    provider._websocket.on("close", () => {
        console.log("WSS ulanish uzildi. 3 soniyadan keyin qayta ulanadi...");
        setTimeout(start, 3000);
    });
}

start();
