document.getElementById('processBtn').addEventListener('click', async () => {
    const a1Files = document.getElementById('a1Input').files;
    const a2File = document.getElementById('a2Input').files[0];
    
    if (!a1Files.length || !a2File) {
        alert("A1画像とA2画像を選択してください！");
        return;
    }

    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = "block";
    
    let completed = 0;
    const total = a1Files.length;

    // JSZipを使うための準備
    const zip = new JSZip();

    for (const [index, a1File] of Array.from(a1Files).entries()) {
        const processedImage = await processImage(a1File, a2File);
        zip.file(a1File.name, processedImage);

        completed++;
        progressBar.style.width = `${(completed / total) * 100}%`;
    }

    // ZIPを生成してダウンロード
    zip.generateAsync({ type: "blob" }).then((content) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "converted_textures.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("処理が完了しました！");
    });
});

async function processImage(a1File, a2File) {
    return new Promise((resolve) => {
        const a1Img = new Image();
        const a2Img = new Image();
        const a1URL = URL.createObjectURL(a1File);
        const a2URL = URL.createObjectURL(a2File);

        a1Img.onload = () => {
            a2Img.onload = () => {
                const size = a1Img.width; // 画像サイズ (例: 16, 32, 64 など)
                const canvas = document.createElement("canvas");
                canvas.width = size * 16;
                canvas.height = size * 16;
                const ctx = canvas.getContext("2d");

                const a1Canvas = document.createElement("canvas");
                a1Canvas.width = size;
                a1Canvas.height = size;
                const a1Ctx = a1Canvas.getContext("2d");
                a1Ctx.drawImage(a1Img, 0, 0, size, size);

                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const pixel = a1Ctx.getImageData(x, y, 1, 1).data;
                        const r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3] / 255;

                        if (a > 0) {
                            ctx.save();
                            ctx.globalAlpha = a;
                            ctx.globalCompositeOperation = "multiply";
                            ctx.drawImage(a2Img, x * 16, y * 16, 16, 16);
                            ctx.fillStyle = `rgb(${r},${g},${b})`;
                            ctx.fillRect(x * 16, y * 16, 16, 16);
                            ctx.restore();
                        }
                    }
                }

                canvas.toBlob((blob) => resolve(blob), "image/png");
            };
            a2Img.src = a2URL;
        };
        a1Img.src = a1URL;
    });
}
