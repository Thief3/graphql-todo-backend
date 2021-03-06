import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

// Should be in a .env file.
const SECRET_KEY = "secret!";

export const queries = {
  // Get all users.
  getUsers: async function (_: any, __: any, context: any) {
    //return context.req.user;
    Auth.requireSpecificAuth(context.username, "admin");
    return userModel.find({});
  },
  // Get yourself.
  me: async function (_: any, __: any, context: any) {
    Auth.requireAuth(context);
    return await userSchema.methods.getUser(context.id);
  },
  // Login and recieve a token, which needs to be put into a header.
  loginUser: async function (parent: any, args: { username: string, password: string }) {
    return await userModel.findOne({ username: args.username })
      .then(async function (doc: any) {
        var correctPassword = await Auth.compare(args.password, doc.password)

        if (correctPassword === true) {
          const token = jwt.sign({
            id: doc._id,
            username: doc.username
          },
            SECRET_KEY, { expiresIn: '1y' }
          )
          return {
            code: 200,
            message: "Login successful, token created.",
            success: true,
            user: doc,
            token: token
          };
        } else {
          return {
            code: 200,
            message: "Login failed, no token created.",
            success: false,
            user: null,
            token: null
          }
        }
      })
      .catch(async function (err) {
        return {
          code: 200,
          message: "Login failed, no token created.",
          success: false,
          user: null,
          token: null
        }
      })
  }
}

export default queries;