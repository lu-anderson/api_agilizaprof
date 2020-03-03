const express = require('express')

const Index = require('./controllers/index')
const Users = require('./controllers/Users')
const Session = require('./controllers/Session')
const Classes = require('./controllers/Classes')
const Diaries = require('./controllers/Diaries')
const DiariesOfContents = require('./controllers/DiariesOfContent')

const adminAuth = require('./middlewares/adminAuth')
const auth = require('./middlewares/auth')

const routes = express.Router()

routes.get('/',Index.index)


//Users
routes.post('/users', Users.validations , Users.store)
routes.get('/users',adminAuth, Users.index)
routes.get('/users/withDataForSaveInSigEduca', adminAuth, Users.getWithDataForSaveInSigEduca)

//Session
routes.post('/auth', Session.auth)
//Modificar essa rota
routes.post('/admin', Session.adminAuth)


//Classes
routes.post('/classes/:userId', adminAuth, Classes.store)
//routes.get('/classes/withDataForSaveInSigEduca/:userId', adminAuth, Classes.getWithDataForSaveInSigEduca)

routes.get('/classes', auth, Classes.index)

//Diaries
routes.get('/diaries/savedInMongo/:userId', adminAuth, Diaries.getWithStatusSavedInMongoDB)

routes.post('/diaries', auth, Diaries.store)
routes.get('/diaries/saveInSigEduca', auth, Diaries.getWithStatusSaveInSigEduca)
routes.put('/diaries/saveInSigEduca', adminAuth, Diaries.setWithStatusSavedInSigEduca)
routes.put('/diaries/setFinishedWithTrue', auth, Diaries.setFinishedWithTrue)
routes.put('/diaries/update', auth, Diaries.update)

//DiariesOfContents
routes.post('/diariesOfContents', auth, DiariesOfContents.store)







module.exports = routes