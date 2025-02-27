// 画像の色調変更とモザイク処理を行う関数
async function processSingleImage(a1Image, a2Image) {
    const mosaicSize = 16; // モザイクのサイズ（16x16のブロック）

    // a1の画像をCanvasに描画
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = a1Image.width;
    canvas.height = a1Image.height;
    ctx.drawImage(a1Image, 0, 0);

    // a2の画像をCanvasに描画
    const a2Canvas = document.createElement("canvas");
    const a2Ctx = a2Canvas.getContext("2d");

    a2Canvas.width = a2Image.width;
    a2Canvas.height = a2Image.height;
    a2Ctx.drawImage(a2Image, 0, 0);

    // a1の画像のピクセルデータを取得
    const a1Pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const a2Pixels = a2Ctx.getImageData(0, 0, a2Canvas.width, a2Canvas.height);

    // a1の画像をモザイク風に処理
    for (let y = 0; y < canvas.height; y += mosaicSize) {
        for (let x = 0; x < canvas.width; x += mosaicSize) {
            // モザイクブロック内の平均色を取得
            const averageColor = getAverageColor(a1Pixels, x, y, mosaicSize, canvas.width);
            
            // a2の画像の対応するピクセルを平均色で塗りつぶす
            for (let dy = 0; dy < mosaicSize && y + dy < a2Canvas.height; dy++) {
                for (let dx = 0; dx < mosaicSize && x + dx < a2Canvas.width; dx++) {
                    const idx = ((y + dy) * a2Canvas.width + (x + dx)) * 4;
                    a2Pixels.data[idx] = averageColor.r;
                    a2Pixels.data[idx + 1] = averageColor.g;
                    a2Pixels.data[idx + 2] = averageColor.b;
                    a2Pixels.data[idx + 3] = 255;  // 不透明
                }
            }
        }
    }

    // 色調変更後のa2画像を新しいCanvasに描画
    a2Ctx.putImageData(a2Pixels, 0, 0);

    // 最終的な画像を返す
    return a2Canvas;
}

// ピクセルデータから平均色を計算する関数
function getAverageColor(pixels, startX, startY, blockSize, width) {
    let r = 0, g = 0, b = 0;
    let count = 0;

    // モザイクブロック内のピクセルを走査
    for (let y = startY; y < startY + blockSize && y < width; y++) {
        for (let x = startX; x < startX + blockSize && x < width; x++) {
            const idx = (y * width + x) * 4;
            r += pixels.data[idx];
            g += pixels.data[idx + 1];
            b += pixels.data[idx + 2];
            count++;
        }
    }

    // 平均色を計算
    return {
        r: Math.floor(r / count),
        g: Math.floor(g / count),
        b: Math.floor(b / count)
    };
}
