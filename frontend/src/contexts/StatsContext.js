import React, { createContext, useState, useEffect, useContext } from 'react';

const StatsContext = createContext();

export const useStats = () => useContext(StatsContext);

export const StatsProvider = ({ children }) => {
    const [pkmnStats, setPkmnStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('https://video-game-stats-analyzer.onrender.com/api/statistics');
            const json = await response.json();

            if (response.ok) {
                setPkmnStats(json);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <StatsContext.Provider value={{ pkmnStats, loading }}>
            {children}
        </StatsContext.Provider>
    );
};
