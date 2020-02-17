const express = require('express')

const Index = require('./controllers/index')
const Users = require('./controllers/Users')

const routes = express.Router()

routes.get('/',Index.index)


//Users
routes.post('/users', Users.validations , Users.store)

routes.get('/users', Users.index)








module.exports = routes