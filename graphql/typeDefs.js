const { gql } = require('apollo-server');

module.exports = gql`
     type Project {
          id: ID!
          user: ID!
          title: String!
          description: String!
          username: String!
          createdAt: String!
          comments: [Comment]!
          likes: [Like]!
          commentCount: Int!
          likeCount: Int!
     }
     type Comment {
          id: ID!
          user: ID!
          username: String!
          body: String!
          createdAt: String!
     }
     type Like {
          id: ID!
          user: ID!
          username: String!
          createdAt: String!
     }
     type User {
          id: ID!
          email: String!
          token: String!
          username: String!
          createdAt: String!
     }
     input RegisterInput {
          email: String!
          username: String!
          password: String!
          confirmPassword: String!
     }
     type Query {
          getProjects: [Project]
          getProject(projectId: ID!): Project
     }
     type Mutation {
          register(registerInput: RegisterInput): User!
          login(username: String!, password: String!): User!
          createProject(title: String!, description: String!): Project
          deleteProject(projectId: ID!): String!
          createComment(projectId: ID!, body: String!): Project!
          deleteComment(projectId: ID!, commentId: ID!): Project!
          likeProject(projectId: ID!): Project!
     }
     type Subscription {
          newProject: Project!
     }
`;
