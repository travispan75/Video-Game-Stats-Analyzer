import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Randomizer from './pages/Randomizer';
import Statistics from './pages/Statistics';

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
