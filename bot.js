const { ethers } = require("ethers");

// 1. ASOSIY SOZLAMALAR
const RPC_URL = "https://polygon-rpc.com"; 
const EXECUTOR_CONTRACT = "0x68A7516D9d28FA59e43FD7dFb04c84ccab5E0e00";
const MIN_VALUE = ethers.parseEther("1000"); // 1000 POL dan katta tranzaksiyalar uchun

// 2. RABBY WALLET PRIVATE KEY (80 POL bor hamyon)
const PRIVATE_KEY = "0x9c626fee6d5f7b16ca4ef327b474a436aca6d7812049e6e6f2d1517b88b47a7a";

// 3. KONTRAKT ABI KODI
const ABI = [
  {"inputs": [{"internalType": "address","name": "target","type": "address"},{"internalType": "bytes","name": "data","type": "bytes"},{"internalType": "address","name": "rewardToken","type": "address"},{"internalType": "uint256","name": "rewardAmount","type": "uint256"}],"name": "fastExecute","outputs": [],"stateMutability": "payable","type": "function"},
  {"inputs": [],"stateMutability": "nonpayable","type": "constructor"},
  {"inputs": [],"name": "ReentrancyGuardReentrantCall","type": "error"},
  {"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "currentAllowance","type": "uint256"},{"internalType": "uint256","name": "requestedDecrease","type": "uint256"}],"name": "SafeERC20FailedDecreaseAllowance","type": "error"},
  {"inputs": [{"internalType": "address","name": "token","type": "address"}],"name": "SafeERC20FailedOperation","type": "error"},
  {"anonymous": false,"inputs": [{"indexed": true,"internalType": "address","name": "user","type": "address"},{"indexed": true,"internalType": "address","name": "target","type": "address"},{"indexed": false,"internalType": "address","name": "rewardToken","type": "address"},{"indexed": false,"internalType": "uint256","name": "rewardAmount","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "feeAmount","type": "uint256"}],"name": "FastExecuted","type": "event"},
  {"stateMutability": "payable","type": "receive"},
  {"inputs": [],"name": "FEE_DENOMINATOR","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},
  {"inputs": [],"name": "SERVICE_FEE","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},
  {"inputs": [],"name": "TREASURY","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"}
];

async function start() {
    console.log("UNIVERSAL KIT OVCHISI ISHGA TUSHDI (POLYGON)...");
    console.log("Hamyon: Rabby Wallet (80 POL)");
    console.log("Kontrakt: " + EXECUTOR_CONTRACT);
    
    // Provayder va hamyonni ulash
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const executor = new ethers.Contract(EXECUTOR_CONTRACT, ABI, wallet);

    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.transactions) return;

            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                
                // 1000 POL dan katta tranzaksiya bo'lsa
                if (tx && tx.value >= MIN_VALUE) {
                    console.log(KIT ANIQLANDI! Blok: ${blockNumber}, Hash: ${tx.hash}, Qiymat: ${ethers.formatEther(tx.value)} POL);
                    
                    const feeData = await provider.getFeeData();
                    
                    // fastExecute funksiyasini chaqirish
                    executor.fastExecute(tx.to, tx.data, ethers.ZeroAddress, 0, {
                        gasLimit: 800000,
                        maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 200n) / 100n, // Gazni 2 baravar oshirish
                        maxFeePerGas: feeData.maxFeePerGas,
						       }).then(res => {
                        console.log(OV MUVAFFARIYATLI! Hash: ${res.hash});
                    }).catch(e => {
                        console.log("Tranzaksiya rad etildi (Reverted).");
                    });
                }
            }
        } catch (e) {
            console.error("Blok tahlilida xatolik:", e.message);
        }
    });
}

start();
