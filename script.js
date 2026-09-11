
/* =====================================================
   POROTTA LAYER ANALYZER
   Front-end demonstration using HTML, CSS and JavaScript
   ===================================================== */


/* -----------------------------
   GLOBAL VARIABLES
----------------------------- */

let uploadedPhotos = [];
let historyData = JSON.parse(
    localStorage.getItem("porottaHistory")
) || [];

const photoInput = document.getElementById("photoInput");
const anotherPhotoBtn = document.getElementById("anotherPhotoBtn");
const previewGrid = document.getElementById("previewGrid");
const photoCount = document.getElementById("photoCount");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultSection = document.getElementById("resultSection");

const resultImage = document.getElementById("resultImage");
const resultName = document.getElementById("resultName");

const layerResult = document.getElementById("layerResult");
const diameterResult = document.getElementById("diameterResult");
const thicknessResult = document.getElementById("thicknessResult");
const dimensionResult = document.getElementById("dimensionResult");

const accuracyBar = document.getElementById("accuracyBar");
const accuracyResult = document.getElementById("accuracyResult");

const qualityResult = document.getElementById("qualityResult");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


/* -----------------------------
   INITIALIZE
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    renderHistory();

    setupNavbar();

});


/* -----------------------------
   UPLOAD BUTTON
----------------------------- */

photoInput.addEventListener("change", (event) => {

    const files = Array.from(event.target.files);

    if (!files.length) {
        return;
    }

    files.forEach(file => {

        if (!file.type.startsWith("image/")) {

            showToast("Please select an image file.");

            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            showToast("Image must be smaller than 10 MB.");

            return;
        }

        addPhoto(file);

    });

    photoInput.value = "";

});


/* -----------------------------
   ANOTHER PHOTO BUTTON
----------------------------- */

anotherPhotoBtn.addEventListener("click", () => {

    photoInput.click();

});


/* -----------------------------
   ADD PHOTO
----------------------------- */

function addPhoto(file) {

    const reader = new FileReader();

    reader.onload = function(event) {

        const photo = {

            id: Date.now() + Math.random(),

            name: file.name,

            src: event.target.result,

            file: file

        };

        uploadedPhotos.push(photo);

        renderPreviews();

        showToast("Porotta photo added.");

    };

    reader.readAsDataURL(file);

}


/* -----------------------------
   RENDER PREVIEWS
----------------------------- */

function renderPreviews() {

    previewGrid.innerHTML = "";

    if (uploadedPhotos.length === 0) {

        previewGrid.innerHTML = `
            <div class="empty-preview">
                <div>🥞</div>
                <p>Your uploaded porottas will appear here</p>
            </div>
        `;

    }

    uploadedPhotos.forEach(photo => {

        const item = document.createElement("div");

        item.className = "preview-item";

        item.innerHTML = `
            <img
                src="${photo.src}"
                alt="${escapeHTML(photo.name)}"
            >

            <button
                class="remove-photo"
                onclick="removePhoto('${photo.id}')"
                title="Remove"
            >
                ×
            </button>
        `;

        previewGrid.appendChild(item);

    });


    photoCount.textContent =
        `${uploadedPhotos.length} ${
            uploadedPhotos.length === 1
            ? "photo"
            : "photos"
        }`;


    analyzeBtn.disabled =
        uploadedPhotos.length === 0;

}


/* -----------------------------
   REMOVE PHOTO
----------------------------- */

function removePhoto(id) {

    uploadedPhotos =
        uploadedPhotos.filter(photo => String(photo.id) !== String(id));

    renderPreviews();

    showToast("Photo removed.");

}


/* -----------------------------
   ANALYZE
----------------------------- */

analyzeBtn.addEventListener("click", () => {

    if (uploadedPhotos.length === 0) {

        showToast("Upload a porotta first.");

        return;
    }


    const photo = uploadedPhotos[0];

    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML =
        `<span>⏳</span> Analyzing...`;


    /*
       Small delay to create an analysis animation.
    */

    setTimeout(() => {

        const result =
            generateAnalysis(photo);


        displayResult(photo, result);

        saveHistory(photo, result);

        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML =
            `<span>🔍</span> Analyze Porotta`;


        showToast("Porotta analysis completed.");

    }, 1800);

});


/* -----------------------------
   GENERATE ANALYSIS
----------------------------- */

function generateAnalysis(photo) {

    /*
       This is a front-end estimation/demo.

       A real scientific layer detector would require
       computer vision / ML processing.

       We use image characteristics to create
       repeatable estimated results.
    */


    const imageSize =
        photo.src.length;


    /*
       Create a pseudo-random value based on image.
       Same image will approximately produce the same result.
    */

    const seed =
        imageSize % 1000;


    const layers =
        24 + (seed % 15);


    const diameter =
        (17 + ((seed % 30) / 10)).toFixed(1);


    const thickness =
        (1.2 + ((seed % 12) / 10)).toFixed(1);


    const accuracy =
        86 + (seed % 11);


    let quality;


    if (layers >= 34 && accuracy >= 92) {

        quality = "Excellent";

    } else if (layers >= 28 && accuracy >= 89) {

        quality = "Very Good";

    } else if (layers >= 24) {

        quality = "Good";

    } else {

        quality = "Average";

    }


    return {

        layers: layers,

        diameter: diameter,

        thickness: thickness,

        accuracy: accuracy,

        quality: quality,

        dimensions:
            `${diameter} × ${diameter} cm`,

        date:
            new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            })

    };

}


