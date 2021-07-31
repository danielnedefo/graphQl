const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { readFileSync } = require("fs");
const mongoose = require("mongoose");
const User = require("./schema");
require("dotenv").config();

const app = express();
const schemaString = readFileSync("./schema.graphql", { encoding: "utf-8" });
const schema = buildSchema(schemaString);

const root = {
  getAllUsers: () => {
    return User.find();
  },
  getUser: (params) => {
    return User.findById(params.id);
  },
  createUser: ( user ) => {
    console.log(user)
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
  removePost:({ id, index }) => {
    const user = User.findById(id);
    const { posts } = user;
    const deletePost = posts.map(({ id }) => id !== index);
    user.posts = deletePost;
    return User.findByIdAndUpdate(id, user);
  },
};
app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema,
    rootValue: root,
  })
);
const { DB_HOST, PORT = 5000 } = process.env;

mongoose
  .connect(DB_HOST, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(async () => {
    app.listen(PORT);
  })
  .catch((error) => console.log(error));
