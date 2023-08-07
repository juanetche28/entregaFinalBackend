const socket = io();

/**
 * Definimos la variable userMail y disparamos un modal para que el
 * usuario ingrese su mail. Una vez ingresado, asignamos
 * el valor a la variable userMail, y emitimos un evento de tipo "new-user"
 */
let userMail;
Swal.fire({
  title: "Identifícate",
  input: "text",
  text: "Ingresa tu mail",
  inputValidator: (value) => {
    return !value && "Es obligatorio introducir un mail";
  },
  allowOutsideClick: false,
}).then((result) => {
    userMail = result.value;

  socket.emit("new-user", userMail);
});

/**
 * Definimos un objeto chatInput que representa el elemento del DOM correspondiente,
 * donde se ingresan los mensajes a enviar. Agregamos un event listener para escuchar eventos
 * de tipo "keyup", para poder identificar cuando el usuario pulsa Enter.
 * Si el usuario pulsa enter y el mensaje no está vacio, el mismo será enviado a través de un evento de tipo
 * 'chat-message'
 */
const chatInput = document.getElementById("chat-input");
chatInput.addEventListener("keyup", (ev) => {
  if (ev.key === "Enter") {
    const inputMessage = chatInput.value;

    if (inputMessage.trim().length > 0) {
      socket.emit("chat-message", { userMail, message: inputMessage });
    
    //   const chatCreated =  chatModel.create({user: userMail, message: inputMessage})
    //   console.log(chatCreated);
      chatInput.value = "";
    }
  }
});

/**
 * Definimos un objeto chatInput que representa el elemento del DOM correspondiente, donde se displayan
 * los mensajes del chat
 * Asignamos un event listener a nuestro socket que, al escuchar eventos de tipo 'messages', escribirá
 * los mensajes al DOM por medio de este elemento
 */
const messagesPanel = document.getElementById("messages-panel");
socket.on("messages", (data) => {
  console.log(data);
  let messages = "";

  data.forEach((m) => {
    messages += `<b>${m.userMail}:</b> ${m.message}</br>`;
  });

  messagesPanel.innerHTML = messages;
});

/**
 * Disparamos un toast cuando detectamos un evento de tipo 'new-user', que representa que un usuario
 * nuevo se ha unido al chat
 */
socket.on("new-user", (userMail) => {
  Swal.fire({
    title: `${userMail} se ha unido al chat`,
    toast: true,
    position: "top-end",
  });
});
