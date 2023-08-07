import { Router, json } from "express";
import { checkRole, checkAuthenticated } from "../middlewares/auth.js";
import cartsController from "../controllers/carts.controller.js"


const router = Router();
router.use(json());

router.get("/", cartsController.viewCartsController); // Muestro todos los carritos

router.post("/", checkAuthenticated, cartsController.newCartController); //La ruta raíz POST / deberá crear un nuevo carrito

router.get("/:cid", checkAuthenticated, cartsController.productsCartController); // La ruta GET /:cid deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados.

router.put("/:cid", checkRole(["user", "premium"]), cartsController.updateCartController); // PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos.

router.put("/:cid/product/:pid", checkRole(["user"]), cartsController.updateQtyProductController); //PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body

router.post("/edit/:cid/product/:pid", checkRole(["user", "premium"]), cartsController.updateQtyProductController); // misma funcion que la anterior, pero coloco post ya que html no acepta el method put

router.post("/product/:pid", checkRole(["user", "premium"]), cartsController.addOneUnitProductController); //La ruta POST /product/:pid deberá agregar una unidad del producto al arreglo “products” del changuito del usuario (si no tiene changuito, le crea uno)

router.delete("/:cid/product/:pid", checkRole(["user", "premium"]), cartsController.deleteProductController); // DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.

router.get("/delete/:cid/product/:pid", checkRole(["user", "premium"]), cartsController.deleteProductController); // misma funcionalidad que la anterior, uso get porque html no me acepta el method "delete"

router.delete("/:cid", checkRole(["user", "premium"]), cartsController.deleteAllProductsController); // DELETE api/carts/:cid deberá eliminar todos los productos del carrito

router.get("/delete/:cid", checkRole(["user", "premium"]), cartsController.deleteAllProductsController); // misma funcionalidad que la anterior, uso get porque html no me acepta el method "delete"

router.post("/:cid/purchase", cartsController.purchaseUser); // "/:cid/purchase" debera generar la compra del carrito "cid" con su respectivo ticket


export default router;
