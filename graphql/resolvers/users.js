const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
     return jsonwt.sign(
          {
               id: user.id,
               email: user.email,
               username: user.username,
          },
          SECRET_KEY,
          { expiresIn: '1h' }
     );
}

module.exports = {
     Mutation: {
          // login mutation
          async login(_, { username, password }) {
               const { errors , valid } = validateLoginInput(username, password);
               if (!valid) {
                    throw new UserInputError('Errors', { errors });
               }
               // check user
               const user = await User.findOne({ username });
               if (!user) {
                    errors.general = 'User not found';
                    throw new UserInputError('User not found', { errors });
               }
               // check password
               const match = await bcrypt.compare(password, user.password);
               if (!match) {
                    errors.general = 'Incorrect password';
                    throw new UserInputError('Incorrect password', { errors });
               }
               // login user - assign token
               const token =  generateToken(user);
               return {
                    ...user._doc,
                    id: user._id,
                    token
               };
          },
          // register mutation
          async register(_, { registerInput : { email, username, password, confirmPassword } } ) {
               // validate user data
               const { valid, errors } = validateRegisterInput( email, username, password, confirmPassword);
               if (!valid) {
                    throw new UserInputError('Errors', { errors })
               }
               // make sure user doesn't exist
               const user = await User.findOne({ username });
               if (user) {
                    throw new UserInputError('Username not available', {
                         errors: {
                              // TODO: username: `${username} username is taken`;
                              username: 'This username is taken'
                         }
                    })
               }
               // hash password create auth token
               password = await bcrypt.hash(password, 12);
               const newUser = new User({
                    email,
                    username,
                    password,
                    createdAt: new Date().toISOString()
               });
               const res = await newUser.save();
               // generate token
               const token =  generateToken(res);
               return {
                    ...res._doc,
                    id: res._id,
                    token
               };
          }
     }
}
