document.getElementById('process').addEventListener('click', async () => {
    const a1Files = document.getElementById('a1').files;
    const a2File = document.getElementById('a2').files[0];
    
    if (!a1Files.length || !a2File) {
        alert("a1とa2の画像を選択してください");
        return;
    }

    const zip = new JSZip();
    const a2Image = await loadImage(a2File);

    for (const file of a1Files) {
        const a1Image = await loadImage(file);
        const resultImage = await processImage(a1Image, a2Image);
        zip.file(file.name, resultImage, { base64: true });
    }

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "processed_textures.zip";
        link.click();
        alert("処理が終了しました！");
    });
});

async function loadImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(file);
    });
}

async function processImage(a1Image, a2Image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 1024;

    const a1Canvas = document.createElement('canvas');
    const a1Ctx = a1Canvas.getContext('2d');
    a1Canvas.width = 16;
    a1Canvas.height = 16;
    a1Ctx.drawImage(a1Image, 0, 0, 16, 16);
    
    const a1Data = a1Ctx.getImageData(0, 0, 16, 16).data;

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const i = (y * 16 + x) * 4;
            const r = a1Data[i], g = a1Data[i+1], b = a1Data[i+2], a = a1Data[i+3];

            if (a === 0) continue;

            const a2Canvas = document.createElement('canvas');
            const a2Ctx = a2Canvas.getContext('2d');
            a2Canvas.width = 64;
            a2Canvas.height = 64;
            a2Ctx.drawImage(a2Image, 0, 0, 64, 64);

            const a2Data = a2Ctx.getImageData(0, 0, 64, 64);

            for (let j = 0; j < a2Data.data.length; j += 4) {
                a2Data.data[j] = (a2Data.data[j] * r) / 255;
                a2Data.data[j+1] = (a2Data.data[j+1] * g) / 255;
                a2Data.data[j+2] = (a2Data.data[j+2] * b) / 255;
            }

            a2Ctx.putImageData(a2Data, 0, 0);
            ctx.drawImage(a2Canvas, x * 64, y * 64);
        }
    }

    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        }, "image/png");
    });
}
