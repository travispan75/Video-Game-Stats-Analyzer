require('dotenv').config()
console.log('ya yeet: ', process.env.MONGO_URI)

const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')
const readline = require('readline')
const cron = require('node-cron');

const statisticsRoutes = require('./routes/statistics')
const calculatorRoutes = require('./routes/calculator')
const randomizerRoutes = require('./routes/randomizer')
const { checkData, getData, cleanData }  = require('./controllers/data_controller')

process.on('SIGINT', async () => {
    console.log('Closing mongoDB connection.');
    await mongoose.disconnect();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('connected to mongodb & listening on port', process.env.PORT)
        }) 

        cron.schedule('0 0 3 * *', () => {
            checkData();
        });
    })
    .catch((e) => {
        console.log(e)
    })

const app = express() 
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/statistics', statisticsRoutes)

app.use('/api/calculator', calculatorRoutes)

app.use('/api/randomizer', randomizerRoutes)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.on('line', (input) => {
    const state = mongoose.connection.readyState;
    if (input.trim() === 'cleanData') {
        if (state == 1) {
            cleanData()
        } else {
            console.log("mongoDB not connected yet")
        }
    } else if (input.trim() === 'fetchStats') {
        if (state == 1) {
            getData()
        } else {
            console.log("mongoDB not connected yet")
        }
    }
})

console.log('Listening for commands. Type "fetchStats" to get stats or cleanData to clean data.')