/* -----------------------------
   DISPLAY RESULT
----------------------------- */

function displayResult(photo, result) {

    resultSection.classList.remove("hidden");


    resultImage.src = photo.src;

    resultName.textContent =
        photo.name;


    animateNumber(
        layerResult,
        0,
        result.layers,
        900
    );


    diameterResult.textContent =
        `${result.diameter} cm`;


    thicknessResult.textContent =
        `${result.thickness} cm`;


    dimensionResult.textContent =
        result.dimensions;


    accuracyResult.textContent =
        `${result.accuracy}%`;


    qualityResult.textContent =
        result.quality;


    accuracyBar.style.width = "0%";


    setTimeout(() => {

        accuracyBar.style.width =
            `${result.accuracy}%`;

    }, 100);


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* -----------------------------
   NUMBER ANIMATION
----------------------------- */

function animateNumber(element, start, end, duration) {

    const startTime = performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime - startTime;


        const progress =
            Math.min(elapsed / duration, 1);


        const value =
            Math.floor(
                start +
                (end - start) *
                easeOut(progress)
            );


        element.textContent = value;


        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }


    requestAnimationFrame(update);

}


function easeOut(t) {

    return 1 - Math.pow(1 - t, 3);

}


/* -----------------------------
   SAVE HISTORY
----------------------------- */

function saveHistory(photo, result) {

    const historyItem = {

        id: Date.now(),

        name: photo.name,

        image: photo.src,

        layers: result.layers,

        diameter: result.diameter,

        thickness: result.thickness,

        dimensions: result.dimensions,

        accuracy: result.accuracy,

        quality: result.quality,

        date: result.date

    };


    historyData.unshift(historyItem);


    /*
       Keep the latest 20 records.
    */

    historyData =
        historyData.slice(0, 20);


    localStorage.setItem(
        "porottaHistory",
        JSON.stringify(historyData)
    );


    renderHistory();

}


/* -----------------------------
   RENDER HISTORY
----------------------------- */

function renderHistory() {

    if (historyData.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>📊</div>
                <h3>No analysis history yet</h3>
                <p>
                    Analyze your first porotta to see it here.
                </p>
            </div>
        `;

        return;
    }


    let rows = "";


    historyData.forEach(item => {

        rows += `

            <tr>

                <td>
                    <img
                        class="history-photo"
                        src="${item.image}"
                        alt="Porotta"
                    >
                </td>

                <td>
                    ${escapeHTML(item.name)}
                </td>

                <td>
                    <span class="history-layers">
                        ${item.layers} layers
                    </span>
                </td>

                <td>
                    ${item.dimensions}
                </td>

                <td>
                    ${item.accuracy}%
                </td>

                <td>
                    <span class="history-quality">
                        ${item.quality}
                    </span>
                </td>

                <td>
                    ${item.date}
                </td>

                <td>
                    <button
                        class="delete-history"
                        onclick="deleteHistory(${item.id})"
                    >
                        🗑
                    </button>
                </td>

            </tr>

        `;

    });


    historyList.innerHTML = `

        <table class="history-table">

            <thead>

                <tr>

                    <th>PHOTO</th>
                    <th>NAME</th>
                    <th>LAYERS</th>
                    <th>DIMENSIONS</th>
                    <th>ACCURACY</th>
                    <th>QUALITY</th>
                    <th>DATE</th>
                    <th></th>

                </tr>

            </thead>

            <tbody>
                ${rows}
            </tbody>

        </table>

    `;

}


/* -----------------------------
   DELETE HISTORY ITEM
----------------------------- */

function deleteHistory(id) {

    historyData =
        historyData.filter(
            item => item.id !== id
        );


    localStorage.setItem(
        "porottaHistory",
        JSON.stringify(historyData)
    );


    renderHistory();

    showToast("History item deleted.");

}


/* -----------------------------
   CLEAR HISTORY
----------------------------- */

clearHistoryBtn.addEventListener("click", () => {

    if (historyData.length === 0) {

        showToast("History is already empty.");

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to clear all previous porotta results?"
        );


    if (!confirmDelete) {

        return;

    }


    historyData = [];


    localStorage.removeItem(
        "porottaHistory"
    );


    renderHistory();

    showToast("All history cleared.");

});


/* -----------------------------
   TOAST
----------------------------- */

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* -----------------------------
   NAVBAR ACTIVE LINK
----------------------------- */

function setupNavbar() {

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(".navbar nav a");


    window.addEventListener("scroll", () => {

        let current = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;


            if (
                window.scrollY >= sectionTop
            ) {

                current =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                `#${current}`
            ) {

                link.classList.add("active");

            }

        });

    });

}


/* -----------------------------
   HTML ESCAPE
----------------------------- */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
