import { checkRole } from "../middlewares/auth.js";
import productsController from "../controllers/products.controller.js"


function deleteProduct() {
    console.log("pase por aqui")
    productsController.DeleteProductController
}

export default deleteProduct();

