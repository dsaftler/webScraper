const mongoose = require("mongoose");

var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
      type: String,
      required: true,
      unique: true
   },
  summary: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

const Article = mongoose.model("Article", ArticleSchema);
ArticleSchema.plugin(uniqueValidator);
module.exports = Article;
