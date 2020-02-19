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
            const {diariesForStore} = req.body
            await Promise.all( 
                diariesForStore.map(async classe => {             
                    const classeInMongo = await Classe.findById(classe.classId)

                    if(!classeInMongo) throw `Class not found`
                    classe.diaries.map(diary => {
                        classeInMongo.diaries.push(diary)                        
                    })
                    classeInMongo.exitsDataForSaveInSigEduca = true

                    await classeInMongo.save()                    
                })
            )
            return res.status(201).json({msg: 'Diários salvos com sucesso!'})
        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in store diaries (diaries/store)',
                stack: error.stack ? error.stack : error,
                date: Date.now(),                    
            })

            return res.status(500).json({ error: 'Error in store diaries'})
        }
    },

    async update(req, res){
        try {
            const { diariesForUpdate } = req.body
            
            await Promise.all(
                diariesForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diaries.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diaries.date": diary.date}, {
                                $set: {
                                    "diaries.$.status": diary.status,
                                    "diaries.$.finished": diary.finished,
                                    existDataForSaveInRealm: true
                                }
                            })
                        })
                    )
                })
            )

            return res.status(200).send('ok')

        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in store diaries (diaries/store)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).send('error')
        }


    }
}
