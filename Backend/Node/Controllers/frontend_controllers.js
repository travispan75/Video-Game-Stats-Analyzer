const mongoose = require('mongoose')

let date = new Date()

const getMostRecentDoc = async (req, res) => {
    const db = mongoose.connection.db;
    const cleanedData = db.collection('cleaneddata')
    let month = date.getMonth() + 1
    let month_string = month.toString().padStart(2, '0')
    let year = date.getFullYear()
    let id = `${month_string}-${year}`
    let document = await cleanedData.findOne({ _id: id })
    
    while (!document) {
        month -= 1
        if (month == 0) {
            month = 12
            year -= 1
        }
        month_string = month.toString().padStart(2, '0')
        id = `${month_string}-${year}`
        document = await cleanedData.findOne({ _id: id })
    }

    return document
}

const getStats = async (req, res) => {
    let document = await getMostRecentDoc()

    const { top_ten_pokemon, bottom_ten_pokemon, overrated, underrated, top_twenty_items, pokemon_info } = document;

    res.status(200).json({
        top_ten_pokemon, bottom_ten_pokemon, overrated, underrated, top_twenty_items, pokemon_info
    });
}

const getPkmnStats = async (req, res) => {
    const { id } = req.params
    let document = await getMostRecentDoc()
    const pkmnStats = document.pokemon_info[id]

    res.status(200).json({ [id]: pkmnStats })
}

module.exports = {
    getStats,
    getPkmnStats
}