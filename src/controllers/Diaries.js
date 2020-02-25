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
    //Arrumar a response
    async store(req, res){
        try {
            const {diariesForStore} = req.body

            let response = {
                diariesSaved: {
                    classId: '',
                    diaries: []
                },
                diariesNotSaved: {
                    classId: '',
                    diaries: []
                }
            }

            await Promise.all( 
                diariesForStore.map(async classe => {             
                    const classeInMongo = await Classe.findById(classe.classId)

                    if(!classeInMongo) throw `Class not found`

                    classe.diaries.map(diary => {
                        const existDiary = classeInMongo.diaries.findIndex(val => val.date === diary.date)
                        if(existDiary === -1){
                            classeInMongo.diaries.push(diary) 
                            if( !response.diariesSaved.classId) response.diariesSaved.classId = classe.classId                           
                            response.diariesSaved.diaries.push(diary.date)
                        }else{
                            if( !response.diariesNotSaved.classId) response.diariesNotSaved.classId = classe.classId
                            response.diariesNotSaved.diaries.push(diary.date)
                        }                  
                    })
                    classeInMongo.exitsDataForSaveInSigEduca = true
                    await classeInMongo.save()                    
                })
            )

            if(response.diariesSaved.diaries.length !== 0){
                await User.updateOne({_id: req.userId}, 
                    {
                        $set: {
                            exitsDataForSaveInSigEduca: true
                        }
                    }    
                )
            }
            

            return res.status(201).json({msg: response})
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

    async getWithStatusSaveInSigEduca(req, res){
        try {
            const status = 'savedInSigEduca'
            const classes = await Classe.find({_user: req.userId}, 
                {"diaries": 1, "_id": 1}
            )

            let diaries = []    
            for (let index = 0; index < classes.length; index++) {
                let diariesFiltered = []
                for (let j = 0; j < classes[index].diaries.length; j++) {
                    if(classes[index].diaries[j].status === status && !classes[index].diaries[j].finished){
                        diariesFiltered.push({
                            date: classes[index].diaries[j].date,
                            status: classes[index].diaries[j].status,
                            finished: classes[index].diaries[j].finished
                        })
                    }                    
                }

                if(diariesFiltered.length !== 0 ){
                    diaries.push({
                        classId: classes[index]._id,

                        diaries: diariesFiltered
                    })
                }
                
            }

            return res.status(200).send(diaries)
        } catch (error) {
            logger.error({
                status: 500,
                message: "Error in get diaries with status 'saveInSigEduca' (diaries/getDiariesWithStatusSaveInSigEduca)",
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({error: "Error in get diaries with status 'saveInSigEduca'"})
        }
    },

    async getWithStatusSavedInMongoDB(req, res){
        try {
            const status = 'savedInMongo'
            const classes = await Classe.find({"_user": req.params.userId}, 
                {"diaries": 1, "codeId": 1, "codeSeries": 1, "_id": 1}
            )

            let diaries = []    
            for (let index = 0; index < classes.length; index++) {
                let diariesFiltered = []
                for (let j = 0; j < classes[index].diaries.length; j++) {
                    if(classes[index].diaries[j].status === status && !classes[index].diaries[j].finished){
                        diariesFiltered.push(classes[index].diaries[j])
                    }                    
                }

                if(diariesFiltered.length !== 0 ){
                    diaries.push({
                        _id: classes[index]._id,
                        codeId: classes[index].codeId,
                        codeSeries: classes[index].codeSeries,
                        diaries: diariesFiltered                        
                    })
                }
                
            }
            return res.status(200).send(diaries)
        } catch (error) {
            logger.error({
                status: 500,
                message: "Error in get diaries with status 'saveInMongo' (diaries/getDiariesWithStatusSaveInMongoDB",
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: "Error in get diaries with status 'saveInMongo'"})
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

            return res.status(200).json({mgs: 'Diários atualizados com sucesso!'})

        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in store diaries (diaries/store)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários'})
        }
    }
}
