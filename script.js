const home = document.getElementById("home");
const letterPage = document.getElementById("letterPage");
const openButton = document.getElementById("openButton");
const restartButton = document.getElementById("restartButton");
const envelope = document.querySelector(".envelope");
const flap = document.getElementById("flap");
const dragInstruction = document.getElementById("dragInstruction");

openButton.addEventListener("click", () => {
    home.classList.remove("active");

    setTimeout(() => {
        letterPage.classList.add("active");
    }, 500);
});

restartButton.addEventListener("click", () => {
    envelope.classList.remove("open");
    flap.style.transform = "rotateX(0deg)";
    dragInstruction.style.opacity = "1";

    letterPage.classList.remove("active");

    setTimeout(() => {
        home.classList.add("active");
    }, 500);
});

let isDragging = false;
let isClosing = false;
let startY = 0;
let currentY = 0;
let dragAmount = 0;

/*
 * CLOSED: drag the flap upward to open.
 */
flap.addEventListener("pointerdown", startOpenDrag);
flap.addEventListener("pointermove", dragOpenFlap);
flap.addEventListener("pointerup", finishOpenDrag);
flap.addEventListener("pointercancel", finishOpenDrag);

function startOpenDrag(event) {
    if (envelope.classList.contains("open")) return;

    isDragging = true;
    startY = event.clientY;
    flap.setPointerCapture(event.pointerId);
    flap.style.transition = "none";
}

function dragOpenFlap(event) {
    if (!isDragging || envelope.classList.contains("open")) return;

    currentY = event.clientY;
    let difference = startY - currentY;

    if (difference < 0) difference = 0;

    dragAmount = Math.min(difference, 180);
    const rotation = Math.min(dragAmount * 1.2, 180);

    flap.style.transform = `rotateX(${rotation}deg)`;

    if (dragAmount > 20) {
        dragInstruction.style.opacity = "0";
    }
}

function finishOpenDrag() {
    if (!isDragging) return;

    isDragging = false;
    flap.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1)";

    if (dragAmount > 80) {
        openEnvelope();
    } else {
        flap.style.transform = "rotateX(0deg)";
        dragInstruction.style.opacity = "1";
    }

    dragAmount = 0;
}

/*
 * OPEN: drag the opened letter/card downward to close it.
 * This works with mouse and touch.
 */
letterPage.addEventListener("pointerdown", startCloseDrag);
letterPage.addEventListener("pointermove", dragCloseCard);
letterPage.addEventListener("pointerup", finishCloseDrag);
letterPage.addEventListener("pointercancel", finishCloseDrag);

function startCloseDrag(event) {
    if (!envelope.classList.contains("open")) return;
    if (event.target.closest("button")) return;

    isClosing = true;
    startY = event.clientY;
    currentY = startY;
    envelope.style.transition = "none";
}

function dragCloseCard(event) {
    if (!isClosing || !envelope.classList.contains("open")) return;

    currentY = event.clientY;
    const difference = currentY - startY;

    /* Only allow dragging downward to close. */
    if (difference <= 0) return;

    dragAmount = Math.min(difference, 150);

    /* Move the whole opened letter downward as the user drags. */
    const letter = envelope.querySelector(".letter");
    const progress = dragAmount / 150;
    const y = -25 + (140 * progress);

    letter.style.transition = "none";
    letter.style.transform = `translateY(${y}%)`;

    /* Rotate the flap back toward its closed position. */
    const rotation = 180 - (180 * progress);
    flap.style.transition = "none";
    flap.style.transform = `rotateX(${rotation}deg)`;
}

function finishCloseDrag() {
    if (!isClosing) return;

    isClosing = false;

    const letter = envelope.querySelector(".letter");

    letter.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1)";
    flap.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1)";

    if (dragAmount > 70) {
        closeEnvelope();
    } else {
        /* Snap back to the fully-open state. */
        letter.style.transform = "translateY(-25%)";
        flap.style.transform = "rotateX(180deg)";
    }

    dragAmount = 0;
}

function openEnvelope() {
    const letter = envelope.querySelector(".letter");

    envelope.classList.add("open");

    flap.style.transform = "rotateX(180deg)";
    letter.style.transform = "translateY(-25%)";

    createHeartExplosion();
}

