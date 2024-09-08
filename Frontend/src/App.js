import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Randomizer from './pages/Randomizer';
import Statistics from './pages/Statistics';
import PokemonStats from './pages/PokemonStats';
import { StatsProvider } from './contexts/StatsContext';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/calculator" element={<Calculator/>}/>
        <Route path="/randomizer" element={<Randomizer/>}/>
        <Route path="/statistics/*" element={<StatsProvider><StatisticsRoutes/></StatsProvider>}/>
      </Routes>
    </div>
  );
}

const StatisticsRoutes = () => (
  <Routes>
    <Route path="/" element={<Statistics/>} />
    <Route path=":name" element={<PokemonStats/>} />
  </Routes>
);

export default App;
