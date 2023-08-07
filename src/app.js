import express, {urlencoded } from "express";
import session from "express-session";
import viewsRouter from "../src/routes/views.router.js";
import productsRouter from "../src/routes/products.router.js";
import productsMockingRouter from "../src/routes/productsMocking.router.js";
import userRouter from "./routes/users.router.js";
import cartsRouter from "../src/routes/carts.router.js";
import { options } from "./config/options.js";
import { engine } from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import chatManager from "./dao/db-managers/messages.js";
import { AuthRouter } from "./routes/auth.routes.js";
import MongoStore from "connect-mongo";
import passport from "passport";
import { initializedPassport } from "./config/passport.config.js";
import { addLogger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";  // Middleware de manejo de errores. Lo ejecuto luego de las rutas para capturar los errors 
import { swaggerSpecs } from './config/docConfig.js';
import swaggerUi from "swagger-ui-express";
import cookieParser from 'cookie-parser';
import cors from "cors";



const ChatManager = new chatManager();

// Configuracion de Express // Ejecucion del servidor
const app = express();
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

//configuracion de la sesion
app.use(session({
  store:MongoStore.create({
      mongoUrl:options.mongoDB.url,
  }),
  secret:options.server.secretSession,
  resave:true,
  saveUninitialized:true
}))


app.use(cors())


//Middleware Logger
app.use(addLogger);

app.get("/loggerTest", (req,res)=>{;
  req.logger.debug("Level debug");  // Logger Desarrollo debera loggear desde aca
  req.logger.http("Level http");
  req.logger.info("Level info");   // Logger Produccion debera loggear a partir de aca
  req.logger.warn("Level warning");
  req.logger.error("Level error");
  req.logger.error("Level fatal");
  res.send("Testing Levels")
})

//Configuracion passport
initializedPassport();
app.use(passport.initialize());
app.use(passport.session());

// Configuracion Handlebars
app.engine("handlebars", engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.locals.tittle = 'Aromas en el Alma E-commerce'

//Configuracion Routers
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", AuthRouter);
app.use("/api/users", userRouter);
app.use("/api/mockingProducts", productsMockingRouter);
app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpecs));//endpoint donde podremos ver la documentacion


// app.use(errorHandler); // Capturador de Errores, evita que se trunque la api 

/**
 * app.listen() retorna una instancia de nuestro servidor http.
 * Esta instancia la vamos a necesitar para crear nuestro servidor de sockets, por lo que la guardamos en una variable.
 * */
/** Creamos nuestro servidor de sockets utilizando nuestro servidor http */

const messages = [];
export const port = options.server.port;
const httpServer = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = new Server(httpServer);


io.on("connection", (socket) => {
  socket.on("chat-message", async (data) => {
    // Guardo mi Chat en mi collection "messages"
    const chat = await ChatManager.createChat(data.userMail, data.message)
    messages.push(data);

    io.emit("messages", messages);
  });

  socket.on("new-user", (userMail) => {
    socket.emit("messages", messages);

    socket.broadcast.emit("new-user", userMail);
  });
});

export {app};


