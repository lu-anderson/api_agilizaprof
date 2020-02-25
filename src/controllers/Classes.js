const Classe = require('../models/Classe')
const User = require('../models/User')
const winston = require('winston')

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: './src/err/error.log', level: 'error', json: true }),
      new winston.transports.Console()
    ]
})

module.exports = {
    //Apenas o core tem como armazenar turmas, e não precisa estar autenticado para tal
    //Por isso que é passado no parâmetro o id do usuário.    
    async store(req, res){
        try {
            const { classes } = req.body

            const user = await User.findById(req.params.userId)

            if(!classes) throw 'Classes not found'

            await Promise.all(classes.map(async (classe) => {
                const currentClasse = new Classe({
                    ...classe,
                    _user: req.params.userId
                })

                await currentClasse.save()

                user._classes.push(currentClasse)
            }))

            await user.update({
                $set: {
                    savedClasses: true
                }
            })

            await user.save()
            res.status(201).json({ msg: 'Success in add new Classes!'})
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in add classes (classes/store)',
                stack: error.stack,
                date: Date.now(),                    
            })

            return res.status(500).json({ error: 'Error in add classes'})
        }
    },
    
    async index(req, res){
        try {
            const classes = await Classe.find({_user: req.userId})

            return res.status(200).send(classes)
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in find classes (classes/index)',
                stack: error.stack,
                date: Date.now(),                    
            })

            return res.status(500).json({error: 'Erro ao buscar todas as turmas!'})
        }
    },

    /*async getWithDataForSaveInSigEduca(req, res){
        try {
            const classes = await Classe.find({
                    "_user": req.params.userId,
                    "exitsDataForSaveInSigEduca": true
                },
                {
                    "_id": 1
                }   
            ) 

            return res.status(200).send(classes)               

        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in get classes with data for save in SigEduca',
                stack: error.stack,
                date: Date.now(),                    
            })

            return res.status(500).json({ error: 'Error in get classes with data for save in SigEduca'})
        }
    }*/
}

