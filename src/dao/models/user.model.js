import mongoose from 'mongoose';
import { cartCollection } from "./cart.model.js";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true
    },
    lastName: {
        type:String,
        required:true
    },
    email: {
        type: String,
        unique:true,
        required:true
    },
    age: {
        type: Number,
    },
    password: {
        type:String,
        required:true
    },
    rol: {
        type: String,
        required:true,
        enum:["user","admin","premium"],
        default: 'user',
    },
    documents:{
        type:[
            {
                name:{type:String, required:true},
                reference:{type:String, required:true}
            }
        ],
        default:[]
    },
    last_connection:{
        type: Date, //new Date()
        default: null
    },
    status:{
        type:String,
        required:true,
        enums:["complete","incomplete","pending"],
        default:"pending"
    },
    avatar:{type:String, default:""}
});

userSchema.plugin(mongoosePaginate);

export const userModel = mongoose.model("users",userSchema);