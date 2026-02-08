[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			},
			{
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			}
		],
		"name": "fastExecute",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentAllowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "requestedDecrease",
				"type": "uint256"
			}
		],
		"name": "SafeERC20FailedDecreaseAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "feeAmount",
				"type": "uint256"
			}
		],
		"name": "FastExecuted",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "FEE_DENOMINATOR",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SERVICE_FEE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TREASURY",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

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
