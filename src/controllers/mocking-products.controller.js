import {faker} from "@faker-js/faker";
import productMockingModel from "../dao/models/productMocking.model.js"

const { commerce, image, database, string, datatype } = faker;
// mockingProducts debera Generar de forma aleatoria 100 productos random "fake" 

export const createdMockingProducts = async (req, res) => {
    const deleteProductMocking = await productMockingModel.deleteMany();  // Lo coloque para "resetear" esta collections y no se acumulen otros 100
    for (var i = 0; i < 100; i++) {
        const createdProductMocking = await productMockingModel.create({
            title: commerce.productName(), 
            description: commerce.productDescription(),
            code: database.mongodbObjectId(),
            price: parseFloat(commerce.price()),
            status: datatype.boolean(),
            stock: parseInt(string.numeric(2)), // solo quiero numeros de 2 digitos "entre cero y 99"
            category: "Test - Product Mock",
            thumbnail: image.urlLoremFlickr({ category:'food'}),
        });
        createdProductMocking.save();
    };
    res.status(201).send({status: "Ok", payload: "Finish"});
}

