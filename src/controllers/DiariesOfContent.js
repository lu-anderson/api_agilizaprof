const Classe = require('../models/Classe')
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
    async store(req, res){
        try {
            const {diariesOfContentsForStore} = req.body
            diariesOfContentsForStore.map(async classe => {
                const classeInMongo = await Classe.findById(classe.classId)
                classe.diariesOfContents.map(async diary => {
                    await classeInMongo.diariesOfContents.push(diary)                        
                })
                classeInMongo.exitsDataForSaveInSigEduca = true

                await classeInMongo.save()

                return res.status(200).json({msg: 'Diários de conteúdos salvos com sucesso!'})
            })
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in store diariesOfContent (diariesOfContent/store)',
                stack: error.stack,
                date: Date.now(),                    
            })

            return res.status(500).json({ error: 'Error in store diaries Of Content'})
        }
    },
    async update(req, res){
        
    }
}
