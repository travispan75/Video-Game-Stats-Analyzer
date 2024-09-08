
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { useEffect, useState } from 'react';
import { useStats } from '../contexts/StatsContext'

const Statistics = () => {
    const { pkmnStats, loading } = useStats();

    useEffect(() => {
        const adjustFontSize = () => {
            const cells = document.querySelectorAll('.leaderboard-cell h1')
            cells.forEach(cell => {
                let fontSize = 18
                cell.style.fontSize = `${fontSize}px`
                while ((cell.scrollWidth > cell.clientWidth || cell.scrollHeight > cell.clientHeight) && fontSize > 5) { 
                    fontSize--
                    cell.style.fontSize = `${fontSize}px`
                }
            })
        }
        if (!loading) {
            adjustFontSize()
        }
    }, [loading])

    if (loading) {
        return (
            <div className="loading-screen">
                <Navbar/>
                <div className="loading">
                    <div></div>
                    <div></div>
                    <div></div> 
                </div>
            </div>
        )
    }

    return (
        <div className="statistics">
            <Navbar/>
            <div className="column-container">
                <div className="column1">
                    <div className="leaderboard">
                        <h1 className="title">Pokemon Usage Leaderboard</h1>
                        <div className="leaderboard-podium">
                            {Object.entries(pkmnStats['top_ten_pokemon']).slice(0, 3).map(([pokemonName, pokemonStats], index) => (
                                <div key={index} className=
                                {`leaderboard-cell 
                                    ${index === 0 ? 'first' : ''} 
                                    ${index === 1 ? 'second' : ''} 
                                    ${index === 2 ? 'third' : ''}`
                                }>
                                    {index === 0 && <img src="../images/crown.png" className="crown" style={{ width: '50px' }}></img>}
                                    <h1 className="podium-num">{index + 1}</h1>
                                    <img src={`../images/pokemon/${pokemonStats["ID"]}.png`} alt="../images/pokemon/0.png"></img>
                                    <h1 className="percent">{Math.round(pokemonStats.usage * 100)}%</h1>
                                    <h1>{pokemonName}</h1>
                                </div>
                            ))}
                        </div>
                        <div className="leaderboard-list">
                            {Object.entries(pkmnStats['top_ten_pokemon']).slice(3, 10).map(([pokemonName, pokemonStats], index) => (
                                <div className={`row ${index === 6 ? 'last' : ''}`}>
                                    <h1 className="podium-num">{index + 4}</h1>
                                    <img src={`../images/pokemon/${pokemonStats["ID"]}.png`} alt="" />
                                    <h1 className="pokemon-name">{pokemonName}</h1>
                                    <h1 className="percent">{Math.round(pokemonStats.usage * 100)}%</h1>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="column2">
                    <div className="search-bar-container">
                        <SearchBar pkmnInfo={pkmnStats['pokemon_info']} unusedInfo={pkmnStats['unused_pokemon']}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Statistics;