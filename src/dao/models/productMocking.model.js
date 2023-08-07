import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productMockingSchema = new mongoose.Schema({
        title: {type: String, required: true},
        description: {type: String, required: true},
        code: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        status: {type: String, required: true},
        stock: {type: Number, required: true},
        category: {type: String, required: true},
        thumbnail: {type: Array, required: true},
});

productMockingSchema.plugin(mongoosePaginate);

const productMockingModel = mongoose.model("productsMocking", productMockingSchema);

export default productMockingModel;


