require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')
const readline = require('readline')
const PkmnStatsSchema = require('./models/Stats')

const statisticsRoutes = require('./routes/statistics')
const calculatorRoutes = require('./routes/calculator')
const randomizerRoutes = require('./routes/randomizer')
const homeRoutes = require('./routes/home')

const app = express()

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('connected to mongodb & listening on port', process.env.PORT)
        })
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

const get_data = async () => {
    let date = new Date()
    let month = 1;
    let year = date.getFullYear() - 1;
    const base_url = 'https://www.smogon.com/stats/'
    while (year < date.getFullYear() || (year === date.getFullYear() && month < date.getMonth() + 1)) {
        try {
            month_string = String(month).padStart(2, '0')
            let extension_url = `${year}-${month_string}/chaos/gen9ou-1825.json`
            const response = await axios.get(base_url + extension_url)
            //await PkmnStatsSchema.deleteMany({})
            let result = await PkmnStatsSchema.updateOne({_id: extension_url}, response.data, {upsert: true});
            //console.log(JSON.stringify(response.data, null, 2).slice(0, 20000))
            if (result.upsertedCount > 0) {
                console.log('Fetched stats for', extension_url);
            } else {
                console.log('Updated stats for', extension_url)
            }
        } catch (e) {
            console.error(e)
        }
        month++;
        if (month > 12) {
            month = 1
            year++;
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.on('line', (input) => {
    if (input.trim() === 'fetchStats') {
        get_data()
    }
})

console.log('Listening for commands. Type "fetchStats" to trigger the task.')