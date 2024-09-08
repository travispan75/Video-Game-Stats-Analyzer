import { useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { useStats } from '../contexts/StatsContext'
import PastUsageChart from '../components/PastUsageChart';

const statLabels = [
    "HP",
    "ATK",
    "DEF",
    "SPA",
    "SPDEF",
    "SPE"
];

const normalizeName = (str) => {
    return str.split(/([- ]+)/).map(
        word => {
            if (word === '-' || word === ' ') {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    ).join('');
};

const checkName = (name, stats) => {
    if (name in stats["pokemon_info"]) {
        return (
            <div className="pokemonStats">
                <div className="row">
                    <div className="pkmn-info1">
                        <div className="pkmn-graphs">
                            <PastUsageChart pastUsage={[stats["pokemon_info"][name]["usage"]].concat(stats["pokemon_info"][name]["historic usage"]).reverse()} currTime={stats["_id"]} name={name}/>
                        </div>
                        <div className="row info-box-cluster">
                            <div className="info-box tall">
                                <h3>Top EV Spreads</h3>
                                {stats["pokemon_info"][name]["top_ev_spreads"].map((spread, index) => (
                                    <div className="row" key={`ability-${spread[0]}-${index}`}>
                                        <span>{spread[0]}</span>
                                        <span>{(spread[1] * 100).toFixed(2)}%</span>
                                    </div>
                                ))}    
                            </div>
                        </div>
                        <div className="row info-box-cluster">
                            
                        </div>
                    </div>
                    <div className="pkmn-info2">
                        <div className="row main-info">
                            <div className="column">
                                <h1>{name}</h1>
                                <h2>{(stats["pokemon_info"][name]["usage"]*100).toFixed(2)}%</h2>
                                <img src={`../images/pokemon/${stats["pokemon_info"][name]["ID"]}.png`} alt="" className="pkmn-sprite"/>
                                <div className="typing">
                                    {stats["pokemon_info"][name]["typing"].map((type, index) => (
                                        <span key={`${type}-${index}`} className={`type ${type}`}>{normalizeName(type)}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="row stats">
                                <div className="column stats-label">
                                    {stats["pokemon_info"][name]["stats"].map((stat, index) => {
                                        return <span className="stat-label">{statLabels[index]}</span>
                                    })}
                                </div>
                                <div className="column stats-num">
                                    {stats["pokemon_info"][name]["stats"].map((stat) => {
                                        const baseWidth = 40;
                                        const increment = 5; 
                                        const width = baseWidth + (Math.floor(stat / 5) * increment);

                                        return <div className="bar" style={{ width: `${width}px` }}>{stat}</div>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="row info-box-cluster">
                            <div className="info-box">
                                <h3>Top Abilities</h3>
                                {stats["pokemon_info"][name]["top abilities"].map((ability, index) => (
                                    <div className="row" key={`ability-${ability[0]}-${index}`}>
                                        <span>{ability[0]}</span>
                                        <span>{(ability[1] * 100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="info-box">
                                <h3>Top Moves</h3>
                                {stats["pokemon_info"][name]["top moves"].map((move, index) => (
                                    <div className="row" key={`move-${move[0]}-${index}`}>
                                        <span>{move[0]}</span>
                                        <span>{(move[1] * 100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="info-box">
                                <h3>Top Items</h3>
                                {stats["pokemon_info"][name]["top items"].map((item, index) => (
                                    <div className="row" key={`item-${item[0]}-${index}`}>
                                        <span>{item[0]}</span>
                                        <span>{(item[1] * 100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="info-box">
                                <h3>Top Teras</h3>
                                {stats["pokemon_info"][name]["top teras"].map((tera, index) => (
                                    <div className="row" key={`tera-${tera[0]}-${index}`}>
                                        <span>{normalizeName(tera[0])}</span>
                                        <span>{(tera[1] * 100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="info-box long">
                                <h3>Top Teammates</h3>
                                {stats["pokemon_info"][name]["top teammates"].map((teammate, index) => (
                                    <div className="row" key={`teammate-${teammate}-${index}`}>
                                        <NavLink to={`/statistics/${teammate[0]}`}>{teammate[0]}</NavLink>
                                        <span>{(teammate[1]*100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (name in stats["unused_pokemon"]) {
        return (
            <div>
                <h1>{name}</h1>
                <h2>unused</h2>
            </div>
        )
    } else {
        return (
            <div>
                <h1>{name}</h1>
                <h2>Not in gen 9 ou. Maybe you spelled the name incorrectly?</h2>
            </div>
        )
    }
}

const PokemonStats = () => {
    const { pkmnStats, loading } = useStats();
    const { name } = useParams();

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

    const normalName = normalizeName(name)

    return (
        <div className="pokemon-stats">
            <Navbar/>
            <div>
                {checkName(normalName, pkmnStats)}
            </div>
        </div>
    );
}

export default PokemonStats;
