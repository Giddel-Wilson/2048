class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.initializeEventListeners();
        this.setupBoard();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.newGameBtn.addEventListener('click', this.resetGame.bind(this));
        
        // Touch handling
        let touchStartX, touchStartY, touchStartTime;
        
        this.gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: false });

        this.gameBoard.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.gameBoard.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;

            // Minimum swipe distance and maximum swipe time
            const minSwipeDistance = 30;
            const maxSwipeTime = 300;

            // Only process quick swipes
            if (deltaTime <= maxSwipeTime) {
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
                    // Vertical swipe
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }

            touchStartX = null;
            touchStartY = null;
            touchStartTime = null;
        }, { passive: false });
    }

    setupBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('tile');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameBoard.appendChild(cell);
            }
        }

        this.addRandomTile();
        this.addRandomTile();
        this.updateBoard();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateBoard() {
        const cells = Array.from(this.gameBoard.children);
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.board[row][col];
            
            // Remove previous classes
            cell.className = 'tile';
            cell.textContent = '';
            
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add(`tile-${value}`);
            }
        });
        
        this.scoreDisplay.textContent = this.score;
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            event.preventDefault();
            const direction = key.replace('arrow', '');
            this.move(direction);
        }
    }

    move(direction) {
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            setTimeout(() => {
                this.addRandomTile();
                this.updateBoard();
                this.checkGameStatus();
            }, 100);
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.boardSize; i++) {
            const row = this.board[i];
            const newRow = this.mergeTiles(row);
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                this.board[i] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.boardSize; i++) {
            const row = this.board[i].slice().reverse();
            const newRow = this.mergeTiles(row).reverse();
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) {
                this.board[i] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.boardSize; j++) {
            const column = this.board.map(row => row[j]);
            const newColumn = this.mergeTiles(column);
            for (let i = 0; i < this.boardSize; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    this.board[i][j] = newColumn[i];
                    moved = true;
                }
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.boardSize; j++) {
            const column = this.board.map(row => row[j]).reverse();
            const newColumn = this.mergeTiles(column).reverse();
            for (let i = 0; i < this.boardSize; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    this.board[i][j] = newColumn[i];
                    moved = true;
                }
            }
        }
        return moved;
    }

    mergeTiles(line) {
        const filteredLine = line.filter(val => val !== 0);
        const mergedLine = [];

        for (let i = 0; i < filteredLine.length; i++) {
            if (i + 1 < filteredLine.length && filteredLine[i] === filteredLine[i + 1]) {
                const mergedValue = filteredLine[i] * 2;
                mergedLine.push(mergedValue);
                this.score += mergedValue;
                i++;
            } else {
                mergedLine.push(filteredLine[i]);
            }
        }

        while (mergedLine.length < this.boardSize) {
            mergedLine.push(0);
        }

        return mergedLine;
    }

    checkGameStatus() {
        // Check for win condition
        if (this.board.some(row => row.includes(2048))) {
            alert('Congratulations! You won!');
            this.resetGame();
            return;
        }

        // Check for lose condition
        const hasEmptyCell = this.board.some(row => row.includes(0));
        const canMerge = this.checkIfCanMerge();

        if (!hasEmptyCell && !canMerge) {
            alert('Game Over! No more moves possible.');
            this.resetGame();
        }
    }

    checkIfCanMerge() {
        // Check horizontal merges
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize - 1; j++) {
                if (this.board[i][j] === this.board[i][j + 1]) {
                    return true;
                }
            }
        }

        // Check vertical merges
        for (let j = 0; j < this.boardSize; j++) {
            for (let i = 0; i < this.boardSize - 1; i++) {
                if (this.board[i][j] === this.board[i + 1][j]) {
                    return true;
                }
            }
        }

        return false;
    }

    resetGame() {
        this.score = 0;
        this.setupBoard();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
