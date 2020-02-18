const User = require('../models/User')
const jwt = require('jsonwebtoken')
const winston = require('winston')

const authConfig = require('../config/auth.json')

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: './src/err/error.log', level: 'error', json: true }),
      new winston.transports.Console()
    ]
})

module.exports = {
    async auth(req, res){
        try {
            const {loginSigEduca, passwordSigEduca} = req.body

            const user = await User.findOne({ loginSigEduca })
                            .select('+passwordSigEduca')

            if(!user){
                logger.error({
                    status: 400,
                    message: 'User not found',
                    stack: {},
                    date: Date.now(),  
                })
                return res.status(400).json({error: 'Usuário não encontrado'})
            }
            if(passwordSigEduca !== user.passwordSigEduca){
                logger.error({
                    status: 400,
                    message: 'Password invalid',
                    stack: {},
                    date: Date.now(),  
                })
                return res.status(400).json({error: 'Senha inválida'})
            }

            user.passwordSigEduca = undefined

            const token = jwt.sign(
                {
                    userId: user.id,
                    userName: user.name
                },
                authConfig.secret
            )

            return res.status(200).json({token})
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Erro in auth user',
                stack: error.stack,
                date: Date.now(),  
            })
        }
    },

    async adminAuth(req, res){
        try {
            const {loginSigEduca} = req.body

            const user = await User.findOne({ loginSigEduca })

            if(!user){
                logger.error({
                    status: 400,
                    message: 'User not found',
                    stack: {},
                    date: Date.now(),  
                })
                return res.status(400).json({error: 'Usuário não encontrado'})
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    userName: user.name,
                    admin: true,
                },
                authConfig.secret
            )

            return res.status(200).json({token})
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Erro in auth admin user',
                stack: error.stack,
                date: Date.now(),  
            })
        }
    },
}