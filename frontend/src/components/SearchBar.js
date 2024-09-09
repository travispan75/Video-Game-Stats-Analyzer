import { useState } from "react";
import { NavLink } from "react-router-dom";

const SearchBar = ({ pkmnInfo, unusedInfo }) => {
    const [input, setInput] = useState("")
    const [searchSuggestions, setSearchSuggestions] = useState([])
    const [isFocused, setIsFocused] = useState(false)

    const handleSearch = (value) => {
        setInput(value)
        const query = value.toLowerCase().replace(/[\s-]/g, '');
        const results = Object.keys(pkmnInfo).filter(key => {
            const keyTokens = key.toLowerCase().split('-');
            for (let i = 0; i < keyTokens.length; i++) {
                if (query.length <= keyTokens[i].length && keyTokens[i].startsWith(query)) {
                    return true
                }
            }
            const keyString = key.toLowerCase().replace(/[\s-]/g, '');
            return query.length <= keyString.length && keyString.startsWith(query);
        });

        const additionalResults = Object.keys(unusedInfo).filter(key => {
            const keyTokens = key.toLowerCase().split('-');
            for (let i = 0; i < keyTokens.length; i++) {
                if (query.length <= keyTokens[i].length && keyTokens[i].startsWith(query)) {
                    return true;
                }
            }
            const keyString = key.toLowerCase().replace(/[\s-]/g, '');
            return query.length <= keyString.length && keyString.startsWith(query);
        });

        setSearchSuggestions([...results, ...additionalResults]);
    };

    const handleFocus = () => {
        setIsFocused(true)
        handleSearch(input)
    };

    const handleBlur = () => {
        setIsFocused(false)
    };

    const preventBlur = (e) => {
        e.preventDefault();
    };

    return (
        <div className="search-bar">
            <img src="../images/search.png" alt="" />
            <input className="search-box" placeholder="Search for Pokemon" value={input} onChange={(e) => handleSearch(e.target.value)} onFocus={handleFocus} onBlur={handleBlur}></input>
            {isFocused && (
                <div className="search-suggestions" onMouseDown={preventBlur}>
                    {searchSuggestions.length > 0 ? (
                        <ul>
                            {searchSuggestions.map((result, index) => (
                                <li key={index}><NavLink to={`${result}`}>{result}</NavLink></li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-results">
                            <p>No Gen 9 OU Pokémon found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchBar;