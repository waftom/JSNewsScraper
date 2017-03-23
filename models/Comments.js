// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Comments schema
var CommentsSchema = new Schema({
  // Just a string
  title: {
    type: String
  },
  // Just a string
  body: {
    type: String
  },
  // This only saves one comment's ObjectId, ref refers to the Comments model
  article: {
    type: Schema.Types.ObjectId,
    ref: "Articles"
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the comments
// These ids are referred to in the Article model

// Create the Comments model with the CommentsSchema
var Comments = mongoose.model("Comments", CommentsSchema);

// Export the Comments model
module.exports = Comments;
