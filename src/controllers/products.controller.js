import { ProductManager } from "../dao/index.js";
import productModel from "../dao/models/product.model.js"
import {verifyPremiumUser} from "../middlewares/auth.js"
import {transporter} from "../utils/email.js"
import __dirname from "../utils.js";
import { options } from "../config/options.js"

const productManager = new ProductManager();


// Creo esta Ruta solo para actualizar de forma masiva el campo Owner. (La ejecute una vez y listo. Quedo guardada la funcion de backup)

const updateManyProducts = async (req, res) => {
  const products = await productModel.find();
  const adminMail = "adminCoder@coder.com";
  const result = await productModel.updateMany({},{$set:{owner:adminMail}})
}


// GetProductsController deberá listar todos los productos de la base en La ruta raíz GET /

const GetProductsController = async (req, res) => {
    const page = req.params.page;
    const limit = req.params.limit;
    const sort = req.params.sort;
    const query = req.params.query;
    const products = await productManager.getProducts(limit, page, sort, query);
    if (isNaN(products.page) || isNaN(products.limit) || products.limit === 0 || products.page === 0){
      res.status(404).send({status: "Error", payload: `Page or Limit must be a number not Zero`});
    } else {
      res.status(201).send({status: "Ok", payload: products})
    }
};

// GetProductByIdController deberá traer sólo el producto con el id proporcionado en La ruta GET /:pid


const GetProductByIdController = async (req, res) => {
    const pid = JSON.stringify(req.params.pid);
    const products = await productModel.find().lean()
    const productWithSameId = products.some((p) => {
      return JSON.stringify(p._id) === pid;
    });
    if (productWithSameId) {
      const productFind = await productManager.getProductById(JSON.parse(pid));
      res.status(201).send({status: "Ok", payload: productFind});
    } else {
      res.status(404).send({status: "Error", payload: `Product with id ${pid} not found`});
    }
};

// NewProductController deberá agregar un nuevo producto en La ruta raíz POST /

const NewProductController = async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnail} = req.body;
    const newProduct = req.body;
    
    // Muestro error si esta duplicado el CODE
    const products = await productModel.find().lean()
    const productWithSameCode = products.some((p) => {
      return p.code === newProduct.code;
    });
    const owner = req.user.email;
    if (productWithSameCode) {
      res.status(404).send({status: "Error", payload: `Product with the same existing code: ${newProduct.code}`});
    } else {
      productManager.addProduct(title, description, code, price, status, stock, category, thumbnail, owner);
      res.status(201).send({status: "Ok", payload: `The product with code ${newProduct.code} was successfully added`});
    }
};

// UpdateProductController deberá tomar un producto y actualizarlo por los campos enviados desde body en La ruta PUT /:pid 

const UpdateProductController = async (req, res) => {
  const dataToUpdate = req.body;

  if (!dataToUpdate.title || !dataToUpdate.description || !dataToUpdate.code || !dataToUpdate.price || !dataToUpdate.status || !dataToUpdate.stock || !dataToUpdate.category) {
    res.status(404).send({status: "Error", payload: `Please complete all fields. None should be left blank.`});
  } else {
    const pid = JSON.stringify(req.params.pid);
    const products = await productModel.find().lean()
    const productWithSameId = products.some((p) => {
      return JSON.stringify(p._id) === pid;
    });
    if (productWithSameId) {
      productManager.updateProduct(JSON.parse(pid), dataToUpdate);
      res.status(201).send({status: "Ok", payload: `The product with id ${pid} was successfully updated`});
    } else {
      res.status(404).send({status: "Error", payload: `Product with id ${pid} not found`});
    }
  }
};

// DeleteProductController deberá eliminar el producto con el pid indicado en La ruta DELETE /:pid 

const DeleteProductController = async (req, res) => {
    const pid = JSON.stringify(req.params.pid);
    const products = await productModel.find().lean()
    const productWithSameId = products.some((p) => {
      return JSON.stringify(p._id) === pid;
    });
    
    if (productWithSameId) {
      const productToDelete = await productManager.getProductById(JSON.parse(pid));
      const rol = req.user.rol;
      const email = req.user.email;
      const owner = productToDelete.owner; 
      // Chequeo que el usuario Premium solo pueda eliminar su propio producto y no el de alguien mas.
      if (verifyPremiumUser(rol, email, owner)) {  //verifyPremiumUser da true si es Admin o si es Premium y el producto es suyo.
        productManager.deleteProduct(JSON.parse(pid))
        if (owner != options.gmail.adminAccount) {  // Le voy a enviar un mail al usuario premium si se elimina un producto suyo.
          const emailTemplate = `<div> 
          <h1>your product was removed!</h1>
          <p>Mail: <b>${owner}</b></p>
          <p>Your product ${pid} was removed</p>
          <br>
          <img src="cid:trash"/>
          <br>
          <a href="http://localhost:8080/">Home</a>
          </div>`;
          const contenido = await transporter.sendMail({
          //estructura del correo
          from:"ecommerce Aromas en el Alma",
          to: owner,
          subject:"Product Deleted",
          html:emailTemplate,
          attachments: [
            {
              filename:"trash.png",
              path:(__dirname+"/public/images/trash.png"),
              cid:"trash" // Definido en el template
            }
          ]
          });
        }
        res.status(201).send({status: "Ok", payload: `The product with id ${pid} was successfully Deleted`});
      } else {
        res.status(404).send({status: "Error", payload: `You do not have permissions to delete products that are not yours.`});
      }
    } else {
      res.status(404).send({status: "Error", payload: `Product with id ${pid} not found`});
    }
};


// deleteProductPremium debera avisar por mail al usuario premium cada vez que se elimine uno de sus productos.  

const deleteProductPremium = async (req, res) => { // Envio un mail avisando que se elimino un producto (para testing postman)
  const email = req.params.email;
  const pid = req.params.pid;
  {
    const emailTemplate = `<div> 
    <h1>your product was removed!</h1>
    <p>Mail: <b>${email}</b></p>
    <p>Your product ${pid} was removed</p>
    <br>
    <img src="cid:trash"/>
    <br>
    <a href="http://localhost:8080/">Home</a>
    </div>`;
    const contenido = await transporter.sendMail({
    //estructura del correo
    from:"ecommerce Aromas en el Alma",
    to: email,
    subject:"Product Deleted",
    html:emailTemplate,
    attachments: [
      {
        filename:"trash.png",
        path:(__dirname+"/public/images/trash.png"),
        cid:"trash" // Definido en el template
      }
    ]
    });
  }
  res.status(201).send("Product deleted")  
}

export default {
  GetProductsController, 
  GetProductByIdController, 
  NewProductController, 
  UpdateProductController, 
  DeleteProductController,
  deleteProductPremium
}
