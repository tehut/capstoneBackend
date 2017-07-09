var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var invoiceSchema = new Schema({
	child: String,
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	date_applied: Date,
	paid: Boolean,
	tags: [String],
	dateAdded : { type: Date, default: Date.now },
})

// export 'Animal' model so we can interact with it in other files
module.exports = mongoose.model('Invoice',invoiceSchema);
