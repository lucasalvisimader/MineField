// css
import './Header.css';
import '../../custom/Color.css'

// react
import { useState } from 'react'

// mui
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const Header = () => {
    const [age, setAge] = useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };

    return (<>
        <div className="header__container">
            <FormControl sx={{ m: 1, minWidth: 80 }}>
                <Select labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={age}
                    onChange={handleChange}
                    autoWidth>
                    <MenuItem value={0}>Fácil</MenuItem>
                    <MenuItem value={1}>Médio</MenuItem>
                    <MenuItem value={2}>Difícil</MenuItem>
                </Select>
            </FormControl>
        </div>
    </>);
}

export default Header;