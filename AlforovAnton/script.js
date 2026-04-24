const gameState = {
    rows: 10,
    cols: 10,
    minesCount: 15,
    status: 'process',
    gameTime: 0,
    timerId: null,
};

let field = [];

const fieldElement = document.getElementById('field');
const timerElement = document.getElementById('timer');
const flagsCountElement = document.getElementById('flags-count');
const restartButton = document.getElementById('restart-btn');
const messageElement = document.getElementById('message');

function createCell() {
    return {
        type: 'empty',
        neighborMines: 0,
        state: 'closed',
    };
}

function isInside(row, col) {
    return row >= 0 && row < gameState.rows && col >= 0 && col < gameState.cols;
}

function getNeighbors(row, col) {
    const neighbors = [];

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r === row && c === col) continue;

            if (isInside(r, c)) {
                neighbors.push([r, c]);
            }
        }
    }

    return neighbors;
}

function generateField(rows, cols, minesCount) {
    gameState.rows = rows;
    gameState.cols = cols;
    gameState.minesCount = minesCount;
    gameState.status = 'process';
    gameState.gameTime = 0;

    field = [];

    for (let row = 0; row < rows; row++) {
        const line = [];

        for (let col = 0; col < cols; col++) {
            line.push(createCell());
        }

        field.push(line);
    }

    let placedMines = 0;

    while (placedMines < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (field[row][col].type !== 'mine') {
            field[row][col].type = 'mine';
            placedMines++;
        }
    }

    countNeighbourMines();
}

function countNeighbourMines() {
    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            const cell = field[row][col];

            if (cell.type === 'mine') continue;

            let mines = 0;
            const neighbors = getNeighbors(row, col);

            for (const [neighborRow, neighborCol] of neighbors) {
                if (field[neighborRow][neighborCol].type === 'mine') {
                    mines++;
                }
            }

            cell.neighborMines = mines;
        }
    }
}

function openCell(row, col) {
    if (!isInside(row, col)) return;
    if (gameState.status !== 'process') return;

    const cell = field[row][col];

    if (cell.state === 'opened' || cell.state === 'flagged') return;

    cell.state = 'opened';

    if (cell.type === 'mine') {
        gameState.status = 'lose';
        stopTimer();
        openAllMines();
        renderField();
        updateInterface();
        return;
    }

    if (cell.neighborMines === 0) {
        const neighbors = getNeighbors(row, col);

        for (const [neighborRow, neighborCol] of neighbors) {
            openCell(neighborRow, neighborCol);
        }
    }

    checkWin();
    renderField();
    updateInterface();
}

function toggleFlag(row, col) {
    if (!isInside(row, col)) return;
    if (gameState.status !== 'process') return;

    const cell = field[row][col];

    if (cell.state === 'opened') return;

    if (cell.state === 'closed' && getFlagsCount() < gameState.minesCount) {
        cell.state = 'flagged';
    } else if (cell.state === 'flagged') {
        cell.state = 'closed';
    }

    renderField();
    updateInterface();
}

function checkWin() {
    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            const cell = field[row][col];

            if (cell.type === 'empty' && cell.state !== 'opened') {
                return false;
            }
        }
    }

    gameState.status = 'win';
    stopTimer();
    return true;
}

function openAllMines() {
    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            if (field[row][col].type === 'mine') {
                field[row][col].state = 'opened';
            }
        }
    }
}

function getFlagsCount() {
    let flags = 0;

    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            if (field[row][col].state === 'flagged') {
                flags++;
            }
        }
    }

    return flags;
}

function startTimer() {
    stopTimer();

    gameState.timerId = setInterval(() => {
        if (gameState.
            status === 'process') {
            gameState.gameTime++;
            updateInterface();
        } else {
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerId !== null) {
        clearInterval(gameState.timerId);
        gameState.timerId = null;
    }
}

function renderField() {
    fieldElement.innerHTML = '';
    fieldElement.style.gridTemplateColumns = 'repeat(${ gameState.cols }, 36px)';

    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            const cell = field[row][col];
            const cellElement = document.createElement('div');

            cellElement.classList.add('cell', cell.state);

            if (cell.state === 'opened') {
                if (cell.type === 'mine') {
                    cellElement.textContent = '💣';
                    cellElement.classList.add('mine');
                } else if (cell.neighborMines > 0) {
                    cellElement.textContent = cell.neighborMines;
                }
            }

            if (cell.state === 'flagged') {
                cellElement.textContent = '🚩';
            }

            cellElement.addEventListener('click', () => {
                openCell(row, col);
            });

            cellElement.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                toggleFlag(row, col);
            });

            fieldElement.appendChild(cellElement);
        }
    }
}

function updateInterface() {
    timerElement.textContent = gameState.gameTime;
    flagsCountElement.textContent = gameState.minesCount - getFlagsCount();

    if (gameState.status === 'process') {
        messageElement.textContent = 'Гра триває';
    } else if (gameState.status === 'win') {
        messageElement.textContent = 'Ви перемогли!';
    } else if (gameState.status === 'lose') {
        messageElement.textContent = 'Ви програли!';
    }
}

function resetGame() {
    stopTimer();
    generateField(10, 10, 15);
    renderField();
    updateInterface();
    startTimer();
}

restartButton.addEventListener('click', resetGame);

resetGame();