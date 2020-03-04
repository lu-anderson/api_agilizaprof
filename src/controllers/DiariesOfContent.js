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
    async store(req, res){
        try {
            const {diariesOfContentsForStore} = req.body

            let response = {
                diariesOfContentsSaved: [],
                diariesOfContentsNotSaved: {
                    classId: '',
                    diariesOfContents: []
                }
            }

            await Promise.all(
                diariesOfContentsForStore.map(async classe => {
                    const classeInMongo = await Classe.findById(classe.classId)

                    if(!classeInMongo) throw {stack: `Class not found`}

                    response.diariesOfContentsSaved.push({
                        classId: classe.classId,
                        diariesOfContents: []
                    })

                    classe.diariesOfContents.map(diary => {
                        const existDiary = classeInMongo.diariesOfContents.findIndex(val => val.date === diary.date)
                        if(existDiary === -1){
                            classeInMongo.diariesOfContents.push(diary)  

                            const existClasseInResponse = response.diariesOfContentsSaved
                                                            .findIndex(val => val.classId === classe.classId)

                            response.diariesOfContentsSaved[existClasseInResponse].diariesOfContents.push({
                                date: diary.date
                            })                            
                        }else{
                            //Alterar
                            if( !response.diariesOfContentsNotSaved.classId) response.diariesOfContentsNotSaved.classId = classe.classId
                            response.diariesOfContentsNotSaved.diariesOfContents.push(diary.date)
                        }                       
                    })

                    await classeInMongo.save()
                }) 
            )

            let existDiariesOfContentsSaved = false
            for (let index = 0; index < response.diariesOfContentsSaved.length; index++) {
                if(response.diariesOfContentsSaved[index].diariesOfContents.length !== 0){
                    existDiariesOfContentsSaved = true
                }                
            }

            if(existDiariesOfContentsSaved){
                await User.updateOne({_id: req.userId}, 
                    {
                        $set: {
                            exitsDataForSaveInSigEduca: true
                        }
                    }
                )
            }

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

    async getWithStatusSaveInSigEduca(req, res){
        try {
            const status = 'savedInSigEduca'
            const classes = await Classe.find({_user: req.userId}, 
                {"diariesOfContents": 1, "_id": 1}
            )

            let diariesOfContents = []    
            for (let index = 0; index < classes.length; index++) {
                let diariesOfContentsFiltered = []
                for (let j = 0; j < classes[index].diariesOfContents.length; j++) {
                    if(classes[index].diariesOfContents[j].status === status && !classes[index].diariesOfContents[j].finished){
                        diariesOfContentsFiltered.push({
                            date: classes[index].diariesOfContents[j].date,
                            status: classes[index].diariesOfContents[j].status,
                            finished: classes[index].diariesOfContents[j].finished
                        })
                    }                    
                }

                if(diariesOfContentsFiltered.length !== 0 ){
                    diariesOfContents.push({
                        classId: classes[index]._id,

                        diariesOfContents: diariesOfContentsFiltered
                    })
                }
                
            }

            return res.status(200).send(diariesOfContents)
        } catch (error) {
            logger.error({
                status: 500,
                message: "Error in get diariesOfContents with status 'saveInSigEduca' (diariesOfContents/getWithStatusSaveInSigEduca)",
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
                {"diariesOfContents": 1, "codeId": 1, "codeSeries": 1, "_id": 1}
            )

            let diariesOfContents = []    
            for (let index = 0; index < classes.length; index++) {
                let diariesOfContentsFiltered = []
                for (let j = 0; j < classes[index].diariesOfContents.length; j++) {
                    if(classes[index].diariesOfContents[j].status === status && !classes[index].diariesOfContents[j].finished){
                        diariesOfContentsFiltered.push(classes[index].diariesOfContents[j])
                    }                    
                }

                if(diariesOfContentsFiltered.length !== 0 ){
                    diariesOfContents.push({
                        _id: classes[index]._id,
                        codeId: classes[index].codeId,
                        codeSeries: classes[index].codeSeries,
                        diariesOfContents: diariesOfContentsFiltered                        
                    })
                }
                
            }
            return res.status(200).send(diariesOfContents)
        } catch (error) {
            logger.error({
                status: 500,
                message: "Error in get diariesOfContents with status 'saveInMongo' (diariesOfContents/getDiariesWithStatusSaveInMongoDB",
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: "Error in get diadiariesOfContentsries with status 'saveInMongo'"})
        }
    },

    async setWithStatusSavedInSigEduca(req, res){
        try {
            const { diariesOfContentsForUpdate } = req.body
            console.log(diariesOfContentsForUpdate)
            await Promise.all(
                diariesOfContentsForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diariesOfContents.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diariesOfContents.date": diary.date}, {
                                $set: {
                                    "diariesOfContents.$.status": 'savedInSigEduca',
                                    "diariesOfContents.$.finished": diary.finished
                                }
                            })
                        })
                    )
                })
            )

            return res.status(200).json({mgs: 'Diários de conteúdos atualizados com sucesso!'})

        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in set With Status Saved In SigEduca (diariesOfContents/setWithStatusSavedInSigEduca)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários de conteúdos'})
        }
    },

    async setFinishedWithTrue(req, res){
        try {
            const { diariesOfContentsForUpdate } = req.body
            
            await Promise.all(
                diariesOfContentsForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diariesOfContents.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diariesOfContents.date": diary.date}, {
                                $set: {
                                    "diariesOfContents.$.finished": true
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
                message: 'Error in set Finished With True (diariesOfContents/setFinishedWithTrue)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários'})
        }
    },

    async update(req, res){
        try {
            const { diariesOfContentsForUpdate } = req.body
            
            await Promise.all(
                diariesOfContentsForUpdate.map(async classe => { 
                    await Promise.all(
                        classe.diariesOfContents.map(async (diary) => {
                            await Classe.updateOne({_id: classe.classId, "diariesOfContents.date": diary.date}, {
                                $set: {
                                    "diariesOfContents.$": diary
                                }
                            })
                        })
                    )
                })
            )

            return res.status(200).json({mgs: 'Diários de conteúdos atualizados com sucesso!'})

        } catch (error) {
            logger.error({
                status: 500,
                message: 'Error in update diariesOfContents (diariesOfContents/update)',
                stack: error.stack,
                date: Date.now(),                    
            })
            return res.status(500).json({ error: 'Erro ao atualizar os diários de conteúdos'})
        }
    }
}
