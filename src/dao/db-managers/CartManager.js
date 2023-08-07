import cartModel from "../models/cart.model.js"

class CartManager {

    //Listar todos los carritos
    async getCarts() {
        const carts = await cartModel.find().lean().populate("owner");
        return carts;
    }

    //Agregar nuevo Carrito
    async addCart(products, owner) {
        const result = await cartModel.create({products: products, owner:owner});
        return result;
    }

    // Agregar un arreglo de productos al carrito

    async addArrayProducts (cid, dataToUpdate) {
        const cart = await cartModel.findById(cid);
        cart.products.splice(0);
        cart.products.push(dataToUpdate);
        return cart.save();
    }

    // Actualizar un producto de un Carrito con la QTY especificada

    async addProductQty (cid, pid, quantity) {
        const cart = await cartModel.findById(cid);
        pid = JSON.stringify(pid);
        const existingProduct = cart.products.find((p) => JSON.stringify(p.pid) === pid);
        let updatedProducts;
        if (existingProduct) {
            updatedProducts = cart.products.map((p) => {
                if (JSON.stringify(p.pid) === pid) {
                    return {
                        ...p,
                        quantity: quantity,
                    }
                }
                return p;
            });
        } else {
        pid = JSON.parse(pid);
        updatedProducts = [...cart.products, {pid, quantity: 1}];
    }
    cart.products = updatedProducts; 
    return cart.save();
    };

    // Agregar una unidad de producto al carrito
    async addProduct (cid, pid) {
        const cart = await cartModel.findById(cid);
        pid = JSON.stringify(pid);
        const existingProduct = cart.products.find((p) => JSON.stringify(p.pid) === pid);
        let updatedProducts;
        if (existingProduct) {
            updatedProducts = cart.products.map((p) => {
                if (JSON.stringify(p.pid) === pid) {
                    return {
                        ...p,
                        quantity: p.quantity + 1,
                    }
                }
                return p;
            });
        } else {
        pid = JSON.parse(pid);
        updatedProducts = [...cart.products, {pid: pid, quantity: 1}];
        }
        cart.products = updatedProducts; 
        return cart.save();
    };

    // Agregar un producto al carrito
    async deleteProduct (cid, pid) {
        updatedProducts = cart.products.map((p) => {
            if (JSON.stringify(p.pid) === pid) {
                return {
                    ...p,
                    quantity: p.quantity + quantity,
                }
            }
            return p;
        });
        return cart.save();
    };

    //Obtener un carrito por ID
    getCartById = async (cid) => {
        const populateLog = {path: 'products..product.pid'}
        const cartFind = await cartModel.findById(cid)
        return cartFind;
    }
    getCartByOwner = async (owner) => {
        const cartFind = await cartModel.find({owner: owner})
        return cartFind;
    }
};

export default CartManager;