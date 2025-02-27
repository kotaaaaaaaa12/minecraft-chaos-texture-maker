document.getElementById("process-button").addEventListener("click", async function () {
    const a1Files = document.getElementById("a1-images").files;
    const a2File = document.getElementById("a2-image").files[0];

    if (!a2File) {
        alert("a2画像を選択してください。");
        return;
    }

    if (a1Files.length === 0) {
        alert("a1画像を選択してください。");
        return;
    }

    const a2Image = await loadImage(a2File);
    const zip = new JSZip();

    for (const a1File of a1Files) {
        const a1Image = await loadImage(a1File);
        const processedCanvas = await processSingleImage(a1Image, a2Image);

        // CanvasをBlobに変換
        const blob = await new Promise((resolve) => processedCanvas.toBlob(resolve, "image/png"));
        zip.file(a1File.name, blob);
    }

    // ZIPを生成して強制ダウンロード
    zip.generateAsync({ type: "blob" }).then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "processed_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("処理が完了しました！");
    });
});

// 画像をロードする関数
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
    });
}

// 画像の色調変更とモザイク処理を行う関数
async function processSingleImage(a1Image, a2Image) {
    const mosaicSize = 16;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = a1Image.width;
    canvas.height = a1Image.height;
    ctx.drawImage(a1Image, 0, 0);

    const a2Canvas = document.createElement("canvas");
    const a2Ctx = a2Canvas.getContext("2d");

    a2Canvas.width = a2Image.width;
    a2Canvas.height = a2Image.height;
    a2Ctx.drawImage(a2Image, 0, 0);

    const a1Pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const a2Pixels = a2Ctx.getImageData(0, 0, a2Canvas.width, a2Canvas.height);

    for (let y = 0; y < canvas.height; y += mosaicSize) {
        for (let x = 0; x < canvas.width; x += mosaicSize) {
            const averageColor = getAverageColor(a1Pixels, x, y, mosaicSize, canvas.width);

            for (let dy = 0; dy < mosaicSize && y + dy < a2Canvas.height; dy++) {
                for (let dx = 0; dx < mosaicSize && x + dx < a2Canvas.width; dx++) {
                    const idx = ((y + dy) * a2Canvas.width + (x + dx)) * 4;
                    a2Pixels.data[idx] = averageColor.r;
                    a2Pixels.data[idx + 1] = averageColor.g;
                    a2Pixels.data[idx + 2] = averageColor.b;
                    a2Pixels.data[idx + 3] = 255;
                }
            }
        }
    }

    a2Ctx.putImageData(a2Pixels, 0, 0);
    return a2Canvas;
}

// ピクセルデータから平均色を取得する関数
function getAverageColor(pixels, startX, startY, blockSize, width) {
    let r = 0, g = 0, b = 0, count = 0;

    for (let y = startY; y < startY + blockSize && y < width; y++) {
        for (let x = startX; x < startX + blockSize && x < width; x++) {
            const idx = (y * width + x) * 4;
            r += pixels.data[idx];
            g += pixels.data[idx + 1];
            b += pixels.data[idx + 2];
            count++;
        }
    }

    return {
        r: Math.floor(r / count),
        g: Math.floor(g / count),
        b: Math.floor(b / count)
    };
}
