export const generateUserErrorInfo = ()=>{
    return `
        Failed to generate user. One or more fields are not valid.
        List of required fields:
        first_name: must be type String
        last_name: must be type String
        email: must be type String
    `
}

export const generateUserErrorParam = (uid)=>{
    return `The user id isn't valid. Must be numeric and received: ${uid}`
}
