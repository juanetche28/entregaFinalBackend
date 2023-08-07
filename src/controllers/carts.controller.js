import { CartManager } from "../dao/index.js";
import cartModel from "../dao/models/cart.model.js";
import { ticketsModel } from "../dao/models/ticket.model.js";
import {v4 as uuidv4} from 'uuid';
import {transporter} from "../utils/email.js"
import productModel from "../dao/models/product.model.js";
import __dirname from "../utils.js";
import { ProductManager } from "../dao/index.js";
import {verifyPremiumUser} from "../middlewares/auth.js"
import { PaymentService } from "../services/payment.js";

const productManager = new ProductManager();
const cartManager = new CartManager();


async function returnCid(cid, uid) {
  // En la funcion deberia usar estos parametros: uid = req.user._id cid = req.params.cid

  if (cid === "myCart"){ // si entre a api/carts/myCart intento verificar primero si el usuario ya tiene un carrito y le devuelvo el :cid
    const carts = await cartModel.find().lean()
    const cartUserExist = carts.some((p) => {
      return JSON.stringify(p.owner) === JSON.stringify(uid);
    });
    if(cartUserExist) {
      const cartFinded = await cartManager.getCartByOwner(uid)
      var result = JSON.stringify(cartFinded[0]._id)
      return result;
    } else { // Quiere decir que el usuario no tiene changuito creado.
      var result = "wrong"
      return result;
    }
  }
  else { // quiere decir que ingreso un :cid a verificar
    var result = JSON.stringify(cid);
    return result;
  }
}


async function cartInfo (cid) {
  // cid = req.params.cid

  let amount = 0; // voy a utilizar esta variable para calcular el total de la compra
  const cartId = cid;
  const cart = await cartModel.findById(cartId);
  if(cart){
    if(!cart.products.length){
      var result = "You need to add products before making the purchase."
      return result
      // res.send("You need to add products before making the purchase.")
    }
    const ticketProducts = [];
    const rejectedProducts = [];
    for(let i=0; i<cart.products.length;i++){
      const cartProduct = cart.products[i];
      const productDB = await productModel.findById(cartProduct.pid);
      //comparar la cantidad de ese producto en el carrito con el stock del producto
      if(cartProduct.quantity<=productDB.stock){
        ticketProducts.push(cartProduct);
      } else {
        rejectedProducts.push(cartProduct);
      }
    }
    const purchaseInfo = []; 
    for(let i=0; i<ticketProducts.length;i++){
      const productsTicket = ticketProducts[i];
      const productDB = await productModel.findById(productsTicket.pid);
      const data = 
        {
          pid: productDB._id,
          title: productDB.title,
          code: productDB.code,
          price: productDB.price,
          quantity: productsTicket.quantity,
          subtotal: productsTicket.quantity*productDB.price  
        };
      amount = amount + data.subtotal;
      purchaseInfo.push(data)
      data.lenght=0; //reseteo el array Data
    };
    var result = {info: purchaseInfo, amount: amount}
    return result
  } else { // quiere decir que no encontro el carrito cid
    var result = "Cart not Found"
    return result;
  }
}


// viewCartsController debera Mostrar todos los carritos con la ruta GET /

const viewCartsController = async (req, res) => {
    const carts = await cartManager.getCarts();
    const data = {
      carts: carts,
      tittle: "List of Carts"
    };
    return res.status(201).render("carts", data)
};
  
// newCartController deberá crear un nuevo carrito de La ruta raíz POST /

const newCartController = async (req, res) => {

  // Defino que el carrito lo voy a crear solo si el usuario no posee uno. (No quiero que usuario pueda armar mas de un changuito a la vez)
  const carts = await cartModel.find().lean()
  const cartUserExist = carts.some((p) => {
    return JSON.stringify(p.owner) === JSON.stringify(req.user._id);
  });
  if(cartUserExist) {
    const cartFinded = await cartManager.getCartByOwner(req.user._id)
    res.status(401).send({status: "error", payload: `You already have a cart created and still valid (Cart ID: ${cartFinded[0]._id}). You cannot create another.`});
  } else { // Quiere decir que el usuario no tiene changuitos. Creo uno nuevo
    const products = [];
    const owner = req.user._id;
    const newCart = await cartManager.addCart(products, owner)
    res.status(201).send({status: "Ok", payload: `Cart created successfully.`});
  }
};

// productsCartController deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados de La ruta GET /:cid

const productsCartController = async (req, res) => {
  var cid = await returnCid(req.params.cid, req.user._id);  // Cree esta funcion mas arriba. 
  const carts = await cartManager.getCarts();
  const cartWithSameId = carts.some((p) => {
    return JSON.stringify(p._id) === cid;
  });
  if (cartWithSameId) { // Confirmo que encontre un carrito con el CID especificado
    // const carts = await cartManager.getCartById(JSON.parse(cid));
    const carts = await cartInfo(JSON.parse(cid));
    const data = {
      carts: carts,
      title: `Your cart`,
      id: JSON.parse(cid),
      userExist: req.user
    };
    return res.status(201).render("myCart", {data})
  } else {
    const data = {
      message: `Cart with id ${cid} not found`
    };
    return res.status(401).render("error", data)
  }
};

  
// updateCartController deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba de la ruta PUT api/carts/:cid 

