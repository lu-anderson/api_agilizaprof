const User = require('../models/User')
const winston = require('winston')
const {check, validationResult} = require('express-validator')

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: './src/err/error.log', level: 'error', json: true }),
      new winston.transports.Console()
    ]
})

module.exports = {
    validations: [
        check('name').isString(),
        check('loginSigEduca').isString(),
        check('passwordSigEduca').isString(),
        check('email').isEmail(),
        check('cell').isMobilePhone(),
        check('isPedagogo').isBoolean(),
        check('subscriptionPlan').isString(),
        check('schools').isArray()
    ],

    async store(req, res){
        try {
            const schemaErrors = validationResult(req);
            if (!schemaErrors.isEmpty()) {
                logger.error({
                    status: 400,
                    message: 'express validation failed',
                    stack: schemaErrors.array(),
                    date: Date.now(),                    
                })
                return res.status(403).send(schemaErrors.array())
            }

            const { 
                name,
                loginSigEduca,
                passwordSigEduca,
                email,
                cell,
                isPedagogo,
                subscriptionPlan,
                schools,
            } = req.body

            if (await User.findOne({loginSigEduca})){
                logger.error({
                    status: 400,
                    message: 'Registered User',
                    stack: {},
                    date: Date.now()
                })

                return res.status(400).json({error: "Usuário já cadastrado!"})               
            }                
            
            const user = await User.create({
                name,
                loginSigEduca,
                passwordSigEduca,
                email,
                cell,
                isPedagogo,
                subscriptionPlan,
                schools,
            })

            await user.save()           

            return res.status(200).json({success: "Usuário cadastrado com sucesso!"})
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in store user',
                stack: error.stack,
                date: Date.now()
            })

            return res.status(500).json({unexpectedError: "Erro ao salvar usuário!"})            
        }
    },

    async index(req, res){
        try {
            const users = await User.find()

            return res.status(200).json({users})            
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in find all users',
                stack: error.stack,
                date: Date.now()
            })
            return res.status(500).json({"unexpectedError": "Erro ao buscar todos os usuários!"})
        }        
    },

    async getWithDataForSaveInSigEduca(req, res){
        try {
            const users = await User.find({"exitsDataForSaveInSigEduca": true})

            return res.status(200).send(users)
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in get user with data for save in sigeduca!',
                stack: error.stack,
                date: Date.now()
            })
            return res.status(500).json({ error: "Error in get user with data for save in sigeduca!"})
        }
    }
}


