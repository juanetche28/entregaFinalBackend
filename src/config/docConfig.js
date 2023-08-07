import __dirname from "../utils.js";
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";
import {options} from "../config/options.js"

const port = options.server.port;

const swaggerOptions = {
    definition:{
        openapi:"3.0.1",
        info:{
            title:"Documentacion api de ecommerce",
            version:"1.0.0",
            description:"Definicion de endpoints para la API de ecommerce"
        }
        // servers:[{url:`http://localhost:${port}`}],
    },
    apis:[`${path.join(__dirname,"/docs/**/*.yaml")}`],//archivos que contienen la documentacion de las rutas 
    // los dos ** representan todas las carpetas y el * el nombre de los archivos. Queda asi para que sea generico y no especifico
};

//crear una variable que interpreta las opciones para trabajar con swagger
export const swaggerSpecs = swaggerJsDoc(swaggerOptions);