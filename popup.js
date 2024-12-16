const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const promptList = document.getElementById('promptList');
const sortBySelect = document.getElementById('sortBySelect');

// Variable temporal para almacenar prompts
let prompts = [];

// Cargar prompts al inicio
document.addEventListener('DOMContentLoaded', () => loadPrompts('favorites'));

// Guardar un nuevo prompt
promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputText = promptInput.value.trim();
    const formattedPrompt = formatPrompt(inputText);

    if (formattedPrompt) {
        const newPrompt = { text: formattedPrompt, favorite: false, date: Date.now() };
        savePrompt(newPrompt);
        promptInput.value = ''; // Limpiar el cuadro de texto
    }
});

// Formatear el prompt: salto de línea si tiene más de 12 palabras
function formatPrompt(promptText) {
    const words = promptText.split(' ');
    const formatted = [];
    let currentLine = '';

    words.forEach((word) => {
        if (currentLine.split(' ').length < 12) {
            currentLine += word + ' ';
        } else {
            formatted.push(currentLine.trim());
            currentLine = word + ' ';
        }
    });

    if (currentLine) formatted.push(currentLine.trim());

    return formatted.join('\n');
}

// Guardar el prompt en la variable y en el almacenamiento
function savePrompt(prompt) {
    prompts.push(prompt);
    chrome.storage.local.set({ prompts }, () => loadPrompts(sortBySelect.value));
}

// Cargar prompts desde el almacenamiento local con ordenamiento
function loadPrompts(sortBy) {
    chrome.storage.local.get({ prompts: [] }, (data) => {
        prompts = data.prompts; // Recupera los prompts del almacenamiento
        let sortedPrompts = [...prompts]; // Trabaja con una copia para ordenar

        if (sortBy === 'favorites') {
            // Ordenar favoritos primero y luego por fecha descendente
            sortedPrompts.sort((a, b) => {
                if (b.favorite !== a.favorite) return b.favorite - a.favorite; // Ordenar por favoritos
                return b.date - a.date; // Ordenar por fecha
            });
        } else if (sortBy === 'date') {
            // Ordenar por fecha (más recientes primero)
            sortedPrompts.sort((a, b) => b.date - a.date);
        }

        displayPrompts(sortedPrompts);
    });
}

// Mostrar prompts
function displayPrompts(prompts) {
    promptList.innerHTML = ''; // Limpiar lista
    prompts.forEach((prompt, index) => {
        const div = document.createElement('div');
        div.className = 'flex flex-col bg-gray-700 text-gray-300 p-2 rounded-md mb-2';

        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-1';

        // Icono de favorito
        const favoriteIcon = document.createElement('span');
        favoriteIcon.textContent = prompt.favorite ? '★' : '☆';
        favoriteIcon.className = 'text-yellow-400 text-2xl cursor-pointer mr-2';
        favoriteIcon.onclick = () => toggleFavorite(index);

        // Botón copiar
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copiar';
        copyBtn.className = 'text-blue-400 hover:text-blue-300 cursor-pointer text-sm';
        
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(prompt.text); // Copiar texto al portapapeles
                alert('Prompt copiado al portapapeles.');
                console.log("Texto copiado correctamente:", prompt.text);
            } catch (error) {
                console.error("Error al copiar el texto:", error);
                alert('Error al copiar el texto. Inténtalo de nuevo.');
            }
        };

        // Texto del prompt
        const promptText = document.createElement('div');
        promptText.textContent = prompt.text;
        promptText.className = 'text-white text-sm break-words whitespace-pre-wrap';

        // Estructura final
        header.appendChild(favoriteIcon);
        header.appendChild(copyBtn);
        div.appendChild(header);
        div.appendChild(promptText);
        promptList.appendChild(div);
    });
}

// Alternar favorito
function toggleFavorite(index) {
    chrome.storage.local.get({ prompts: [] }, (data) => {
        const updatedPrompts = data.prompts.map((prompt, i) => {
            if (i === index) {
                return { ...prompt, favorite: !prompt.favorite };
            }
            return prompt;
        });

        chrome.storage.local.set({ prompts: updatedPrompts }, () => loadPrompts(sortBySelect.value));
    });
}

// Evento para cambiar el orden
sortBySelect.addEventListener('change', (e) => loadPrompts(e.target.value));
