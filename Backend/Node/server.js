require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')
const readline = require('readline')

const statisticsRoutes = require('./routes/statistics')
const calculatorRoutes = require('./routes/calculator')
const randomizerRoutes = require('./routes/randomizer')
const homeRoutes = require('./routes/home')
const { checkData, getData, cleanData }  = require('./Controllers/data_controller')
const app = express() 

process.on('SIGINT', async () => {
    console.log('Closing mongoDB connection.');
    await mongoose.disconnect();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('connected to mongodb & listening on port', process.env.PORT)
        }) 
        checkData();
    })
    .catch((e) => {
        console.log(e)
    })

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/statistics', statisticsRoutes)

app.use('/calculator', calculatorRoutes)

app.use('/randomizer', randomizerRoutes)

app.use('/', homeRoutes)

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

console.log('Listening for commands. Type "fetchStats" to trigger the task.')