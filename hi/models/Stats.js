const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pokemonDataSchema = new Schema({
    Moves: {type: Map, of: Number},
    Abilities: {type: Map, of: Number},
    Teammates: {type: Map, of: Number},
    "Checks and Counters": {type: Map, of: [Number]},
    usage: Number,
    Items: {type: Map, of: Number},
    Spreads: {type: Map, of: Number},
    "Tera Types": {type: Map, of: Number},
    "Viability Ceiling": [Number]
}, {_id: false});
  
const infoSchema = new Schema({
    "team type": {type: String, default: null},
    cutoff: {type: Number, required: true},
    "cutoff deviation": {type: Number, required: true},
    metagame: {type: String, required: true},
    "number of battles": {type: Number, required: true},
}, {_id: false});
  
const wrapperSchema = new Schema({
    _id: String,
    info: infoSchema,
    data: {type: Map, of: pokemonDataSchema}
});

module.exports = mongoose.model('PkmnStatsSchema', wrapperSchema)