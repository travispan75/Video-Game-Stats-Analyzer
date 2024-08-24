const mongoose = require('mongoose')
const axios = require('axios')
const PkmnStatsSchema = require('../models/Stats')
const { exec } = require('child_process')

const pyEnv = '..\\Python\\.venv\\Scripts\\python.exe'
const pyFile = '..\\Python\\data_cleaner.py'

const base_url = 'https://www.smogon.com/stats/'
let date = new Date()

const checkData = async () => {
    const db = mongoose.connection.db;
    try {
        const cleanedData = db.collection('cleaneddata')
        const idObjects = await cleanedData.find({}, { projection: { _id: 1 } }).toArray();
        const idList = idObjects.map(doc => doc._id)
        let cleanDataFlag = true
        let month = date.getMonth() + 1
        month = month.toString().padStart(2, '0')
        let year = date.getFullYear()
        for (let i = 0; i < idList.length; i++) {
            if (idList[i] == `${month}-${year}`) {
                cleanDataFlag = false
            }
        }
        if (cleanDataFlag) {
            console.log("Cleaning data...")
            await cleanData()
        }
    } catch (error) {
        console.error('Error listing collections:', error)
    }
}

const getData = async () => {
    month = 1
    year = date.getFullYear() - 1
    while (year < date.getFullYear() || (year === date.getFullYear() && month < date.getMonth() + 1)) {
        try {
            month_string = String(month).padStart(2, '0')
            let extension_url = `${year}-${month_string}/chaos/gen9ou-1825.json`
            const response = await axios.get(base_url + extension_url)
            //await PkmnStatsSchema.deleteMany({})
            if (response.status === 200) {
                let result = await PkmnStatsSchema.updateOne({_id: extension_url}, response.data, {upsert: true});
            }
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

const cleanData = async () => {
    month = date.getMonth()
    month = (month - 1) % 12 + 1
    month_string = month.toString().padStart(2, '0')
    year = date.getFullYear()
    let extension_url = `${year}-${month_string}/chaos/gen9ou-1825.json`
    const response = await axios.get(base_url + extension_url)
    if (response.status === 200) {
        let result = await PkmnStatsSchema.updateOne({_id: extension_url}, response.data, {upsert: true});
        exec(`${pyEnv} ${pyFile}`, (e, stdout, stderr) => {
            if (e) {
                console.error(e)
            } else if (stderr) {
                console.error(stderr)
            } else {
                console.log('Data Cleaned')
            }
        }) 
    }
}

module.exports = {
    checkData,
    getData,
    cleanData
};