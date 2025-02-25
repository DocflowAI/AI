document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            displayFile(content, file.type);
        };
        reader.readAsArrayBuffer(file);
    }
});

function displayFile(content, fileType) {
    const viewer = document.getElementById('viewer');
    viewer.innerHTML = '';

    if (fileType === 'application/pdf') {
        // Use PDF.js for PDF files
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.getDocument(content).promise.then(pdf => {
            for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then(page => {
                    const canvas = document.createElement('canvas');
                    viewer.appendChild(canvas);
                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: 1.5 });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    page.render({ canvasContext: context, viewport: viewport });
                });
            }
        });
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Use Mammoth.js for DOCX files
        mammoth.extractRawText({ arrayBuffer: content }).then(result => {
            viewer.innerHTML = `<pre>${result.value}</pre>`;
        });
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Use SheetJS for XLSX files
        const workbook = XLSX.read(content, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        viewer.innerHTML = XLSX.utils.sheet_to_html(sheet);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        // Use PPTX.js for PPTX files
        const pptx = new PptxGenJS();
        pptx.load(content).then(presentation => {
            presentation.slides.forEach(slide => {
                viewer.innerHTML += `<h2>Slide ${slide.slideNumber}</h2>`;
                slide.shapes.forEach(shape => {
                    viewer.innerHTML += `<p>${shape.text}</p>`;
                });
            });
        });
    } else {
        viewer.innerHTML = 'Unsupported file type.';
    }
}
