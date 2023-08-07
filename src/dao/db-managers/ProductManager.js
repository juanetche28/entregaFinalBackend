import productModel from "../models/product.model.js"

export default class ProductManager {
    constructor() {
        console.log("Working with products using database");
    }


    getProducts = async (limit, page, sort, query) => {
        if (limit === ":limit" || limit === 0) {limit = 10 } else { limit = limit };
        if (page === ":page") {page = 1 } else { page = page };
        if (query === ":query") {query = null} else  query = JSON.parse(query);
        if (sort === "asc") {sort = {"price": 1}} else if (sort === "desc") {sort = {"price": -1}} else {sort = null};
        const products = await productModel.paginate(
            query,
            {
                limit: limit,
                lean: true,
                page: page,
                sort: sort,
            }
          );
        return products;
      };
    
    getProductById = async (productId) => {
        const productFind = await productModel.findById(productId);
        return productFind;
    }

    async addProduct(title, description, code, price, status, stock, category, thumbnail, owner) {
        // const products = await productModel.find().lean();
        const createdProduct = await productModel.create({title, description, code, price, status, stock, category, thumbnail, owner});
        createdProduct.save();
    }

    async updateProduct(productId, dataToUpdate){
        const updatedProduct = await productModel.findOneAndUpdate({_id: productId}, dataToUpdate, {new: true})
        updatedProduct.save();
    ;}

    async deleteProduct(productId) {
        const result = await productModel.deleteOne({_id: productId});
    }
}


