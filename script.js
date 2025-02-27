// 画像の色調変更を処理する関数
async function processSingleImage(a1Image, a2Image) {
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

    // 色調変更の処理 (a1の色をa2の画像に適用)
    for (let i = 0; i < a1Pixels.data.length; i += 4) {
        const r = a1Pixels.data[i];     // Red
        const g = a1Pixels.data[i + 1]; // Green
        const b = a1Pixels.data[i + 2]; // Blue

        // a2のピクセルデータに色調を適用
        a2Pixels.data[i] = r;
        a2Pixels.data[i + 1] = g;
        a2Pixels.data[i + 2] = b;
        a2Pixels.data[i + 3] = 255;  // Alpha (不透明)
    }

    // 色調変更後のa2画像を新しいCanvasに描画
    a2Ctx.putImageData(a2Pixels, 0, 0);

    // 新しく色調を変更した画像を返す
    const newImage = new Image();
    newImage.src = a2Canvas.toDataURL(); // 新しい画像のDataURLを返す
    await newImage.decode();  // 画像が読み込まれるのを待つ
    return newImage;
}

// 画像処理を実行する関数
async function processImages() {
    const a1Files = document.getElementById("a1-images").files;
    const a2File = document.getElementById("a2-image").files[0];

    if (a1Files.length === 0 || !a2File) {
        alert("a1とa2の画像を選択してください");
        return;
    }

    const a2Image = await loadImage(a2File);
    const zip = new JSZip();
    let progress = 0;

    // 進捗バーの初期化
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    for (let i = 0; i < a1Files.length; i++) {
        const a1File = a1Files[i];
        const a1Image = await loadImage(a1File);

        // a1の画像を処理してa2の画像に色調変更を適用
        const processedImage = await processSingleImage(a1Image, a2Image);

        // 画像をZIPに追加
        const imgData = processedImage.src.split(",")[1];
        zip.file(a1File.name, imgData, { base64: true });

        progress = Math.floor(((i + 1) / a1Files.length) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    // ダウンロードリンクを作成して強制的にダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = "processed_images.zip";
    downloadLink.click();  // ダウンロードを強制的に開始

    // 処理完了のアラート
    alert("処理が完了しました！");

    // ダウンロードリンクを非表示に
    downloadLink.style.display = "none";
}

// 画像を読み込む関数
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// 画像処理ボタンのクリックイベント
document.getElementById("process-button").addEventListener("click", processImages);
