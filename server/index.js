const { createServer } = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { ApolloServer, gql } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const User = require("./schema");
const mongoose = require("mongoose");
require("dotenv").config();

(async () => {
  const PORT = 4000;
  const pubsub = new PubSub();
  const app = express();
  const httpServer = createServer(app);

  const root = {
    getAllUsers: () => {
      return User.find();
    },
    getUser: (params) => {
      return User.findById(params.id);
    },
    createUser: (user) => {
      console.log(user);
      return User.create(user.input);
    },
    updateUser: ({ id, user }) => {
      return User.findByIdAndUpdate(id, user);
    },
    addPost: ({ id, post }) => {
      const user = User.findById(id);
      const { posts } = user;
      const updatedPost = [...posts, post];
      user.posts = updatedPost;
      return User.findByIdAndUpdate(id, user);
    },
    removePost: ({ id, index }) => {
      const user = User.findById(id);
      const { posts } = user;
      const deletePost = posts.map(({ id }) => id !== index);
      user.posts = deletePost;
      return User.findByIdAndUpdate(id, user);
    },
  };
  // Schema definition
  const typeDefs = gql`
  type User {
    _id: ID
    name: String
    email: String
    phone: String
    posts: [Post]
  }
  type Post {
    id: ID
    title: String
    year: Int
  }
  input UserInput{
    id: ID
    name: String!
    email: String!
    phone: String!
    posts: [PostInput]
  }
  input PostInput{
    id: ID
    title: String!
    year: Int!
  }
  type Query {
    getAllUsers: [User]
    getUser(id: ID): User
  }
  type Mutation{
   createUser(input:UserInput):User
   updateUser(id:ID,input:UserInput):User
   addPost(id:ID,input:PostInput):User
   removePost(id:ID,index:ID):User
  }
  type Subscription{
    newUser:User!
  }
  
  `;

  // Resolver map
  const resolvers = {
    Query: {
      getAllUsers() {
        return User.find();
      },
    },
    Mutation: {
      createUser(parent, args, context, info) {
        pubsub.publish("USER_ADDED", { newUser: args.input });
        return User.create(args.input);
      },
    },
    Subscription: {
      newUser: {
        subscribe:  () => pubsub.asyncIterator(["USER_ADDED"])
      },
    },
  };

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { schema, execute, subscribe, rootValue: root },
    { server: httpServer, path: server.graphqlPath }
  );
  const { DB_HOST } = process.env;
  mongoose
    .connect(DB_HOST, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(async () => {
      httpServer.listen(PORT, () => {
        console.log(
          `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
        );
        console.log(
          `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
        );
      });
    })
    .catch((error) => console.log(error));
})();
