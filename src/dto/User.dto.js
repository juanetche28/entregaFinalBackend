export default class UserDTO {
    static getUserTokenFrom = (user) =>{
        return {
            name: `${user.firstName} ${user.lastName}`,
            rol: user.rol,
            email:user.email,
            status:user.status
        }
    }
}