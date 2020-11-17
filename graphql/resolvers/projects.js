const  { AuthenticationError, UserInputError } = require('apollo-server');

const Project = require('../../models/Project');
const checkAuth = require('../../utils/auth');

function auth_user (user) {
     return JSON.stringify(user);
}

module.exports = {
     Query: {
          async getProjects(){
               try {
                    const projects = await Project.find().sort({ createdAt: - 1 });
                    return  projects;
               } catch (err) {
                    throw new Error(err);
               }
          },
          async getProject(_, { projectId }){
               try {
                    const project = await Project.findById(projectId);
                    if (project) {
                         return project;
                    } else {
                         throw new Error('Project not found');
                    }
               } catch (err) {
                    throw new Error('Project not found');
               }
          }
     },
     Mutation: {
          // create project mutation
          async createProject(_, { title, description }, context){
               const user = checkAuth(context);
               if (title.trim() === '') {
                    throw new Error('Project must have a title');
               }
               const newProject = new Project({
                    title,
                    description,
                    user: user.id,
                    username: user.username,
                    createdAt: new Date().toISOString()
               });
               // save post
               const project = await newProject.save();
               context.pubsub.publish('NEW PROJECT', {
                    newProject: project
               });
               return project;
          },
          // delete project mutation
          async deleteProject(_, { projectId }, context){
               const user = checkAuth(context);
               try {
                    const project = await Project.findById(projectId);
                    if (auth_user(user.id) === auth_user(project.user)) {
                         await project.delete();
                         return 'Project deleted successfully';
                    } else {
                         throw new AuthenticationError('Action not allowed');
                    }
               } catch (err) {
                    throw new Error(err);
               }
          },
          // create comment
          async createComment(_, { projectId, body}, context){
               const user = checkAuth(context);
               if (body.trim() === '') {
                    throw new UserInputError('Empty comment', {
                         errors: {
                              body: 'Comment cannot be empty'
                         }
                    });
               }
               const project = await Project.findById(projectId);
               if (project) {
                    project.comments.unshift({
                         body,
                         user: user.id,
                         username: user.username,
                         createdAt: new Date().toISOString()
                    });
                    await project.save();
                    return project;
               } else {
                    throw new UserInputError('Project not found');
               }
          },
          // delete comment
          async deleteComment(_, { projectId, commentId }, context){
               const { id } = checkAuth(context);
               const project = await Project.findById(projectId);
               if (project) {
                    const commentIndex = project.comments.findIndex(c => c.id === commentId);
                    if (auth_user(project.comments[commentIndex].user) === auth_user(id)) {
                         project.comments.splice(commentIndex, 1);
                         await project.save();
                         return project;
                    } else {
                         throw new AuthenticationError('Action not allowed');
                    }
               } else {
                    throw new UserInputError('Project not found');
               }
          },
          async likeProject(_, { projectId }, context){
               const { id, username } = checkAuth(context);
               const project = await Project.findById(projectId);
               if (project) {
                    if (project.likes.find((like) => auth_user(like.user) === auth_user(id))) {
                         // project already like unlike
                         project.likes = project.likes.filter((like) => auth_user(like.user) !== auth_user(id));
                    } else {
                         // project not liked like
                         project.likes.push({
                              id,
                              user: id,
                              username: username,
                              createdAt: new Date().toISOString()
                         });
                    }
                    await project.save();
                    return project;
               } else {
                    throw new UserInputError('Project not found');
               }
          }
     },
     Subscription: {
          newProject: {
               subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW PROJECT')
          }
     }
};
