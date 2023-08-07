import { Router, json } from "express";
import { checkRole } from "../middlewares/auth.js";
import productsController from "../controllers/products.controller.js"

const router = Router();
router.use(json());

// Creo todas mis rutas de Products

router.get("/:limit/:page/:sort/:query", productsController.GetProductsController); // La ruta raíz GET / deberá listar todos los productos de la base.

router.get("/:pid", productsController.GetProductByIdController); // La ruta GET /:pid deberá traer sólo el producto con el id proporcionado

router.post("/", checkRole(["admin", "premium"]), productsController.NewProductController); // La ruta raíz POST / deberá agregar un nuevo producto

router.put("/:pid", checkRole(["admin"]), productsController.UpdateProductController); // La ruta PUT /:pid deberá tomar un producto y actualizarlo por los campos enviados desde body. 

router.post("/edit/:pid", checkRole(["admin"]), productsController.UpdateProductController); // similar a anterior, lo creo porque no funciona el method "put" en los form html

router.delete("/:pid", checkRole(["admin", "premium"]), productsController.DeleteProductController); // La ruta DELETE /:pid deberá eliminar el producto con el pid indicado.

router.get("/delete/:pid", checkRole(["admin", "premium"]), productsController.DeleteProductController) // similar a anterior, lo creo porque no funciona el method "delete" en los form html

router.post("/:pid/:email", productsController.deleteProductPremium)  // Esta ruta debera mandar un mail al usuario premium cada vez que se elimine uno de sus productos. 

export default router;
