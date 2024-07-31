import { NavLink } from 'react-router-dom';
import PokeLogo from '../images/Poke Logo.png';

const Navbar = () => {
    const linkStyle = { fontSize:'18px',fontWeight:'bold',textDecoration:'none',textAlign:"center"};

    return (
        <nav className="navbar">
            <NavLink to="/"><img className='logo' src={PokeLogo} alt=""/></NavLink>
            <ul>
                <li><NavLink to="/calculator" activeClassName="active" style={linkStyle}>CALCULATOR</NavLink></li>
                <li><NavLink to="/randomizer" activeClassName="active" style={linkStyle}>RANDOMIZER</NavLink></li>
                <li><NavLink to="/statistics" activeClassName="active" style={linkStyle}>STATISTICS</NavLink></li>
            </ul>
        </nav>
    );
}
 
export default Navbar;