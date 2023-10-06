let provider, signer, gameContract;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const contractAddress = "0xcD6a42782d230D7c13A74ddec5dD140e55499Df9";
            const abi = [
                {
                    "inputs": [],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "player",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "result",
                            "type": "string"
                        }
                    ],
                    "name": "GameResult",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "enum RockPaperScissors.Choice",
                            "name": "playerChoice",
                            "type": "uint8"
                        }
                    ],
                    "name": "play",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_minimumBet",
                            "type": "uint256"
                        }
                    ],
                    "name": "setMinimumBet",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getRandomChoice",
                    "outputs": [
                        {
                            "internalType": "enum RockPaperScissors.Choice",
                            "name": "",
                            "type": "uint8"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "minimumBet",
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
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "randomChoice",
                    "outputs": [
                        {
                            "internalType": "enum RockPaperScissors.Choice",
                            "name": "",
                            "type": "uint8"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];


            gameContract = new ethers.Contract(contractAddress, abi, signer);

            document.getElementById("gameControls").style.display = "block";

        } catch (error) {
            console.error("User denied access to Metamask");
        }
    } else {
        alert('Metamask needs to be installed!');
    }
}

async function playGame() {
    try {
        const choice = document.getElementById("choice").value;
        const betAmount = document.getElementById("betAmount").value;

        const tx = await gameContract.play(choice, {
            value: ethers.utils.parseEther(betAmount),
            gasLimit: 1000000
        });

        const receipt = await tx.wait();

        console.log(receipt);

        const parsedLogs = receipt.logs.map(log => {
            try {
                return gameContract.interface.parseLog(log);
            } catch (error) {
                return null;
            }
        }).filter(parsedLog => parsedLog !== null);

        for (let parsedLog of parsedLogs) {
            if (parsedLog.name === "GameResult") {
                console.log("GameResult event received:", parsedLog.args.result);
                const result = parsedLog.args.result;
                document.getElementById("result").innerText = result;
                // Check the value of 'result' to determine the winner and display an appropriate message to the user.
                if (result === "Player wins!") {
                    document.getElementById("result").innerText += " You win!";
                } else if (result === "Player Looses!") {
                    document.getElementById("result").innerText += " You lose!";
                } else if (result === "Tie!") {
                    document.getElementById("result").innerText += " It's tie!";
                }
            }
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerText = "An error occurred.";
    }
}
