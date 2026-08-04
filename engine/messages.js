const messageLog =
    document.getElementById("message-log");


export function showMessage(text) {

    const message =
        document.createElement("div");


    message.textContent = text;


    message.style.opacity = "1";
    message.style.transition =
        "opacity 1s";


    messageLog.appendChild(message);


    setTimeout(() => {

        message.style.opacity = "0";

    }, 3000);


    setTimeout(() => {

        message.remove();

    }, 4000);

}