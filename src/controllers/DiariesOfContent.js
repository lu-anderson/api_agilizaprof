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

            let response = {
                diariesOfContentsSaved: {
                    classId: '',
                    diariesOfContents: []
                },
                diariesOfContentsNotSaved: {
                    classId: '',
                    diariesOfContents: []
                }
            }

            await Promise.all(
                diariesOfContentsForStore.map(async classe => {
                    const classeInMongo = await Classe.findById(classe.classId)

                    if(!classeInMongo) throw {stack: `Class not found`}

                    classe.diariesOfContents.map(diary => {
                        const existDiary = classeInMongo.diariesOfContents.findIndex(val => val.date === diary.date)
                        if(existDiary === -1){
                            classeInMongo.diariesOfContents.push(diary)  
                            if( !response.diariesOfContentsSaved.classId) response.diariesOfContentsSaved.classId = classe.classId                           
                            response.diariesOfContentsSaved.diariesOfContents.push(diary.date)
                        }else{
                            if( !response.diariesOfContentsNotSaved.classId) response.diariesOfContentsNotSaved.classId = classe.classId
                            response.diariesOfContentsNotSaved.diariesOfContents.push(diary.date)
                        }                       
                    })

                    classeInMongo.exitsDataForSaveInSigEduca = true

                    await classeInMongo.save()
                }) 
            )

            return res.status(200).send(response)
            
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
