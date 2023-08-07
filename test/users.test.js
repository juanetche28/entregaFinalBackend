import mongoose from "mongoose";
import {userModel} from "../src/dao/models/user.model.js";
import UserManager from "../src/dao/db-managers/UserManager.js"
import Assert from "assert";
import { options } from "../src/config/options.js";
import chai from "chai";

const assert = Assert.strict;
const expect = chai.expect;

//generar el contexto describe de la clase Users Managers
describe("Testing para la clase Users Managers",()=>{

    before(async function(){
        await mongoose.connect(options.mongoDB.url);
        this.usersDao = new UserManager();
    });

    // beforeEach(async function(){
    //     await userModel.deleteMany();
    // });

    it("El metodo get de la clase Users debe obtener los usuarios en formato de Array",async function(){
        const result = await this.usersDao.getUsers();
        assert.strictEqual(Array.isArray(result.docs),true);  // Valida que results.docs sea un Array
    });

    it("El dao debe agregar un usuario correctamente en la base de datos", async function(){
        let mockUser = {
            firstName:"Juan Manuel",
            lastName:"Fangio",
            email:"fangio@gmail.com",
            password:"1234"
        };
        const result = await this.usersDao.save(mockUser);
        assert.ok(result._id);  // Valida que haya generado el ObjetcId caracteristico de MongoDB
    });

    it("Al agregar un nuevo usuario, éste debe crearse con un rol por defecto",async function(){
        let mockUser = {
            firstName:"Juan Manuel",
            lastName:"Fangio",
            email:"fangio@gmail.com",
            password:"1234"
        };
        const result = await this.usersDao.save(mockUser);
        const userDB = await this.usersDao.getUserById(result._id);
        expect(userDB).to.have.property("rol");
        // assert.ok(userDB.rol);
    });

});