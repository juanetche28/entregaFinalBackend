import winston from "winston";
import __dirname from "../utils.js";
import path from "path";
import {options} from "../config/options.js";

const customLevels = {
    levels:{
        fatal:0,
        error:1,
        warn:2,
        info:3,
        http:4,
        verbose:5,
        debug:6,
        silly:7
    },
    colors:{
        fatal:"red",
        error:"red",
        warn:"yellow",
        info:"blue",
        http:"green",
        verbose:"white",
        debug:"magenta",
        silly:"gray"
    }
}



const devLogger = winston.createLogger({
    levels:customLevels.levels,

    transports:[
        new winston.transports.Console({level:"debug", 
        format: winston.format.combine( 
            winston.format.colorize({colors: customLevels.colors }), 
            winston.format.simple()
        )})  // muestro errores en consola desde el nivel debug
    ]
});

const prodLogger = winston.createLogger({
    transports:[
        //definir los diferentes sistemas de almacenamiento de logs(mensajes/registros)
        new winston.transports.Console({ level: "info"}), // muestro errores en consola desde el nivel Info
        new winston.transports.File({filename: path.join(__dirname,"/logs/errors.log"), level:"error" }) // muestro errores en file "error.log" desde el nivel error (solo ambiente productivo)
    ]
});

const currentEnv = options.entorno.nodeEnv || "development";

//crear un middleware para agregar el logger al objeto req
export const addLogger = (req,res,next)=>{
    if(currentEnv === "development"){
        req.logger = devLogger
    } else {
        req.logger = prodLogger
    }
    // req.logger.http(`${req.url} - method: ${req.method}`);
    next();
}