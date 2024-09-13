(() => {
    const config = {
        dotMinRad   : 1,
        dotMaxRad   : 3,
        spreadRad   : 100,
        massFactor  : 0.002,
        defColor    : `rgba(250, 10, 30, 0.9)`,
        smooth      : 0.95,
        effectRad   : 300,
        mouseVelMul : 5
    }
    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector("canvas");
    const ctx    = canvas.getContext('2d');
    const counter = document.getElementById("ParticleCount");

    let width, height, mouse, dots, lastTime;



    class Dot {
        constructor() {
            this.pos    = {x: mouse.x, y: mouse.y};
            this.vel    = {x: mouse.vel.x * config.mouseVelMul, y: mouse.vel.y * config.mouseVelMul};
            this.rad    = random(config.dotMinRad, config.dotMaxRad);
            this.mass   = this.rad * config.massFactor;
            this.color  = config.defColor;
        }

        draw() {
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            if (this.pos.x + this.rad > width || this.pos.x - this.rad < 0) {
                this.vel.x *= -1;
            }
            if (this.pos.y + this.rad > height || this.pos.y - this.rad < 0) {
                this.vel.y *= -1;
            }

            createCircle(this.pos.x, this.pos.y, this.rad, true, this.color);
        }
    }

    function updateDots() {
        for (let i = 0; i < dots.length; i++) {
            let acc = {x: 0, y: 0};
            for (let j = 0; j < dots.length; j++) {
                if (i === j) continue;
                let [a, b] = [dots[i], dots[j]];

                let delta = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y};
                let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y) || 1;

                if (dist > config.effectRad) continue;

                let force = (dist - config.spreadRad) / dist * b.mass;
                acc.x += delta.x * force;
                acc.y += delta.y * force;
            }

            dots[i].vel.x = dots[i].vel.x * config.smooth + acc.x * dots[i].mass;
            dots[i].vel.y = dots[i].vel.y * config.smooth + acc.y * dots[i].mass;
        }
    }

    function createCircle(x, y, rad, fill, color) {
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TWO_PI);
        ctx.closePath();
        fill ? ctx.fill() : ctx.stroke();
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function init() {
        width = canvas.width = innerWidth;
        height = canvas.height = innerHeight;

        mouse = {x: width / 2, y: height / 2, old:{x: 0, y: 0}, vel: {x: 0, y: 0}, down: false};

        dots = [];
    }

    function loop() {
        ctx.clearRect(0, 0, width, height);
        if (mouse.down) { dots.push(new Dot()); }
        updateDots();

        dots.forEach(e => { e.draw() });

        counter.textContent = `Dots count: ${dots.length}`;

        window.requestAnimationFrame(loop);
    }

    init();
    loop();

    function setPos(event) {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        if (deltaTime > 0) {
            mouse.vel.x = (event.x - mouse.old.x) / deltaTime;
            mouse.vel.y = (event.y - mouse.old.y) / deltaTime;
        }

        mouse.old = {x: event.x, y: event.y};
        lastTime = currentTime;

        [mouse.x, mouse.y] = [event.x, event.y];
    }

    function isDown() {
        mouse.down = !mouse.down;
    }

    canvas.addEventListener('mousemove', setPos);
    window.addEventListener('mousedown', isDown);
    window.addEventListener('mouseup', isDown);
})();
