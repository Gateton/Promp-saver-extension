// Crea el menú contextual cuando se instala o actualiza la extensión
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveSelectedText",
        title: "Guardar como Prompt",
        contexts: ["selection"] // Solo muestra el menú cuando hay texto seleccionado
    });
});

// Escucha cuando el usuario hace clic en el menú contextual
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveSelectedText" && info.selectionText) {
        // Obtener el texto seleccionado y guardarlo
        chrome.storage.local.get({ prompts: [] }, (data) => {
            // Añadir el texto seleccionado como prompt
            const prompts = [...data.prompts, { text: info.selectionText, favorite: false, date: Date.now() }];

            chrome.storage.local.set({ prompts }, () => {
                console.log("Prompt guardado:", info.selectionText);

                // Verificación de errores en chrome.runtime.lastError
                if (chrome.runtime.lastError) {
                    console.error("Error al guardar el prompt:", chrome.runtime.lastError.message);
                } else {
                    // Notificación al usuario
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png", // Asegúrate de que 'icon.png' existe en tu carpeta raíz
                        title: "Prompt Guardado",
                        message: "El texto seleccionado se guardó exitosamente."
                    });
                }
            });
        });
    }
});

// Manejo de errores básicos en runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getPrompts") {
        chrome.storage.local.get({ prompts: [] }, (data) => {
            sendResponse({ prompts: data.prompts });
        });
        return true; // Permite el envío de una respuesta asíncrona
    }
});
