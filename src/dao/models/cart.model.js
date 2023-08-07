import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
        // products: {type: Array, default: [],},
        products: {
                type: Array,
                    product: {
                      pid: {type: mongoose.Schema.Types.ObjectId, ref: "products"},
                      quantity: {type: Number}
                    },
                default: [],
        },
        owner: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
});

cartSchema.plugin(mongoosePaginate);

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;
