const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.json({calc: 'hi'})
})

module.exports = router