const updateCartController = async (req, res) => {
    const dataToUpdate = req.body;
    const cid = JSON.stringify(req.params.cid);
    const carts = await cartManager.getCarts();
    const cartWithSameId = carts.some((p) => {
      return JSON.stringify(p._id) === cid;
    });
    if (cartWithSameId) { // Confirmo que encontre un carrito con el CID especificado
      const cartUpdated = await cartManager.addArrayProducts(JSON.parse(cid), dataToUpdate);
      res.status(201).send({status: "Ok", payload: `update successfully cart id ${JSON.parse(cid)}`});
    } else {
      res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} not found`});
    }
};
  

// updateQtyProductController deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body de la ruta PUT api/carts/:cid/products/:pid 

const updateQtyProductController = async (req, res) => {
    const cid = JSON.stringify(req.params.cid);
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    if (isNaN(quantity)) {
      res.status(404).send({status: "Error", payload: `Quantity is Not a Number, please use the correct Format {"quantity": 1}`});
    } else {
      const carts = await cartManager.getCarts();
      const cartWithSameId = carts.some((p) => {
        return JSON.stringify(p._id) === cid;
      });
      if (cartWithSameId) { // Confirmo que encontre un carrito con el CID especificado
        await cartManager.addProductQty(JSON.parse(cid), pid, quantity)
        res.status(201).redirect("/api/carts/myCart")
        // res.status(201).send({status: "Ok", payload: `update successfully, cart id ${JSON.parse(cid)} and product id ${pid}`});
      } else {
        res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} not found`});
      }
    }
};

  
// addOneUnitProductController deberá agregar una unidad del producto al arreglo “products” del carrito seleccionado de La ruta POST /:cid/product/:pid 

const addOneUnitProductController = async (req, res) => {

  const pid = req.params.pid;

  // Chequeo si el usuario ya posee un carrito, sino lo creo. 

  const carts = await cartModel.find().lean()
  const cartUserExist = carts.some((p) => {
    return JSON.stringify(p.owner) === JSON.stringify(req.user._id);
  });

  if(!cartUserExist) {  // si no tiene un carrito, lo creo
    const products = [];
    const owner = req.user._id;
    const newCart = await cartManager.addCart(products, owner)
  } 

  // Para esta instancia ya deberia tener un carrito si o si. 

  const cartFinded = await cartManager.getCartByOwner(req.user._id)
  const cid = JSON.stringify(cartFinded[0]._id)

  // Realizo un check que exista el producto pid
  const products = await productModel.find().lean()
  const productExist = products.some((p) => {
    return JSON.stringify(p._id) === JSON.stringify(pid);
  });

  if (productExist) {
    const productToadd = await productManager.getProductById(pid);
    var owner = productToadd.owner;
    var rol = req.user.rol;
    var email = req.user.email;
    const carts = await cartManager.getCarts();
    const cartWithSameId = carts.some((p) => {
      return JSON.stringify(p._id) === cid;
    });
    if (cartWithSameId) { // Confirmo que encontre un carrito con el CID especificado
      // chequeo que el cid pertenezca al usuario
      const cartFinded = await cartManager.getCartById(JSON.parse(cid))
      if (JSON.stringify(cartFinded.owner) === JSON.stringify(req.user._id)){
        // Quiere decir que el usuario esta agregando productos a su carrito y no al de alguien mas
        if (rol = "premium") {
          if (verifyPremiumUser(rol, email, owner)){  
            // Quiere decir que da true y es dueño del producto -> No puede agregarlo al carrito
            res.status(404).send({status: "Error", payload: `You cannot add your products to the cart.`}); 
          } else {  // Si entra por aca es user o premium pero no dueño del producto -> puede agregar al carrito
            await cartManager.addProduct(JSON.parse(cid), pid)
            res.status(201).redirect("/api/carts/myCart")
            // res.status(201).send({status: "Ok", payload: `update successfully, cart id ${JSON.parse(cid)} and product id ${pid}`});
          }
        } else { // Si entra por aca, es usuario "user" -> puede agregar cualquier producto
          await cartManager.addProduct(JSON.parse(cid), pid)
          res.status(201).redirect("/api/carts/myCart")
          // res.status(201).send({status: "Ok", payload: `update successfully, cart id ${JSON.parse(cid)} and product id ${pid}`});
        }
      } else {
        // Quiere decir que el usuario esta agregando productos al carrito de alguien mas y NO el suyo.
        res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} it isn't yours.`}); 
      }
    } else {
        res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} not found`});
    }
  } else {
    res.status(404).send({status: "Error", payload: `Product with id ${pid} not found`});
  }
};


// deleteProductController deberá eliminar del carrito el producto seleccionado de la ruta DELETE api/carts/:cid/products/:pid

const deleteProductController = async (req, res) => {
    const cid = JSON.stringify(req.params.cid);
    const pid = JSON.stringify(req.params.pid);
    const carts = await cartManager.getCarts();
    const cartWithSameId = carts.some((p) => {
      return JSON.stringify(p._id) === cid;
    });
    if (cartWithSameId) { // Confirmo que encontre un carrito con el CID especificado
      const cartFind = await cartModel.findById(JSON.parse(cid))
      const productWithSameId = cartFind.products.some((p) => {
        return JSON.stringify(p.pid) === pid;
      });
      if (productWithSameId) {
        const position = cartFind.products.findIndex(search => JSON.stringify(search.pid) === pid)
        if (cartFind.products[position].quantity === 1) {
          cartFind.products.splice(position, 1)
          res.status(201).redirect("/api/carts/myCart")
          // res.status(201).send({status: "Ok", payload: `Delete successfully product id ${JSON.parse(pid)} from cart id ${JSON.parse(cid)}`});
          cartFind.save();
          } else{
            let updatedProducts;
            updatedProducts = cartFind.products.map((p) => {
              if (JSON.stringify(p.pid) === pid) {
                return {
                  ...p,
                  quantity: p.quantity - 1,
                }
              }
              return p;
            });
            cartFind.products = updatedProducts; 
            cartFind.save();
            res.status(201).redirect("/api/carts/myCart")
            // res.status(201).send({status: "Ok", payload: `You successfully removed a unit of the product ${JSON.parse(pid)} from the cart ${JSON.parse(cid)}`});
        }
      }
      else {
        res.status(404).send({status: "Error", payload: `Product with id ${JSON.parse(pid)} not found`});
      };
    } else {
      res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} not found`});
    }
};
 
