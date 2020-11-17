const { model, Schema } = require('mongoose');

const projectSchema = new Schema({
     title: String,
     description: String,
     username: String,
     createdAt: String,
     comments: [
          {
               user: {
                    type: Schema.Types.ObjectId,
                    ref: 'users'
               },
               username: String,
               body: String,
               createdAt: String,
          }
     ],
     likes: [
          {
               user: {
                    type: Schema.Types.ObjectId,
                    ref: 'users'
               },
               username: String,
               createdAt: String,
          }
     ],
     user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
     }
});

module.exports = model('Project', projectSchema);
