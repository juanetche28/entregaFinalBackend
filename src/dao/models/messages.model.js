import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
        user: {type: String},
        message: {type: String}
});

const chatModel = mongoose.model("messages", chatSchema);

export default chatModel;
