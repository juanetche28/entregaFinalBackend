import mongoose from "mongoose";
import productModel from "../src/dao/models/product.model.js";
import ProductManager from "../src/dao/db-managers/ProductManager.js"
import Assert from "assert";
import { options } from "../src/config/options.js";
import chai from "chai";

const assert = Assert.strict;
const expect = chai.expect;

//generar el contexto describe de la clase Users Managers
describe("Testing para la clase Products Managers",()=>{

    before(async function(){
        await mongoose.connect(options.mongoDB.url);
        this.productsDao = new ProductManager();
    });

    // beforeEach(async function(){
    //     await userModel.deleteMany();
    // });

    it("El metodo getProducts de la clase Products debe obtener los productos en formato de Array",async function(){
        const result = await productModel.find().lean();
        assert.strictEqual(Array.isArray(result),true);  // Valida que results.docs sea un Array
    });

    it("El dao debe agregar un producto correctamente en la base de datos", async function(){
        let mockProduct = {
            title: "Durazno Actualizado",
            description: "Esto es un Durazno",
            code: "COD004",
            price: 60,
            status: "true",
            stock: 50,
            category: "especiales",
            thumbnail: [
                "Sin Imagen",
                "Sin Imagen2_Actualizado"
            ]
        };
        const result = await this.productsDao.addProduct(mockProduct.title, mockProduct.description, mockProduct.code, mockProduct.price, mockProduct.status, mockProduct.stock, mockProduct.category, mockProduct.thumbnail);
        // console.log("result: ", result)
        const productDB = await this.productsDao.getProductById(mockProduct.code);
        console.log("productDB",productDB)
        assert.ok(productDB._id);  // Valida que haya generado el ObjetcId caracteristico de MongoDB
    });

    it("Al agregar un nuevo Producto, éste debe crearse con un owner por defecto",async function(){
        let mockProduct = {
            title:"Manzana Verde",
            description: "Esto es una Manzana Verde",
            code:"COD005",
            price: 100,
            status:"true",
            stock:15,
            category:"Difusores",
            thumbnail: []
        };
        const result = await this.productsDao.addProduct(mockProduct.title, mockProduct.description, mockProduct.code, mockProduct.price, mockProduct.status, mockProduct.stock, mockProduct.category, mockProduct.thumbnail);
        const productDB = await this.productsDao.getProductById(mockProduct.code);
        // console.log("productDB",productDB);
        assert.ok(productDB.owner);
    });

});