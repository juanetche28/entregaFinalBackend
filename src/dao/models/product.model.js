import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
mongoose.connect("mongodb+srv://juanetche28:BackendJuan@backend-etcheverry.vxln9zu.mongodb.net/ecommerce?retryWrites=true&w=majority").then((conn) => {
  console.log("Connected to DB!");
});

const productSchema = new mongoose.Schema({
        title: {type: String, required: true},
        description: {type: String, required: true},
        code: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        status: {type: String, required: true},
        stock: {type: Number, required: true},
        category: {type: String, required: true},
        thumbnail: {type: Array, default: []},
        owner:  {type: String, default: 'adminCoder@coder.com'},
});

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model("products", productSchema);

export default productModel;
