import {userModel} from "../models/user.model.js"
import {GetUserDto} from "../dto/user.dto.js"


export default class UserManager {

    async updateUser(userId, dataToUpdate){
        const updatedUser = await userModel.findOneAndUpdate({_id: userId}, dataToUpdate, {new: true})
        updatedUser.save();
    ;}
 

    getUsers = async () => {
        const users = await userModel.paginate()
        return users;
      };
    
    save = (doc) =>{
        return userModel.create(doc);
    }   
    
    getUserById = async (userId) => {
        const userFind = await userModel.findById(userId);
        const result = new GetUserDto(userFind); // Le pase un "filtro" creado en DTO por el cual no muestro datos sensibles (password) al que solicita la info
        return result;
    }

    async deleteUser(userId) {
        const result = await userModel.deleteOne({_id: userId});
    }

}

