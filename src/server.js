require('dotenv/config')
const express = require('express')
const routes = require('./routes')
const mongoose = require('mongoose')

const app = express()

//INSTALAR E CONFIGURAR O CORS()

if(process.env.NODE_ENV === 'dev'){
    console.log('IN DEVELOPMENT')
}


mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(express.json())

app.use(routes)

app.listen(process.env.PORT || 3333, () => {    
    console.log('Servidor ON')
})

