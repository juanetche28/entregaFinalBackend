import chai from "chai";
import { createHash, isValidPassword } from "../src/utils.js";
// import UserDTO from "../src/dto/User.dto.js";

const expect = chai.expect;

describe("test para autenticacion",()=>{

    it("El servicio debe realizar un hasheo efectivo de la contraseña (debe corroborarse que el resultado sea diferente a la contraseña original", async function(){
        const passwordLogin = "1234";
        const efectiveHash = /(?=[A-Za-z0-9@#$%/^.,{}&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/g;
        const passwordHash = await createHash(passwordLogin);
        // console.log("passwordHash",passwordHash);
        expect(efectiveHash.test(passwordHash)).to.be.equal(true);
    });

    it("El hasheo realizado debe poder compararse de manera efectiva con la contraseña original (la comparación debe resultar en true)", async function(){
        const passwordLogin = "1234";
        const passwordHash = await createHash(passwordLogin);
        const mockUser = {
            email:"fangio@gmail.com",
            password:passwordHash
        };
        const result = await isValidPassword(mockUser,passwordLogin);
        expect(result).to.be.equal(true);
    });

    it("Si la contraseña hasheada se altera, debe fallar en la comparación de la contraseña original.", async function(){
        const passwordLogin = "1234";
        const passwordHash = await createHash(passwordLogin);
        const mockUser = {
            email:"Fangio@gmail.com",
            password:passwordHash+"racing"
        };
        const result = await isValidPassword(mockUser,passwordLogin);
        expect(result).to.be.equal(false);
    });
});