import Navbar from "../components/Navbar";

const Home = () => {
    const iconStyle = { backgroundColor:'transparent', width:'100px'};

    return (
        <>
            <Navbar/>
            <div className="Home">
                <div className="box-container">
                    <div className="box">
                        <img src={"../images/calculator.png"} alt="" style={iconStyle}/>
                        <h2>Calculate damage for different matchups</h2>
                    </div>
                    <div className="box">
                        <img src={"../images/dice.png"} alt="" style={iconStyle}/>
                        <h2>Randomize your teams for any format</h2>
                    </div>
                    <div className="box">
                        <img src={"../images/statistics.png"} alt="" style={iconStyle}/>
                        <h2>Look at updated statistics for showdown</h2>
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default Home;