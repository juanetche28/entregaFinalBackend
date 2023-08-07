import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketsSchema = new mongoose.Schema({
    code: String,
    purchase_datetime: String,
    amount:Number,
    purchaseInfo: [],
    purchaser:{
        type:String,
        required:true
    }
});

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);