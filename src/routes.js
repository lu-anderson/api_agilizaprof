const express = require('express')

const Index = require('./controllers/index')
const Users = require('./controllers/Users')
const Session = require('./controllers/Session')
const Classes = require('./controllers/Classes')

const adminAuth = require('./middlewares/adminAuth')
const auth = require('./middlewares/auth')

const routes = express.Router()

routes.get('/',Index.index)


//Users
routes.post('/users', Users.validations , Users.store)
routes.get('/users',adminAuth, Users.index)

//Session
routes.post('/auth', Session.auth)
//Modificar essa rota
routes.post('/admin', Session.adminAuth)


//Classes
routes.post('/classes/:userId', adminAuth, Classes.store)
routes.get('/classes', auth, Classes.index)








module.exports = routes