// deleteAllProductsController deberá eliminar todos los productos del carrito de la Ruta DELETE api/carts/:cid

const deleteAllProductsController = async (req, res) => {
    const cid = JSON.stringify(req.params.cid);
    const carts = await cartManager.getCarts();
    const cartWithSameId = carts.some((p) => {
      return JSON.stringify(p._id) === cid;
    });
    if (cartWithSameId) {  // Confirmo que encontre un carrito con el CID especificado
      const cart = await cartModel.findById(JSON.parse(cid));
      cart.products.splice(0);
      cart.save();
      res.status(201).redirect("/")
      // res.status(201).send({status: "Ok", payload: `You successfully removed all products from the cart ${JSON.parse(cid)}`});
    } else {
      res.status(404).send({status: "Error", payload: `Cart with id ${JSON.parse(cid)} not found`});
    }
};


// purchaseUser debera generar la compra del carrito y emitir un ticket 

const purchaseUser = async(req,res)=>{

  const purchaseInfo = await cartInfo(req.params.cid);

  // Chequeo que haya algun producto, es decir, exista un importe total  
  if (purchaseInfo.amount) {
    // Genero mi ticket de compra
    const newTicket = {
      code: uuidv4(),
      purchase_datetime: new Date().toLocaleString(),
      purchaseInfo: purchaseInfo.info,
      amount: purchaseInfo.amount,
      purchaser:req.user.email
    }

    // Genero un Email agradeciendo la compra al Usuario. informo el "CODE" como numero de orden por si necesita Reclamar.
    // Armo un template para el cuerpo del mensaje
    const emailTemplate = `<div> 
    <img src="cid:thanks-purchase"/>
    <br>
    <p>Number of order: <b>${newTicket.code}</b></p>
    <p>Purchase Total: <b>$ ${purchaseInfo.amount}</b></p>
    <a href="http://localhost:8080/">Home</a>
    </div>`;
    const contenido = await transporter.sendMail({
    //estructura del correo
    from:"ecommerce Aromas en el Alma",
    to:req.user.email,
    subject:"Successful Purchase",
    html:emailTemplate,
    attachments: [
      {
        filename:"thanks-purchase.gif",
        path:(__dirname+"/public/images/thanks.png"),
        cid:"thanks-purchase" // Definido en el template
      }
    ]
    });
    const ticketCreated = await ticketsModel.create(newTicket);
    res.send(ticketCreated) 

    // Genero el pago por stripe
    const paymentInfo = {
      amount:parseInt(purchaseInfo.amount),
      currency:"usd",
      payment_method_types: ["card"]
    }
    const service = new PaymentService();
    const paymentIntent = await service.createPaymentIntent(paymentInfo);
  } else {
    res.status(404).send("First you have to load products to the cart.")
  }
};

export default{
  viewCartsController, 
  newCartController, 
  productsCartController, 
  updateCartController, 
  updateQtyProductController, 
  addOneUnitProductController, 
  deleteProductController, 
  deleteAllProductsController, 
  purchaseUser,
}
 