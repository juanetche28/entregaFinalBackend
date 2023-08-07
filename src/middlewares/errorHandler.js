import { EError } from "../enums/EError.js";

export const errorHandler = (error, req, res, next)=>{
    switch (error.code) {
        case EError.INVALID_JSON:
            res.json({status:"error", error:error.cause, message: error.message})
            break;
        case EError.DATABASE_ERROR:
            res.json({status:"error", error:error.message})
            break;
        case EError.INVALID_PARAM:
            res.json({status:"error", error:error.cause})
            break;
        case EError.AUTH_ERROR:
            res.json({status:"error", error:error.cause})
            break;            
        default:
            res.send('An unexpected error has occurred, please contact support. <a href="/">Home</a>')
            // res.json({status:"error", message:"An unexpected error has occurred, please contact support."})
            break;
    }
}