const MESSAGE_ARGUS_TOKEN_REFRESH = "argus-token-refresh";
const MESSAGE_ARGUS_TOKEN_REQUEST = "argus-token-request";
const MESSAGE_ARGUS_TOKEN_RESPONSE = "argus-token-response";

const ArgusJS = function(token, mdr_url) {
    let currentToken = token;

    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_REFRESH) {
            currentToken = event.data.token;
        }
    }, false);

    return {
        get: (url) => fetch(mdr_url + url, { "method": "GET", "headers": { "Authorization": "Bearer " + currentToken.access } }),
    }
}

const initArgusJS = function() {
    return new Promise((resolve) => {
        const requestId = Date.now();

        const argusTokenResponseHandler = function(event) {
            if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_RESPONSE && event.data.requestId === requestId) {
                resolve(ArgusJS(event.data.token, event.data.mdr_url));
                window.removeEventListener("message", argusTokenResponseHandler)
            }
        }

        window.addEventListener("message", argusTokenResponseHandler, false);
        top.postMessage({ argusMessageId: MESSAGE_ARGUS_TOKEN_REQUEST, requestId }, "*")

    })
};