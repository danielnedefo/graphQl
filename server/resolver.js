const User = require('./schema')
const resolvers = {
    Query:{
       getAllUsers(){
           return User.find()
       }
    }
}