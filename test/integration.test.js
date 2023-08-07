import chai from "chai";
import supertest from "supertest";
// import ProductManager from "../src/dao/db-managers/ProductManager.js"
// import UserManager from "../src/dao/db-managers/UserManager.js"
// import CartManager from "../src/dao/db-managers/CartManager.js"

import {app} from "../src/app.js";

const expect = chai.expect;
const requester = supertest(app);
const mockUserLoginAdmin = {email:"prueba@coder.com",password:"1234"};

describe("Testing de App eCommerce",()=>{

    describe("Test el modulo de eCommerce",()=>{

        it("El endpoint post /api/products crea un producto correctamente",async function(){

            // Para crear un producto primero debo estar loggueado como administrador.

            const responseLogin = await requester.post("/api/sessions/login").send(mockUserLoginAdmin);
            expect(responseLogin.statusCode).to.be.equal(302); // Codigo 302 indica que fue redireccionado (a /profile o /Failure-request)
            console.log("responseLogin check",responseLogin);
            const {headers} = responseLogin;
            const checkLogin = headers.location; // Deberia contener la ruta a la cual fue redireccionado (Si es login exitoso redirige a /profile)
            // console.log("_data check",checkLogin);  // deberia ser "/profile"
            expect(checkLogin).to.be.equal('/profile')  // Controlo que se haya loggeado exitosamente

            const productMock = {
                title: "Durazno Actualizado",
                description: "Esto es un Durazno",
                code: "COD014",
                price: 60,
                status: "true",
                stock: 50,
                category: "especiales",
                thumbnail: [
                    "Sin Imagen",
                    "Sin Imagen2_Actualizado"
                ]
            };

            const result = await requester.post("/api/products/").send(productMock);
            // console.log("result productMock /api/products", result);
            const {statusCode,_body} = result;
            expect(statusCode).to.be.equal(200);
            expect(_body.status).to.be.equal("error"); // Necesitas estar Authenticado
        });
     });

    describe("Test avanzado-flujo autenticacion de un usuario", ()=>{
        before(async function(){
            // await userModel.deleteMany({});
        });

        it("Se debe registrar al usuario correctamente",async function(){
            const mockUser = {
                firstName:"Juan Manuel",
                lastName:"Fangio",
                email:"fangio@gmail.com",
                password:"1234"
            };
            const responseSignup = await requester.post("/api/sessions/signup").send(mockUser);
            expect(responseSignup.statusCode).to.be.equal(302);
        });

        it("Debe loguear al usuario y devolver una cookie",async function(){
            const responseLogin = await requester.post("/api/sessions/login").send(mockUserLoginAdmin);
            const cookieResponse = responseLogin.headers["set-cookie"][0];
            // console.log("cookie check", cookieResponse);
            const cookieData={
                name:cookieResponse.split("=")[0],
                value: cookieResponse.split("=")[1]
            }
            console.log("cookie check", cookieData.name);  // Deberia devolver backendCookie
            this.cookie = cookieData;
            expect(this.cookie.name).to.be.equal("backendCookie");
        });

        it("Al llamar /current obtenemos la cookie y la informacion del usuario",async function(){
            const currentResponse = await requester.get("/api/sessions/current").set("Cookie",[`${this.cookie.name}=${this.cookie.value}`]);
            // console.log("currentResponse",currentResponse);
            console.log("mockUserLoginAdmin.email",mockUserLoginAdmin.email);
            expect(currentResponse.body.payload.email).to.be.equal(mockUserLoginAdmin.email);
        });
    });

});