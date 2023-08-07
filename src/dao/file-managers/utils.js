// Creo una Funcion para el ID autoincrementable que nunca se repita

export function getNextId(arr) {   //Cuando la use le paso un Array como parametro
    if (arr.length === 0){
        return 0;
    }
    const highestId = arr.reduce((acc, curr) => {   
        return curr.id > acc ? curr.id : acc;    // Comparo el acumulado con el actual
    }, 0)
    return highestId + 1;
}