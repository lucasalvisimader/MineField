// Home.js
import './Home.css';
import { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';

const Home = () => {
    const [board, setBoard] = useState([]);
    const [difficulty, setDifficulty] = useState(0);

    const styleSelectDifficulty = {
        color: "var(--background-root)",
        bgcolor: "var(--white-default)",
        borderRadius: "10px",
        width: "20%",
        height: "60%",
        cursor: "pointer",
        border: "none",
        "&:hover": {
            opacity: 0.9
        }
    }

    const generateBoard = (level) => {
        const sizes = [8 ** 2, 12 ** 2, 16 ** 2];
        const minesCount = [10, 25, 50];
        const size = sizes[level];
        const mines = minesCount[level];

        let newBoard = Array(size).fill('-');

        for (let i = 0; i < mines;) {
            const locationMine = Math.floor(Math.random() * size);
            if (newBoard[locationMine] !== '*') {
                newBoard[locationMine] = '*';
                i++;
            }
        }

        setBoard(newBoard);
    }

    const handleChange = (event) => {
        const newDifficulty = Number(event.target.value);
        setDifficulty(newDifficulty);
    }

    const getColumns = () => {
        return [8, 12, 16][difficulty];
    }

    useEffect(() => {
        generateBoard(difficulty);
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
                        }}>
                        {board.map((cell, index) => (
                            <div key={index} className="body_board_grid_cell"
                                style={{
                                    height: ``,
                                    width: ``,
                                }}>
                                {cell === '*' ? '💣' : ''}
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}

export default Home;