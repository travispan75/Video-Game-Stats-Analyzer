import Navbar from "./Components/Navbar";
import CalcImg from "./images/calculator.png";
import RandImg from "./images/dice.png";
import StatImg from "./images/statistics.png";

const Home = () => {
    const iconStyle = { backgroundColor:'transparent', width:'100px'};

    return (
        <>
            <Navbar/>
            <div className="Home">
                <div className="box-container">
                    <div className="box">
                        <img src={CalcImg} alt="" style={iconStyle}/>
                        <h2>Calculate damage for different matchups</h2>
                    </div>
                    <div className="box">
                        <img src={RandImg} alt="" style={iconStyle}/>
                        <h2>Randomize your teams for any format</h2>
                    </div>
                    <div className="box">
                        <img src={StatImg} alt="" style={iconStyle}/>
                        <h2>Look at updated statistics for showdown</h2>
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default Home;