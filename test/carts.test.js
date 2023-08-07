import mongoose from "mongoose";
import cartModel from "../src/dao/models/cart.model.js";
import CartManager from "../src/dao/db-managers/CartManager.js"
import Assert from "assert";
import chai from "chai";
import { options } from "../src/config/options.js";

const assert = Assert.strict;
const expect = chai.expect;

//generar el contexto describe de la clase Users Managers
describe("Testing para la clase Users Managers",()=>{

    before(async function(){
        await mongoose.connect(options.mongoDB.url);
        this.CartsDao = new CartManager();
    });

    // beforeEach(async function(){
    //     await cartModel.deleteMany();
    // });

    it("El metodo get de la clase Carts debe obtener los carritos en formato de Array",async function(){
        const result = await this.CartsDao.getCarts();
        assert.strictEqual(Array.isArray(result),true);  // Valida que results.docs sea un Array
    });

    it("El dao debe agregar un carrito vacio por default", async function(){
        const result = await this.CartsDao.addCart();
        assert.ok(result._id);  // Valida que haya generado el ObjetcId caracteristico de MongoDB
    });

    it("Al agregar un nuevo carrito, éste debe tener un array de productos",async function(){
        const result = await this.CartsDao.addCart();
        const cartDB = await this.CartsDao.getCartById(result._id);
        assert.ok(cartDB.products); // Valida que exista el campo "Products"
        assert.strictEqual(Array.isArray(cartDB.products),true);  // Valida que cartDB.products sea un Array
    });

});