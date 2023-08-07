import fs from "fs";
import __dirname from "../../utils.js";
import { getNextId } from "./utils.js";

const path = __dirname + "/dao/file-managers/files/Carts.json"  // "__dirname" me trae la ruta hasta ./src y le sumo el resto de la ruta

class CartManager {

    //Listar todos los carritos
    async getCarts() {
        try {
            const carts = await fs.promises.readFile(path, "utf-8");
            return JSON.parse(carts);
        } catch (e) {
            return [];
        }
    }

    //Agregar nuevo Carrito
    async addCart() {
        const carts = await this.getCarts(); 
        const newCart = {
            idCart: getNextId(carts),
            products: []
        };

        const updateCarts = [...carts, newCart];
        await fs.promises.writeFile(path, JSON.stringify(updateCarts));
    }

    // Agregar un producto al carrito
    async addProduct(cid, pid) {
        cid = Number(cid);
        pid = Number(pid);
        const carts = await this.getCarts();
        const cartFind = (carts.find((p) => p.idCart === parseInt(cid)));
        const productFind = (cartFind.products.find((p) => p.product === parseInt(pid)))

        // Si no encuentra el ID del producto lo agrego con "quantity = 1"; si lo encuentra aumento quantity++ 
        if (!productFind) {

            const newProduct = {
                product: pid,
                quantity: 1
            };

            // Actualizo el "products" con el nuevo "product"
            const products = cartFind.products 
            const updateProduct = [...products, newProduct];

            // Actualizo el "cartFind" con el nuevo "product"
            cartFind.products = updateProduct;

            // Actualizo mi base de datos "Carts.json" con el carrito actualizado 
            const updateCarts = [...carts];
            await fs.promises.writeFile(path, JSON.stringify(updateCarts));

        } else { 
            // Si entra por este camino es porque debo actualizar solo la cantidad quantity en +1

            const quantity = productFind.quantity;
            const newQuantity = quantity + 1;  // Aumento en +1 la cantidad
            productFind.quantity = newQuantity;  // Actualizo la Cantidad en mi array de productos
            
            // Actualizo mi base de datos "Carts.json" con el carrito actualizado
            const updateCarts = [...carts];
            await fs.promises.writeFile(path, JSON.stringify(updateCarts))
        }
    }
    //Obtener un carrito por ID
    getCartById = async (cid) => {
        const carts = await this.getCarts();
        cid = Number(cid);
        const result = (carts.find((p) => p.idCart === cid));
        return new Promise ((resolve, reject) => {
            if (result == null) {
                reject("Cart id not found.");
            }
            resolve(result);
        });
    }
}

export default CartManager;