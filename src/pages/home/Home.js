// Home.js
import './Home.css';
import { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';

const Home = () => {
    const [board, setBoard] = useState([]);
    const [isBoardGenerated, setIsBoardGenerated] = useState(false);
    const [revealed, setRevealed] = useState([]);
    const [difficulty, setDifficulty] = useState(0);

    const styleSelectDifficulty = {
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #484850",
            borderRadius: "5px 5px 0 0"
        },
    }

    const generateBoard = (level, safeIndex = null) => {
        const sizes = [8 ** 2, 12 ** 2, 16 ** 2];
        const minesCount = [10, 25, 50];
        const size = sizes[level];
        const mines = minesCount[level];
        const columns = [8, 12, 16][level];
        let newBoard = Array(size).fill('0');

        // Define área segura (célula clicada + 8 vizinhos)
        const safeCells = new Set();
        if (safeIndex !== null) {
            const row = Math.floor(safeIndex / columns);
            const col = safeIndex % columns;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < columns && c >= 0 && c < columns) {
                        safeCells.add(r * columns + c);
                    }
                }
            }
        }

        // Coloca minas EVITANDO a área segura
        let mineCount = 0;
        while (mineCount < mines) {
            const locationMine = Math.floor(Math.random() * size);
            if (newBoard[locationMine] !== '-1' && !safeCells.has(locationMine)) {
                newBoard[locationMine] = '-1';
                mineCount++;
            }
        }

        // Calcula números ao redor das minas
        for (let i = 0; i < size; i++) {
            if (newBoard[i] === '-1') continue;

            let countBombs = 0;
            const row = Math.floor(i / columns);
            const col = i % columns;

            for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
                    if (rowOffset === 0 && columnOffset === 0) continue;
                    const r = row + rowOffset;
                    const c = col + columnOffset;
                    if (r >= 0 && r < columns && c >= 0 && c < columns) {
                        const neighborIndex = r * columns + c;
                        if (newBoard[neighborIndex] === '-1') {
                            countBombs++;
                        }
                    }
                }
            }
            newBoard[i] = countBombs === 0 ? '' : countBombs.toString();
        }
        return newBoard;
    }

    const getColumns = () => {
        return [8, 12, 16][difficulty];
    }

    const handleChange = (event) => {
        const newDifficulty = Number(event.target.value);
        setDifficulty(newDifficulty);
    }

    const handleClick = (index) => {
        // Ignora células já reveladas
        if (revealed[index]) return;

        if (!isBoardGenerated) {
            // 1. Gera tabuleiro com área segura
            const newBoard = generateBoard(difficulty, index);
            setBoard(newBoard);
            setIsBoardGenerated(true);

            // 2. Revela automaticamente a área vazia (flood fill)
            const columns = getColumns();
            const cellsToProcess = [index];
            const updatedRevealed = [...revealed];

            while (cellsToProcess.length > 0) {
                const currentIndex = cellsToProcess.shift();
                if (updatedRevealed[currentIndex]) continue;
                updatedRevealed[currentIndex] = true;

                const currentRow = Math.floor(currentIndex / columns);
                const currentCol = currentIndex % columns;

                const cardinalDirections = [
                    { rowDelta: -1, colDelta: 0 }, // Norte
                    { rowDelta: 1, colDelta: 0 },  // Sul
                    { rowDelta: 0, colDelta: -1 }, // Oeste
                    { rowDelta: 0, colDelta: 1 }   // Leste
                ];

                for (const direction of cardinalDirections) {
                    const neighborRow = currentRow + direction.rowDelta;
                    const neighborCol = currentCol + direction.colDelta;

                    const isValidPosition =
                        neighborRow >= 0 &&
                        neighborRow < columns &&
                        neighborCol >= 0 &&
                        neighborCol < columns;

                    if (isValidPosition) {
                        const neighborIndex = neighborRow * columns + neighborCol;
                        const isNeighborEmpty = newBoard[neighborIndex] === '';
                        const isNeighborHidden = !updatedRevealed[neighborIndex];

                        if (isNeighborEmpty && isNeighborHidden) {
                            cellsToProcess.push(neighborIndex);
                        }
                    }
                }
            }

            setRevealed(updatedRevealed);
            return;
        }

        const columns = getColumns();
        const isBomb = board[index] === '-1';
        const isEmptyCell = board[index] !== '';

        if (isBomb || isEmptyCell) {
            setRevealed(prev => {
                const newRevealed = [...prev];
                newRevealed[index] = true;
                return newRevealed;
            });
            return
        }

        const cellsToProcess = [index]; // Fila de processamento
        const updatedRevealed = [...revealed];

        while (cellsToProcess.length > 0) {
            const currentIndex = cellsToProcess.shift();
            // Pula células já processadas
            if (updatedRevealed[currentIndex]) continue;
            // Revela célula atual
            updatedRevealed[currentIndex] = true;
            const currentRow = Math.floor(currentIndex / columns);
            const currentCol = currentIndex % columns;

            // Direções cardinais
            const cardinalDirections = [
                { rowDelta: -1, colDelta: 0 }, // Norte
                { rowDelta: 1, colDelta: 0 },  // Sul
                { rowDelta: 0, colDelta: -1 }, // Oeste
                { rowDelta: 0, colDelta: 1 }   // Leste
            ];

            // Processa cada direção
            for (const direction of cardinalDirections) {
                const neighborRow = currentRow + direction.rowDelta;
                const neighborCol = currentCol + direction.colDelta;
                // Verifica se está dentro do tabuleiro
                const isValidPosition =
                    neighborRow >= 0 &&
                    neighborRow < columns &&
                    neighborCol >= 0 &&
                    neighborCol < columns;

                if (isValidPosition) {
                    const neighborIndex = neighborRow * columns + neighborCol;
                    // Processa apenas células vazias não reveladas
                    const isNeighborEmpty = board[neighborIndex] === '';
                    const isNeighborHidden = !updatedRevealed[neighborIndex];
                    if (isNeighborEmpty && isNeighborHidden) {
                        cellsToProcess.push(neighborIndex);
                    }
                }
            }
        }
        setRevealed(updatedRevealed);
    }

    useEffect(() => {
        const size = [8 ** 2, 12 ** 2, 16 ** 2][difficulty];
        setBoard(Array(size).fill(''));
        setRevealed(Array(size).fill(false));
        setIsBoardGenerated(false);
    }, [difficulty]);

    return (
        <div className="home_container">
            <div className="header_container">
                <div className="header_inputs">
                    <Select className="header_select_difficulty"
                        value={difficulty}
                        onChange={handleChange}
                        autoWidth
                        sx={styleSelectDifficulty}>
                        <MenuItem value={0}>Fácil</MenuItem>
                        <MenuItem value={1}>Médio</MenuItem>
                        <MenuItem value={2}>Difícil</MenuItem>
                    </Select>
                </div>
                <div className="header_flag_and_time">

                </div>
            </div>
            {board &&
                <div className='body_container'>
                    <div className="body_board_grid"
                        style={{
                            gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
                            gridTemplateRows: `repeat(${getColumns()}, 1fr)`,
                        }}>
                        {board.map((cell, index) => {
                            const columns = getColumns();
                            const row = Math.floor(index / columns);
                            const col = index % columns;
                            const isEven = (row + col) % 2 === 0;

                            return (
                                <div key={index} className={`body_board_grid_cell ${isEven ? 'even-cell' : 'odd-cell'}${revealed[index] ? '-revealed' : ''}`} onClick={() => handleClick(index)}>
                                    {revealed[index] ? (cell === '-1' ? '💣' : cell) : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
            }
        </div>
    );
}

export default Home;