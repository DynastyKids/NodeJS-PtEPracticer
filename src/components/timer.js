/* Timer on page */
let seconds = 0;
let intervalId;

function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return (`Time used: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}

function startStopwatch() {
    intervalId = setInterval(() => {
        seconds++;
        document.getElementById('stopwatch').innerText = formatTime(seconds);
    }, 1000);
}

function stopStopwatch() {
    clearInterval(intervalId);
}

function resetStopwatch() {
    seconds = 0;
    document.getElementById('stopwatch').innerText = formatTime(seconds);
}
/* Timer on page ends*/

document.addEventListener('DOMContentLoaded', () => {
    startStopwatch();
});

document.querySelector("#btnResettimer").addEventListener('click', () => {
    resetStopwatch()
});