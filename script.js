// ファイル選択のイベントを処理
document.getElementById("process-button").addEventListener("click", () => {
    const a1Files = document.getElementById("a1-images").files;
    const a2File = document.getElementById("a2-image").files[0];

    if (a1Files.length === 0 || !a2File) {
        alert("a1とa2の画像を選択してください");
        return;
    }

    processImages(a1Files, a2File);
});

// 画像処理を開始
async function processImages(a1Files, a2File) {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    let processedImages = [];

    // a2画像の読み込み
    const a2Image = await loadImage(a2File);

    // 各a1画像を処理
    for (let i = 0; i < a1Files.length; i++) {
        const a1Image = await loadImage(a1Files[i]);
        const processedImage = await processSingleImage(a1Image, a2Image);

        processedImages.push(processedImage);

        // 進捗更新
        const progress = ((i + 1) / a1Files.length) * 100;
        progressBar.value = progress;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    // すべての画像処理が完了したら、ZIPを作成してダウンロードリンクを表示
    const zip = await createZip(processedImages, a1Files);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    // ダウンロードリンクの表示
    const downloadLink = document.getElementById("download-link");
    downloadLink.href = zipUrl;
    downloadLink.style.display = "inline-block";  // ボタンを表示
    downloadLink.download = "processed_images.zip";
}

// 画像を読み込む
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = URL.createObjectURL(file);
    });
}

// 1枚の画像を処理
async function processSingleImage(a1Image, a2Image) {
    // ここでa1の色調に基づいてa2を変換する処理を実装する
    // 現在はa2画像をそのまま返すだけにしている
    return a2Image;
}

// ZIPファイルを作成
async function createZip(processedImages, a1Files) {
    const JSZip = window.JSZip;
    const zip = new JSZip();

    for (let i = 0; i < processedImages.length; i++) {
        const processedImage = processedImages[i];

        // 画像をCanvasに描画してBase64エンコードされたデータを取得
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = processedImage.width;
        canvas.height = processedImage.height;
        ctx.drawImage(processedImage, 0, 0);

        const base64Data = canvas.toDataURL("image/png");

        // a1のファイル名を使用して保存
        const fileName = a1Files[i].name;
        zip.file(fileName, base64Data.split(',')[1], { base64: true });
    }

    return zip;
}
