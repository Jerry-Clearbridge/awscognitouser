const express = require('express')
const { create, login, verifyEmail, createMultitudeUsers } = require('../controllers/userController')
const router = express.Router()

router.post('/create', create)

router.post('/login', login)

router.post('/verifyemail', verifyEmail)

router.post('/createmultitudeusers', createMultitudeUsers)

module.exports = router