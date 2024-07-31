import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Calculator from './Calculator';
import Randomizer from './Randomizer';
import Statistics from './Statistics';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/calculator" element={<Calculator/>}/>
        <Route path="/randomizer" element={<Randomizer/>}/>
        <Route path="/statistics" element={<Statistics/>}/>
      </Routes>
    </div>
  );
}

export default App;
