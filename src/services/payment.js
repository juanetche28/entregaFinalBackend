import Stripe from "stripe";
import { options } from "../config/options.js";

export class PaymentService{
    constructor(){
        this.stripe = new Stripe(options.stripe.clave_secreta);
    };

    async createPaymentIntent(data){
        const paymentIntent = this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }
}