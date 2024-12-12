setTimeout(() => {
        document.body.style.cssText = `opacity: 1;`;
}, 820);

const allSmallDivs = document.querySelectorAll(".cell");

const playerMarkg = localStorage.getItem("playerMark");
if (!playerMarkg) {
    alert("Please select a mark first.");
    window.location.href = `index.html`;
}

// GAMEBOARD LOGIC BEGINS
const Gameboard = (function () {
    const board = Array(9).fill(null);

    const setCell = (index, value) => {
        if (!board[index]) {
            board[index] = value;
            return true;
        }
        return false;
    };

    const getCell = (index) => board[index];
    const resetBoard = () => board.fill(null);
    const getBoard = () => [...board];

    return { setCell, getCell, resetBoard, getBoard };
})();

// Module for game logic

const GameController = (() => {

    const userMark = localStorage.getItem("playerMark");
    const cpuMark = userMark === "x" ? "o" : "x";

    let currentPlayer = userMark;
    let isGameOver = false;

    const switchPlayer = () => currentPlayer = currentPlayer === userMark ? cpuMark : userMark;

    let winningLine = null;

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        const winningCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[b] === board[c]) {
                winningLine = combo;
                return { winner: board[a], winningLine: combo }; // Return the winner and line
            }
        }

        if (board.every((cell) => cell !== null)) {
            return { winner: "Tie", winningLine: null }
        };
        return null;
    };

    const getWinningLine = () => winningLine;

    const getCurrentPlayer = () => currentPlayer;
    const setCurrentPlayer = (player) => { currentPlayer = player };
    const getGameOverStatus = () => isGameOver;
    const setGameOver = (status) => (isGameOver = status);

    return { switchPlayer, checkWinner, getWinningLine, setCurrentPlayer, getCurrentPlayer, getGameOverStatus, setGameOver, userMark, cpuMark };
})();

