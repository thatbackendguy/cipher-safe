const mongoose = require("mongoose");

var passwordSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		owner: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Password", passwordSchema);