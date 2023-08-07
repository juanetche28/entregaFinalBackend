import chatModel from "../../dao/models/messages.model.js"

class chatManager {
    async createChat(user, message) {
        const chatCreated =  chatModel.create({user, message})
        return chatCreated;
    }
}

export default chatManager;