// Module for UI Controls
const UIController = (() => {
    const cells = document.querySelectorAll(".cell");
    const restartButton = document.querySelector(".top-bar button");
    const turnDisplay = document.querySelector(".turn");
    const userScoreDisplay = document.querySelector(".user-score");
    const cpuScoreDisplay = document.querySelector(".cpu-score");
    const tiesDisplay = document.querySelector(".ties-score");
    const modal = document.createElement("dialog");
    modal.classList.add("modal");
    document.body.appendChild(modal);

    let userScore = 0;
    let cpuScore = 0;
    let ties = 0;

    const highlightWinningLine = (line, winner) => {
        if (!line) return;
    
        // Determine the color based on the player's mark
        const mark = winner === GameController.cpuMark ? GameController.cpuMark : GameController.userMark;
        const color = mark === "x" ? "rgba(233, 233, 233, 0.75)" : "rgb(255, 217, 0)";
    
        // Highlight the winning cells
        line.forEach((index) => {
            const cell = allSmallDivs[index];
            if (cell) {
                cell.style.backgroundColor = color;
                cell.style.transition = "background-color 0.5s ease";
            }
        });
    
        // Reset highlight logic will now only run if modal buttons exist
        setTimeout(() => {
            const nextBtn = document.querySelector(".next-round-btn");
            const quitBtn = document.querySelector(".quit-btn");
    
            if (nextBtn) nextBtn.addEventListener("click", resetHighlight);
            if (quitBtn) quitBtn.addEventListener("click", resetHighlight);
        }, 1200); // Attach after modal is fully rendered
    };
    

    const resetHighlight = () => {
        allSmallDivs.forEach(cell => cell.style.backgroundColor = "");
    };

    const resetModal = () => {
        modal.classList.remove("show");
        modal.querySelector("p").textContent = "";
    };

    const resetLineColor = () => {
        cells.forEach(cell => {
            cell.style.backgroundColor = "";
        });
    };

    const renderBoard = () => {
        cells.forEach((cell, index) => {
            const value = Gameboard.getCell(index);
            cell.innerHTML = value ? `<img src="assets/${value}-icon.png" alt="${value}-icon" height="${value === "x" ? "42px" : "36px"} width="${value === "x" ? "42px" : "36px"}">` : "";
        });
    };

    const resetUI = () => {
        cells.forEach((cell) => {
            cell.innerHTML = "";
            cell.style.backgroundColor = "";
        });
        turnDisplay.textContent = `(Your Turn)`;
    };
  
    const displayTurn = (player) => {
        turnDisplay.textContent = player === GameController.userMark ? "Your Turn" : "CPU's Turn";
    };

    const attachEventListeners = (cellClickHandler, restartHandler) => {
        cells.forEach((cell, index) => {
            cell.removeEventListener("click", cellClickHandler); // Remove old listener
            cell.addEventListener("click", () => cellClickHandler(index));
        });
        
        restartButton.addEventListener("click", restartHandler);
    };

    const showWinnerModal = (winner, winningLine) => {
        let message = "";
    if (winner.winner === GameController.userMark) {
        message = "You won!";
        userScore++;
        userScoreDisplay.textContent = userScore;
    } else if (winner.winner === GameController.cpuMark) {
        message = "CPU Won!";
        cpuScore++;
        cpuScoreDisplay.textContent = cpuScore;
    } else if (winner.winner === "Tie") {
        message = "Oh it's a Tie!";
        ties++;
        tiesDisplay.textContent = ties;
    }

    setTimeout(() => {
        modal.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button class="next-round-btn">Next Round</button>
                <button class="quit-btn">Quit</button>
            </div>
        `;
        modal.classList.add("show");

        document.querySelector(".next-round-btn").addEventListener("click", () => {
            resetModal();
            UIController.resetLineColor();
            App.startNewRound();
        });
        document.querySelector(".quit-btn").addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }, 1100);
};

    return { renderBoard, resetUI, displayTurn, attachEventListeners, showWinnerModal, highlightWinningLine, resetLineColor };
})();


// Main APP logic
const App = (() => {
    const handleCellClick = (index) => {

        if (GameController.getGameOverStatus() || GameController.getCurrentPlayer() !== GameController.userMark || !Gameboard.setCell(index, GameController.getCurrentPlayer())) {
            return;
        };

        UIController.renderBoard();
        const winner = GameController.checkWinner();

        if (winner) {
            GameController.setGameOver(true);
            const winningLine = GameController.getWinningLine();

        if (winningLine) {
            UIController.highlightWinningLine(winningLine, winner.winner);
            }

        setTimeout(() => UIController.showWinnerModal(winner), 1300);
            return;
        };

        // Switch to CPU turn
        GameController.switchPlayer();
        UIController.displayTurn(GameController.getCurrentPlayer());

        setTimeout(cpuMove, 1700); // Simulate CPU delay
    };

    const cpuMove = () => {

        if (GameController.getCurrentPlayer() !== GameController.cpuMark || GameController.getGameOverStatus()) {
            return;
        };

        const emptyCells = Gameboard.getBoard()
          .map((val, idx) => (val === null ? idx : null))
          .filter((idx) => idx !== null);
  
        if (!emptyCells.length) return;
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            Gameboard.setCell(emptyCells[randomIndex], GameController.cpuMark);
          UIController.renderBoard();
  
          const winner = GameController.checkWinner();
          // Check if CPU won or a tie
          if (winner) {
            GameController.setGameOver(true);

            if (winner !== "Tie") {
                const winningLine = GameController.getWinningLine();
                UIController.highlightWinningLine(winningLine, winner);
            };

            setTimeout(() => UIController.showWinnerModal(winner), 1500);
            return;
          }

          //Switch back to user turn
          GameController.switchPlayer();
          UIController.displayTurn(GameController.getCurrentPlayer());
    };

    const handleRestart = () => {
        // Full reset game
        Gameboard.resetBoard();
        GameController.setGameOver(false);
        GameController.setCurrentPlayer(GameController.userMark); // Reset to userMark
        userScore = 0;
        cpuScore = 0;
        ties = 0;
        UIController.resetLineColor();

        UIController.renderBoard();
        UIController.resetUI();
        UIController.displayTurn(GameController.getCurrentPlayer());

        document.querySelector(".user-score").textContent = "0";
        document.querySelector(".cpu-score").textContent = "0";
        document.querySelector(".ties-score").textContent = "0";

        if (GameController.getCurrentPlayer() === GameController.cpuMark) {
            setTimeout(cpuMove, 1700);
        }
    };

    const startNewRound = () => {

        Gameboard.resetBoard();
        GameController.setGameOver(false);
        GameController.setCurrentPlayer(GameController.userMark);
        UIController.renderBoard();
        UIController.displayTurn(GameController.getCurrentPlayer());
        UIController.resetLineColor();
  
        // CPU start if it's its turn
        if (GameController.getCurrentPlayer() === GameController.cpuMark) {
          setTimeout(cpuMove, 1700);
        };
    };
  
    const init = () => {
        UIController.attachEventListeners(handleCellClick, handleRestart);
        handleRestart(); // Set initial state
    };
  
    return { init, startNewRound }; 
})();

App.init();