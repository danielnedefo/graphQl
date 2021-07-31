const mongoose = require("mongoose")

const {Schema,model} = mongoose;

const userSchema = Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true
    },
    posts:{
        type:Array
    }
})

const User = model('user',userSchema)

module.exports = User