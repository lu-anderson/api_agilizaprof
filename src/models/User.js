const mongoose = require('mongoose')


const User = mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
	loginSigEduca: {
		type: String,
		required: true,
		unique: true
	},	
	passwordSigEduca: {
		type: String,
        required: true,
        select: false,		
    },
    email: {
        type: String,
        required: true,
    },
	cell: {
		type: Number,		
	},
	isPedagogo: {
		type: Boolean,
		default: false
	},
	subscriptionPlan: String,
	schools: [],
	_classes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Classe'}],
	existDataForSaveInRealm: {
		type: Boolean,
		default: false
	},
	exitsDataForSaveInSigEduca: {
		type: Boolean,
		default: false
	},
	savedDataFromSigEduca: {
		type: Boolean,
		default: false
	},
	needUpdate: {
		type: Boolean,
		default: false
	}
}, {
    timestamps: true
})


module.exports =  mongoose.model('User', User)