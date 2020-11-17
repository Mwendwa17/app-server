const  { AuthenticationError } = require('apollo-server');

const jsonwt = require('jsonwebtoken');
const { SECRET_KEY } =  require('../config');

module.exports = (context) => {
     // context = {...header}
     const authHeader = context.req.headers.authorization;
     if (authHeader) {
          const token = authHeader.split('Bearer ')[1];
          if (token) {
               try {
                    const user =  jsonwt.verify(token, SECRET_KEY);
                    return user;
               } catch (err) {
                    throw new AuthenticationError('Invalid or expired token');
               }
          }
          throw new Error('Authentication token must be \'Bearer [token]');
     }
     throw new Error('Authorization header not provided');
}
