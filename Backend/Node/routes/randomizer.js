const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.json({random: 'hi'})
})

module.exports = router