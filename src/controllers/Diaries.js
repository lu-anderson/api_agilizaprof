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
                diariesSaved: [],
                diariesNotSaved: {
                    classId: '',
                    diaries: []
                }
            }

            await Promise.all( 
                diariesForStore.map(async classe => {             
                    const classeInMongo = await Classe.findById(classe.classId)

                    if(!classeInMongo) throw `Class not found`

                    response.diariesSaved.push({
                        classId: classe.classId,
                        diaries: []
                    })

                    classe.diaries.map(diary => {
                        const existDiary = classeInMongo.diaries.findIndex(val => val.date === diary.date)
                        if(existDiary === -1){
                            classeInMongo.diaries.push(diary)    

                            const existClasseInResponse = response.diariesSaved
                                            .findIndex(val => val.classId === classe.classId)

                            response.diariesSaved[existClasseInResponse].diaries.push({
                                date: diary.date
                            })                                          
                        }else{
                            //Alterrar
                            if( !response.diariesNotSaved.classId) response.diariesNotSaved.classId = classe.classId
                            response.diariesNotSaved.diaries.push(diary.date)
                        }                  
                    })
                    await classeInMongo.save()                    
                })
            )

            let existDiariesSaved = false
            for (let index = 0; index < response.diariesSaved.length; index++) {
                if(response.diariesSaved[index].diaries.length !== 0){
                    existDiariesSaved = true
                }                
            }

            if(existDiariesSaved){
                await User.updateOne({_id: req.userId}, 
                    {
                        $set: {
                            exitsDataForSaveInSigEduca: true
                        }
                    }    
                )
            }
            setTimeout(() => {
                return res.status(201).json({msg: response})
            }, 1000)
            
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
                message: "Error in get diaries with status 'saveInSigEduca' (diaries/getWithStatusSaveInSigEduca)",
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

    async setWithStatusSavedInSigEduca(req, res){
        try {
            const { diariesForUpdate } = req.body
            
            await Promise.all(
                diariesForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diaries.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diaries.date": diary.date}, {
                                $set: {
                                    "diaries.$.status": 'savedInSigEduca',
                                    "diaries.$.finished": diary.finished
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
                message: 'Error in set With Status Saved In SigEduca (diaries/setWithStatusSavedInSigEduca)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários'})
        }
    },

    async setFinishedWithTrue(req, res){
        try {
            const { diariesForUpdate } = req.body
            
            await Promise.all(
                diariesForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diaries.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diaries.date": diary.date}, {
                                $set: {
                                    "diaries.$.finished": true
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
                message: 'Error in set Finished With True (diaries/setFinishedWithTrue)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários'})
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
                                    "diaries.$": diary
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
                message: 'Error in update diaries (diaries/update)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários'})
        }
    }
}
