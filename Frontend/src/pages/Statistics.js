import Navbar from "../Components/Navbar";
import { useEffect, useState } from 'react'

const Statistics = () => {
    const [pkmnStats, setPkmnStats] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/statistics')
            const json = await response.json()

            if (response.ok) {
                setPkmnStats(json)
            }
        }

        fetchData()
    }, [])

    console.log(pkmnStats)

    return (
        <div className="Statistics">
            <Navbar/>
            <h2>{ JSON.stringify(pkmnStats, null, 2) }</h2>
        </div>
    );
}
 
export default Statistics;