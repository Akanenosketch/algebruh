const DATABASE_PATH = "databases/questions.json";

const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";

const INFO = {
    "textSolver": {
        "input": "Aquí deberás escribir la pregunta que quieras resolver. Intenta que sea lo más parecida posible a las preguntas disponibles en la base de datos.\n\nCuanta más información contenga la pregunta, mayor será la probabilidad de obtener un resultado satisfactorio.",
        "match": "Aquí podrás ver la coincidencia de la base de datos más parecida a la pregunta que has introducido.",
        "confidence": "Aquí podrás ver el porcentaje de coincidencia de tu búsqueda con la mejor coincidencia encontrada en la base de datos.",
        "answer": "Este campo contiene la respuesta a la coincidencia encontrada en la base de datos.\n\nRecuerda revisar que la coincidencia sea parecida o igual a tu pregunta original.",
        "explanation": "Este campo contiene la explicación de la respuesta, en caso de que exista en la base de datos."
    },
    "imageSolver": {
        "input": "Aquí deberás arrastrar una imagen de la pregunta que quieras buscar. Sirven capturas de pantalla e imagenes guardadas pero no siempre funciona con imagenes de páginas web directamente.\n\nRecuerda encuadrar lo máximo posible el texto a buscar, reduciendo así las posibilidades de falsos reconocimientos.",
        "text": "Este campo contiene el texto escaneado de la imagen.",
        "match": "Aquí podrás ver la coincidencia de la base de datos más parecida a la pregunta que has introducido.",
        "confidence": "Aquí podrás ver el porcentaje de coincidencia de tu búsqueda con la mejor coincidencia encontrada en la base de datos.",
        "answer": "Este campo contiene la respuesta a la coincidencia encontrada en la base de datos.\n\nRecuerda revisar que la coincidencia sea parecida o igual a tu pregunta original.",
        "explanation": "Este campo contiene la explicación de la respuesta, en caso de que exista en la base de datos.",
        "tesseractStatus": "Este campo contiene el estado actual de reconocimiento de texto de Tesseract (OCR).",
        "tesseractProgress": "Este campo contiene el progreso de cada estado de procesamiento de Tesseract (OCR)."
    }
}

const TESSERACT_STATUS_TRANSLATION = {
    "loading tesseract core": "Cargando núcleo de Tesseract",
    "initializing tesseract": "Inicializando Tesseract",
    "initialized tesseract": "Tesseract inicializado",
    "loading language traineddata": "Cargando datos de entrenamiento de idioma",
    "loading language traineddata (from cache)": "Cargando datos de entrenamiento de idioma (desde caché)",
    "loaded language traineddata": "Datos de entrenamiento de idioma cargados",
    "initializing api": "Inicializando API",
    "initialized api": "API inicializada",
    "recognizing text": "Reconociendo texto"
}

// Data fetching functions:

/**
 * Fetch data from the database and assign it to the global variable `window.data`.
 * @date 8/12/2023 - 3:44:08 AM
 *
 * @async
 * @returns {Promise<void>} - Database fetch promise.
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

// Data format functions:

/**
 * Convert text to bold.
 * @date 8/12/2023 - 3:09:39 AM
 *
 * @param {string} text - Text to convert.
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text;
}

/**
 * Convert boolean answer to readable text.
 * @date 8/12/2023 - 3:10:14 AM
 *
 * @param {boolean} answer - Answer.
 * @returns {string} - Formatted answer.
 */
function formatAnswer(answer) {
    return bold(answer ? "Verdadero" : "Falso");
}

/**
 * Convert explanation to bold or show missing message.
 * @date 8/12/2023 - 3:11:18 AM
 *
 * @param {string} explanation - Explanation. {@link null} if missing.
 * @returns {string} - Formatted explanation.
 */
function formatExplanation(explanation) {
    return explanation !== null ? bold(explanation) : MISSING_MESSAGE;
}

// Pattern matching functions:

/**
 * Get the best match for the given text.
 * @date 8/12/2023 - 3:13:43 AM
 *
 * @param {string} text - Input text.
 * @returns {{ text: any; confidence: string; answer: str | null; explanation: str | null; } | null} - Best match. {@link null} if no match.
 */
function getBestMatch(text) {
    // Generate match array:
    let matchArray = Object.entries(window.data).map((questionData) => ({
        "text": questionData[0],
        "confidence": new difflib.SequenceMatcher(null, questionData[0], text).ratio(),
        "answer": questionData[1].answer,
        "explanation": questionData[1].explanation
    }));

    // Sort from higher to lower ratio:
    matchArray.sort((a, b) => b.confidence - a.confidence);

    // Return best match if available, else return null:
    return matchArray.length === 0 ? null : {
        "text": matchArray[0].text,
        "confidence": `${Math.round(matchArray[0].confidence * 10000) / 100}%`,
        "answer": matchArray[0].answer,
        "explanation": matchArray[0].explanation
    };
}

/**
 * Get formatter data for the given text.
 * @date 8/12/2023 - 3:16:24 AM
 *
 * @param {string} text - Input text.
 * @returns {{ text: string; match: string; confidence: string; answer: string; explanation: string; }} - Formatted data.
 */
function getFormattedData(text) {
    const bestMatch = getBestMatch(text);

    // Return formatted data if available, else default missing messages:
    return bestMatch === null ? {
        "text": bold(text),
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE,
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE
    } : {
        "text": bold(text),
        "match": bold(bestMatch.text),
        "confidence": bold(bestMatch.confidence),
        "answer": formatAnswer(bestMatch.answer),
        "explanation": formatExplanation(bestMatch.explanation)
    }
};

// Auxiliary functions:

/**
 * Display tooltip with information for the given element and page.
 * @date 8/12/2023 - 3:35:21 AM
 *
 * @param {string} elementID - ID of the element to display tooltip for.
 * @param {string} pageID - ID of the page where the element is located.
 */
function displayTooltip(elementID, pageID) {
    if (Object.keys(INFO).includes(pageID)) {
        if (Object.keys(INFO[pageID]).includes(elementID)) {
            alert(INFO[pageID][elementID]);
        } else {
            console.warn(`No info for element ${elementID} in page ${pageID}`);
        }
    } else {
        console.warn(`No info for page ${pageID}`);
    }
}
