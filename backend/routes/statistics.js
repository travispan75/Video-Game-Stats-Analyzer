const express = require('express')
const router = express.Router()

const {
    getStats,
    getPkmnStats
} = require('../controllers/frontend_controllers')

router.get('/:id', getPkmnStats)

router.get('/', getStats)

module.exports = router