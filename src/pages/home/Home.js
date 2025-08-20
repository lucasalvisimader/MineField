// Home.js
import './Home.css';
import { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';

const Home = () => {
    const [board, setBoard] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [difficulty, setDifficulty] = useState(0);

    const styleSelectDifficulty = {
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #484850",
            borderRadius: "5px 5px 0 0"
        },
    }

    const generateBoard = (level) => {
        const sizes = [8 ** 2, 12 ** 2, 16 ** 2];
        const minesCount = [10, 25, 50];
        const size = sizes[level];
        const mines = minesCount[level];

        let newBoard = Array(size).fill('0');

        for (let i = 0; i < mines;) {
            const locationMine = Math.floor(Math.random() * size);
            if (newBoard[locationMine] !== '-1') {
                newBoard[locationMine] = '-1';
                i++;
            }
        }

        for (let i = 0; i < size; i++) {
            if (newBoard[i] === '-1') continue;

            const columns = getColumns();
            const linhaAtual = Math.floor(i / columns);
            const colunaAtual = i % columns;
            let countBombs = 0;

            // Olha para os 8 vizinhos
            for (let linhaOffset = -1; linhaOffset <= 1; linhaOffset++) {
                for (let colunaOffset = -1; colunaOffset <= 1; colunaOffset++) {
                    // Ignora a célula atual
                    if (linhaOffset === 0 && colunaOffset === 0) continue;

                    const novaLinha = linhaAtual + linhaOffset;
                    const novaColuna = colunaAtual + colunaOffset;

                    // Verifica se está dentro do tabuleiro
                    if (novaLinha >= 0 && novaLinha < columns && novaColuna >= 0 && novaColuna < columns) {
                        const indiceVizinho = novaLinha * columns + novaColuna;
                        if (newBoard[indiceVizinho] === '-1') {
                            countBombs++;
                        }
                    }
                }
            }
            newBoard[i] = countBombs === 0 ? '' : countBombs.toString();
        }
        setBoard(newBoard);
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
        generateBoard(difficulty);
        setRevealed(Array(board.length).fill(false))
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