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
    closeEnvelope();

    letterPage.classList.remove("active");

    setTimeout(() => {
        home.classList.add("active");
    }, 500);
});

let isDragging = false;
let startY = 0;
let currentY = 0;
let dragAmount = 0;

flap.addEventListener("pointerdown", startDrag);

function startDrag(event) {
    isDragging = true;
    startY = event.clientY;
    dragAmount = 0;

    flap.setPointerCapture(event.pointerId);
    flap.style.transition = "none";

    if (envelope.classList.contains("open")) {
        dragInstruction.style.opacity = "0";
    }
}

flap.addEventListener("pointermove", dragFlap);

function dragFlap(event) {
    if (!isDragging) return;

    currentY = event.clientY;

    // Closed: drag UP to open.
    if (!envelope.classList.contains("open")) {
        const upwardDistance = Math.max(0, startY - currentY);
        dragAmount = Math.min(upwardDistance, 150);

        const rotation = Math.min(dragAmount * 1.2, 180);
        flap.style.transform = `rotateX(${rotation}deg)`;

        if (dragAmount > 20) {
            dragInstruction.style.opacity = "0";
        }
        return;
    }

    // Open: drag DOWN to close.
    const downwardDistance = Math.max(0, currentY - startY);
    dragAmount = Math.min(downwardDistance, 150);

    const rotation = Math.max(0, 180 - dragAmount * 1.2);
    flap.style.transform = `rotateX(${rotation}deg)`;
}

flap.addEventListener("pointerup", finishDrag);
flap.addEventListener("pointercancel", cancelDrag);

function finishDrag() {
    if (!isDragging) return;

    isDragging = false;
    flap.style.transition =
        "transform .8s cubic-bezier(.2,.8,.2,1)";

    if (!envelope.classList.contains("open")) {
        if (dragAmount > 80) {
            openEnvelope();
        } else {
            flap.style.transform = "rotateX(0deg)";
            dragInstruction.style.opacity = "1";
        }
    } else {
        if (dragAmount > 80) {
            closeEnvelope();
        } else {
            flap.style.transform = "rotateX(180deg)";
        }
    }

    dragAmount = 0;
}

function cancelDrag() {
    if (!isDragging) return;

    isDragging = false;
    flap.style.transition =
        "transform .8s cubic-bezier(.2,.8,.2,1)";

    if (envelope.classList.contains("open")) {
        flap.style.transform = "rotateX(180deg)";
    } else {
        flap.style.transform = "rotateX(0deg)";
        dragInstruction.style.opacity = "1";
    }

    dragAmount = 0;
}

function openEnvelope() {
    envelope.classList.add("open");
    flap.style.transform = "rotateX(180deg)";

    dragInstruction.innerHTML =
        '<span class="drag-arrow">↓</span><span>Drag down to close</span>';
    dragInstruction.style.opacity = "1";

    createHeartExplosion();
}

function closeEnvelope() {
    envelope.classList.remove("open");
    flap.style.transform = "rotateX(0deg)";

    dragInstruction.innerHTML =
        '<span class="drag-arrow">↑</span><span>Drag up to open</span>';
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
