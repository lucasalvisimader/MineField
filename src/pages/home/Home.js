// Home.js
import './Home.css';
import { useState, useEffect, useCallback } from 'react';
import { Select, MenuItem } from '@mui/material';
import flag from '../../assets/images/Flag.svg';
import timer from '../../assets/images/Timer.svg';

// Constantes de configuração
const DIFFICULTY_CONFIG = [
    { label: 'Fácil', size: 8, mines: 10 },
    { label: 'Médio', size: 12, mines: 25 },
    { label: 'Difícil', size: 16, mines: 50 },
];

const Home = () => {
    const [difficulty, setDifficulty] = useState(0);
    const [board, setBoard] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [isBoardGenerated, setIsBoardGenerated] = useState(false);

    // Estilo do Select (MUI)
    const styleSelectDifficulty = {
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #484850",
            borderRadius: "5px 5px 0 0"
        },
    }

    // Obtém o tamanho do tabuleiro baseado na dificuldade
    const getBoardSize = useCallback(() => {
        return DIFFICULTY_CONFIG[difficulty].size;
    }, [difficulty]);

    // Gera o tabuleiro com minas e números
    const generateBoard = useCallback((level, safeIndex = null) => {
        const { size, mines } = DIFFICULTY_CONFIG[level];
        const totalCells = size * size;
        let newBoard = Array(totalCells).fill('0');

        // Define células seguras (célula inicial + vizinhos imediatos)
        const safeCells = new Set();
        if (safeIndex !== null) {
            const row = Math.floor(safeIndex / size);
            const col = safeIndex % size;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < size && c >= 0 && c < size) {
                        safeCells.add(r * size + c);
                    }
                }
            }
        }

        // Coloca minas, evitando a área segura
        let mineCount = 0;
        while (mineCount < mines) {
            const location = Math.floor(Math.random() * totalCells);
            if (newBoard[location] !== '-1' && !safeCells.has(location)) {
                newBoard[location] = '-1';
                mineCount++;
            }
        }

        // Calcula números ao redor das minas
        for (let i = 0; i < totalCells; i++) {
            if (newBoard[i] === '-1') continue;

            let count = 0;
            const row = Math.floor(i / size);
            const col = i % size;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < size && c >= 0 && c < size) {
                        const neighborIndex = r * size + c;
                        if (newBoard[neighborIndex] === '-1') count++;
                    }
                }
            }
            newBoard[i] = count === 0 ? '' : count.toString();
        }
        return newBoard;
    }, []);

    // Algoritmo de flood fill para revelar células vazias em cadeia
    const floodFill = useCallback((index, isEmpty, board, columns, initialRevealed) => {
        const updatedRevealed = [...initialRevealed];
        const allRevealedValues = [index];

        while (allRevealedValues.length > 0) {
            const currentIndex = allRevealedValues.shift();
            if (updatedRevealed[currentIndex]) continue;
            updatedRevealed[currentIndex] = true;

            const row = Math.floor(currentIndex / columns);
            const col = currentIndex % columns;

            if (isEmpty) {
                if (board[currentIndex] === '') {

                    // Direções cardinais (N, S, W, E)
                    const directions = [
                        { dr: -1, dc: 0 }, // Norte
                        { dr: 1, dc: 0 },  // Sul
                        { dr: 0, dc: -1 }, // Oeste
                        { dr: 0, dc: 1 }   // Leste
                    ];

                    for (const { dr, dc } of directions) {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < columns && nc >= 0 && nc < columns) {
                            const neighborIndex = nr * columns + nc;
                            const isNeighborEmpty = board[neighborIndex] === '';
                            const isHidden = !updatedRevealed[neighborIndex];

                            if (isNeighborEmpty && isHidden) {
                                allRevealedValues.push(neighborIndex);
                            }
                        }
                    }

                    const allDirections = [
                        { dr: -1, dc: -1 }, // Noroeste
                        { dr: -1, dc: 0 }, // Norte
                        { dr: -1, dc: 1 }, // Nordeste
                        { dr: 0, dc: -1 }, // Oeste
                        { dr: 0, dc: 1 }, // Leste
                        { dr: 1, dc: -1 }, // Sudoeste
                        { dr: 1, dc: 0 }, // Sul
                        { dr: 1, dc: 1 }  // Sudeste
                    ];

                    for (const { dr, dc } of allDirections) {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < columns && nc >= 0 && nc < columns) {
                            const neighborIndex = nr * columns + nc;
                            const isNeighborNumber = board[neighborIndex] !== '' && board[neighborIndex] !== '-1';
                            const isHidden = !updatedRevealed[neighborIndex];

                            if (isNeighborNumber && isHidden) {
                                allRevealedValues.push(neighborIndex);
                            }
                        }
                    }
                }
            }
        }
        return updatedRevealed;
    }, []);

    // Manipula clique em uma célula
    const handleClick = useCallback((index) => {
        if (revealed[index]) return; // Já revelada

        // Clique em jogo já iniciado
        const columns = getBoardSize();
        const isBomb = board[index] === '-1';
        const isEmpty = board[index] === '';

        if (!isBoardGenerated) {
            // Primeiro clique: gera o tabuleiro com área segura
            const newBoard = generateBoard(difficulty, index);
            setBoard(newBoard);
            setIsBoardGenerated(true);

            // Revela automaticamente células vazias conectadas
            const updatedRevealed = floodFill(index, isEmpty, newBoard, columns, Array(newBoard.length).fill(false));
            setRevealed(updatedRevealed);
            return;
        }

        if (isBomb) {
            // Revela célula clicada
            setRevealed(prev => {
                const newRevealed = [...prev];
                newRevealed[index] = true;
                return newRevealed;
            });
            return;
        }

        // Revela células vazias conectadas (flood fill)
        const updatedRevealed = floodFill(index, isEmpty, board, columns, revealed);
        setRevealed(updatedRevealed);
    }, [difficulty, isBoardGenerated, board, revealed, generateBoard, floodFill, getBoardSize]);

    // Reinicia o tabuleiro ao mudar a dificuldade
    useEffect(() => {
        const size = DIFFICULTY_CONFIG[difficulty].size;
        const totalCells = size * size;
        setBoard(Array(totalCells).fill(''));
        setRevealed(Array(totalCells).fill(false));
        setIsBoardGenerated(false);
    }, [difficulty]);

    return (
        <div className="home_container">
            <div className="header_container">
                <div className="header_inputs">
                    <Select className="header_select_difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        autoWidth
                        sx={styleSelectDifficulty}>
                        {DIFFICULTY_CONFIG.map((config, index) => (
                            <MenuItem key={index} value={index}>
                                {config.label}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <div className="header_flag_and_time">
                    <div className="header_flag">
                        <img className="header_image" src={flag} alt="flag" />
                        <p>29</p>
                    </div>
                    <div className="header_timer">
                        <img className="header_image" src={timer} alt="flag" />
                        <p>999</p>
                    </div>
                </div>
            </div>

            {board.length > 0 && (
                <div className="body_container">
                    <div className="body_board_grid"
                        style={{
                            gridTemplateColumns: `repeat(${getBoardSize()}, 1fr)`,
                            gridTemplateRows: `repeat(${getBoardSize()}, 1fr)`,
                        }}>
                        {board.map((cell, index) => {
                            const size = getBoardSize();
                            const row = Math.floor(index / size);
                            const col = index % size;
                            const isEven = (row + col) % 2 === 0;
                            const isRevealed = revealed[index];

                            return (
                                <div key={index}
                                    className={`body_board_grid_cell ${isEven ? 'even-cell' : 'odd-cell'}${isRevealed ? '-revealed' : ''}`}
                                    onClick={() => handleClick(index)}>
                                    {isRevealed ? (cell === '-1' ? '💣' : cell) : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;