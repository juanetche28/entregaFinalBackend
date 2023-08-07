import FileProductManager from "./file-managers/ProductManager.js"
import FileCartManager from "./file-managers/CartManager.js"
import DbProductManager from "./db-managers/ProductManager.js"
import DbUserManager from "./db-managers/UserManager.js"
import DbCartManager from "./db-managers/CartManager.js"

const config = {
    persistenceType: "db",
};

let ProductManager, CartManager, UserManager;

if (config.persistenceType === "db") {
    ProductManager = DbProductManager;
    CartManager = DbCartManager;
    UserManager = DbUserManager;
} else if (config.persistenceType === "file") {
    ProductManager = FileProductManager;
    CartManager = FileCartManager;
    UserManager = DbUserManager;
} else {
    throw new Error("Uknown persistence type");
}

export {ProductManager, CartManager, UserManager};