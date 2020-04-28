var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    _id: false,
    userID: { type: String },
    password: String,
    ticket: [[Number]],
  },
  { collection: "collection" }
);

module.exports = mongoose.model("User", UserSchema);