function closeEnvelope() {
    const letter = envelope.querySelector(".letter");

    /* Completely hide the letter before returning to the closed state. */
    envelope.classList.remove("open");
    letter.style.transform = "translateY(115%)";
    flap.style.transform = "rotateX(0deg)";
    dragInstruction.style.opacity = "1";
}

function createHeartExplosion() {
    const amount = 25;

    for (let i = 0; i < amount; i++) {
        const heart = document.createElement("div");

        heart.innerHTML = Math.random() > .5 ? "♥" : "♡";
        heart.style.position = "fixed";
        heart.style.left = "50%";
        heart.style.top = "50%";
        heart.style.zIndex = "100";
        heart.style.pointerEvents = "none";
        heart.style.color = Math.random() > .5 ? "#ff1744" : "#ff8fa3";
        heart.style.fontSize = `${15 + Math.random() * 25}px`;

        document.body.appendChild(heart);

        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 300;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        heart.animate(
            [
                {
                    transform: "translate(-50%, -50%) scale(0)",
                    opacity: 1
                },
                {
                    transform: `translate(
                        calc(-50% + ${x}px),
                        calc(-50% + ${y}px)
                    ) scale(1.3) rotate(180deg)`,
                    opacity: 0
                }
            ],
            {
                duration: 1200 + Math.random() * 1000,
                easing: "cubic-bezier(.2,.8,.2,1)"
            }
        );

        setTimeout(() => heart.remove(), 2300);
    }
}

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let width;
let height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];
let fireworks = [];

function createFirework() {
    const x = Math.random() * width;
    const y = Math.random() * (height * .65);

    fireworks.push({
        x,
        y: height + 20,
        targetY: y,
        speed: 5 + Math.random() * 3
    });
}

function createHeartFirework(x, y) {
    const count = 45;

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;

        const heartX = 16 * Math.pow(Math.sin(angle), 3);

        const heartY = -(
            13 * Math.cos(angle)
            - 5 * Math.cos(2 * angle)
            - 2 * Math.cos(3 * angle)
            - Math.cos(4 * angle)
        );

        particles.push({
            x,
            y,
            vx: heartX * (.08 + Math.random() * .03),
            vy: heartY * (.08 + Math.random() * .03),
            life: 1,
            decay: .008 + Math.random() * .012,
            size: 2 + Math.random() * 2
        });
    }
}

function animateFireworks() {
    ctx.clearRect(0, 0, width, height);

    if (Math.random() < .025 && fireworks.length < 4) {
        createFirework();
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];

        firework.y -= firework.speed;

        if (firework.y <= firework.targetY) {
            createHeartFirework(firework.x, firework.y);
            fireworks.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffb3c1";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ff1744";
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += .015;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();

        ctx.translate(particle.x, particle.y);
        ctx.scale(particle.size, particle.size);

        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-5, -2, -5, -7, 0, -4);
        ctx.bezierCurveTo(5, -7, 5, -2, 0, 3);

        ctx.fillStyle = `rgba(255, 80, 110, ${particle.life})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff1744";
        ctx.fill();

        ctx.restore();
    }

    requestAnimationFrame(animateFireworks);
}

animateFireworks();

document.addEventListener("click", function(event) {
    if (
        event.target.closest("button") ||
        event.target.closest(".flap")
    ) {
        return;
    }

    createClickHeart(event.clientX, event.clientY);
});

function createClickHeart(x, y) {
    const heart = document.createElement("div");

    heart.innerHTML = "♥";
    heart.style.position = "fixed";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.zIndex = "999";
    heart.style.pointerEvents = "none";
    heart.style.color = "#ff4265";
    heart.style.fontSize = "20px";

    document.body.appendChild(heart);

    heart.animate(
        [
            {
                transform: "translate(-50%, -50%) scale(.5)",
                opacity: 1
            },
            {
                transform: "translate(-50%, -100px) scale(1.5)",
                opacity: 0
            }
        ],
        {
            duration: 1000,
            easing: "ease-out"
        }
    );

    setTimeout(() => heart.remove(), 1000);
}
