const projectsResolvers = require('./projects');
const usersResolvers = require('./users');


module.exports = {
     Project: {
          commentCount: (parent) => parent.comments.length,
          likeCount: (parent) => parent.likes.length
     },
     Query: {
          ...projectsResolvers.Query
     },
     Mutation: {
          ...usersResolvers.Mutation,
          ...projectsResolvers.Mutation
     },
     Subscription: {
          ...projectsResolvers.Subscription
     }
}
