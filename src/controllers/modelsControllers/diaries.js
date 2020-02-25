
const status =  "savedInRealm"||"savedInMongo"||"savedInSigEduca",

//método post - recebe esses dados
const diariesForStore = [
    {
        classId: String,
        diaries: [
            {
                date: Date,
                workload: Number,
                students: [],
                status: "savedInMongo"||"savedInSigEduca",
                finished: Boolean
            }
        ]
    }
]

//método post - recebe esses dados
const diariesOfContentsForStore = [
    {
        classId: String,
        diariesOfContents: [
            {
                date: Date,
                content: String,
                status: "saveInMongo"||"saveInSigEduca",
                finished: Boolean
            }
        ]
    }
]

//método put - recebe esses dados
const diariesForUpdate = [
    {
        classId: String,
        diaries: [
            {
                date: Date,                
                status: "saveInMongo"||"saveInSigEduca",
                finished: Boolean
            }
        ]
    }
]

//método put - recebe esses dados
const diariesOfContentForUpdate = [
    {
        classId: String,
        diariesOfContents: [
            {
                date: Date,                
                status: "saveInMongo"||"saveInSigEduca",
                finished: Boolean
            }
        ]
    }
],

const diariesWithStatusSaveInSigEduca