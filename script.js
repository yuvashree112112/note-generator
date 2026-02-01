// Extract PDF text using PDF.js
async function extractPDF() {
    const file = document.getElementById("pdfUpload").files[0];
    if (!file) {
        alert("Please upload a PDF file first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function() {
        const pdfData = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(pdfData).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(" ") + "\n\n";
        }

        let cleaned = cleanText(fullText);
        let summary = generateSummary(cleaned);

        document.getElementById("output").value = summary;
    };

    reader.readAsArrayBuffer(file);
}

// Clean text (remove extra spaces, page numbers, etc.)
function cleanText(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(/\n\d+\n/g, "")
        .trim();
}

// Basic summarizer
function generateSummary(text) {
    const sentences = text.split(". ");
    const wordFreq = {};

    text.split(" ").forEach(word => {
        word = word.toLowerCase();
        if (!wordFreq[word]) wordFreq[word] = 0;
        wordFreq[word]++;
    });

    const scored = sentences.map(sentence => {
        let score = 0;
        sentence.split(" ").forEach(word => {
            score += wordFreq[word.toLowerCase()] || 0;
        });
        return { sentence, score };
    });

    const topSentences = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.ceil(sentences.length * 0.2))
        .map(item => "• " + item.sentence.trim());

    return topSentences.join("\n");
}

// Download notes
function downloadNotes() {
    const text = document.getElementById("output").value;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "Notes.txt";
    link.click();
}
