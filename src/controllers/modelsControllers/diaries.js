const diariesForStore = [
    {
        classId: String,
        diaries: [
            {
                date: Date,
                workload: Number,
                students: [],
                status: "saveInMongo"||"saveInSigEduca",
                finished: Boolean
            }
        ]
    }
]

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
]