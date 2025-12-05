let auto = false;
let busy = false;
let cycleTimeout = null;
let countdownInterval = null;

/* ELEMENTS */
const red = document.getElementById("red");
const yellow = document.getElementById("yellow");
const green = document.getElementById("green");
const carTimer = document.getElementById("car-timer");

const pedRed = document.getElementById("ped-red");
const pedGreen = document.getElementById("ped-green");
const pedTimer = document.getElementById("ped-timer");
const pedBtn = document.getElementById("ped-btn");

/* ---------------- RESET HELPERS ---------------- */

function clearAllCountdowns() {
    clearInterval(countdownInterval);
    countdownInterval = null;
}

function clearAllTimeouts() {
    clearTimeout(cycleTimeout);
}

function clearCar() {
    red.style.background = "#440000";
    yellow.style.background = "#444400";
    green.style.background = "#003300";

    red.style.boxShadow = "none";
    yellow.style.boxShadow = "none";
    green.style.boxShadow = "none";

    red.classList.remove("glow");
    yellow.classList.remove("glow");
    green.classList.remove("glow");
}


function clearPed() {
    pedRed.style.background = "#440000";
    pedGreen.style.background = "#003300";

    pedRed.style.boxShadow = "none";
    pedGreen.style.boxShadow = "none";

    pedRed.classList.remove("glow");
    pedGreen.classList.remove("glow");
}


function setCar(color) {
    clearCar();

    if (color === "red") {
        red.style.background = "red";
        red.style.boxShadow = "0 0 15px red, 0 0 25px red";
        red.classList.add("glow");
    }
    if (color === "yellow") {
        yellow.style.background = "yellow";
        yellow.style.boxShadow = "0 0 15px yellow, 0 0 25px yellow";
        yellow.classList.add("glow");
    }
    if (color === "green") {
        green.style.background = "lime";
        green.style.boxShadow = "0 0 15px lime, 0 0 25px lime";
        green.classList.add("glow");
    }
}



function setPed(walk) {
    clearPed();

    if (walk) {
        pedGreen.style.background = "lime";
        pedGreen.style.boxShadow = "0 0 15px lime, 0 0 25px lime";
        pedGreen.classList.add("glow");
    } else {
        pedRed.style.background = "red";
        pedRed.style.boxShadow = "0 0 15px red, 0 0 25px red";
        pedRed.classList.add("glow");
    }
}



function countdown(sec, el) {
    clearAllCountdowns();

    el.textContent = sec;

    countdownInterval = setInterval(() => {
        sec--;
        el.textContent = sec;

        if (sec <= 0) {
            clearAllCountdowns();
        }

    }, 1000);
}

/* ---------------- START SYSTEM ---------------- */

function startSystem() {
    stopNightMode();

    clearAllTimeouts();
    clearAllCountdowns();

    auto = true;
    busy = false;

    pedBtn.classList.remove("disabled");
    pedBtn.disabled = false;

    clearCar();
    clearPed();
    setCar("green");
    setPed(false);

    carTimer.textContent = "--";
    pedTimer.textContent = "--";

    startAuto();
}

/* ---------------- STOP SYSTEM (NIGHT MODE) ---------------- */

function stopSystem() {
    stopAuto();
    startNightMode();
}

function startNightMode() {
    busy = true;
    auto = false;

    clearAllTimeouts();
    clearAllCountdowns();

    clearCar();
    clearPed();

    pedBtn.classList.add("disabled");
    pedBtn.disabled = true;

    pedTimer.textContent = "--";
    carTimer.textContent = "--";

    yellow.classList.add("night-blink");
}

function stopNightMode() {
    yellow.classList.remove("night-blink");
    carTimer.textContent = "--";
    busy = false;
}

/* ---------------- AUTO MODE ---------------- */

function stopAuto() {
    clearAllTimeouts();
    clearAllCountdowns();
    carTimer.textContent = "--";
}

function startAuto() {
    stopAuto();
    runAutoCycle();
}

function runAutoCycle() {
    if (!auto || busy) return;

    // GREEN 5s
    setCar("green");
    countdown(5, carTimer);

    cycleTimeout = setTimeout(() => {
        // YELLOW 2s
        setCar("yellow");
        countdown(2, carTimer);

        cycleTimeout = setTimeout(() => {
            // RED 5s
            setCar("red");
            countdown(5, carTimer);

            cycleTimeout = setTimeout(() => {
                runAutoCycle();
            }, 5000);

        }, 2000);

    }, 5000);
}

/* ---------------- PEDESTRIAN REQUEST ---------------- */

function requestPedestrian() {
    if (busy || pedBtn.disabled) return;
    busy = true;

    pedBtn.classList.add("blink");
    stopAuto();

    // 1) Yellow
    setCar("yellow");
    countdown(2, carTimer);

    cycleTimeout = setTimeout(() => {

        // 2) Red
        setCar("red");
        countdown(1, carTimer);

        cycleTimeout = setTimeout(() => {

            // 3) After 1s → Pedestrian green
            setPed(true);
            countdown(5, pedTimer);

            cycleTimeout = setTimeout(() => {

                // 4) Pedestrian red
                setPed(false);
                pedTimer.textContent = "--";

                /* STOP BLINKING IMMEDIATELY WHEN PED TURNS RED */
                pedBtn.classList.remove("blink");

                cycleTimeout = setTimeout(() => {

                    // 5) After 1s → Car green
                    setCar("green");
                    carTimer.textContent = "--";

                    busy = false;

                    if (auto) startAuto();

            }, 1000);


            }, 5000);

        }, 1000);

    }, 2000);
}

/* ---------------- INIT ---------------- */

clearCar();
clearPed();
carTimer.textContent = "--";
pedTimer.textContent = "--";
pedBtn.classList.add("disabled");
pedBtn.disabled = true;


