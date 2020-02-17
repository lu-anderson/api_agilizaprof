const mongoose = require('mongoose')


const UserSchema = mongoose.Schema({
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
	createdAt: {
		type: Date,
		default: Date.now,
	},
	schools: [],
	_classes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Classe'}]
})

const User = mongoose.model('User', UserSchema)

module.exports = User