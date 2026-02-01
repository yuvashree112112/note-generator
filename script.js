// MAIN FUNCTION → Extract PDF
async function extractPDF() {
    const file = document.getElementById("pdfUpload").files[0];
    if (!file) {
        alert("Please upload a PDF file!");
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
            fullText += strings.join(" ") + "\n";
        }

        const cleaned = cleanText(fullText);
        const formattedNotes = formatAcademicNotes(cleaned);

        document.getElementById("output").innerHTML = formattedNotes;
    };

    reader.readAsArrayBuffer(file);
}


// BASIC CLEANING
function cleanText(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(/\n\d+\n/g, "")
        .trim();
}


// FORMAT TEXT INTO ACADEMIC NOTES
function formatAcademicNotes(text) {
    let lines = text.split(". ");
    let notes = "";
    let sectionCount = 1;

    lines.forEach(line => {
        line = line.trim();

        // Detect headings (ALL CAPS or short titles)
        if (line.length < 25 || /^[A-Z ]+$/.test(line)) {
            notes += `\n${sectionCount}. <span class="section-title">${line}</span>\n`;
            sectionCount++;
        } 
        else {
            // bullet points
            notes += `<span class="bullet-point">- ${line}.</span>\n`;
        }
    });

    return notes;
}


// DOWNLOAD NOTES AS TEXT FILE
function downloadNotes() {
    const text = document.getElementById("output").innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Generated_Notes.txt";
    link.click();
}
