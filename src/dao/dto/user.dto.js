// No uso "CreateContactDto". Solo pruebo el patron. Lo que hace es pasar un filtro a la informacion recibida por frontend antes de guardarla en la base de datos MongoDB 
export class CreateContactDto{
    constructor(user){
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.fullName = `${user.firstName} ${user.lastName}`;
        this.rol = user.rol;
        this.email = user.email;
        this.cart = user.cart;
        this.password = user.password;
        this.status = user.status;
    }
};


// Este patron lo utilizo para el metodo "http://localhost:8080/api/users/:uid" y filtro la informacion a mostrar de la base de datos, que no traiga informacion basura o confidencial.

export class GetUserDto{
    constructor(userDB){
        this.fullName = `${userDB.firstName} ${userDB.lastName}`;
        this.rol = userDB.rol;
        this.email = userDB.email;
        this.status = userDB.status;
    }
};