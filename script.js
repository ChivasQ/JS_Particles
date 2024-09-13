(() => {
    let width, height, mouse, lastTime;
    c = 0;
    const colors = [
        `rgba(255, 0, 0, 1)`,
        `rgba(0, 255, 0, 1)`,
        `rgba(0, 0, 255, 1)`,
        `rgba(255, 255, 0, 1)`,
        `rgba(0, 255, 255, 1)`,
        `rgba(255, 0, 255, 1)`,
        `rgba(128, 0, 128, 1)`,
        `rgba(255, 165, 0, 1)`,
        `rgba(0, 128, 0, 1)`,
        `rgba(128, 128, 128, 1)`,
    ]
    
    const config = {
        dotMinRad   : 20,
        dotMaxRad   : 20,
        spreadRad   : 100,
        massFactor  : 0.002,
        defColor    : `rgba(250, 10, 30, 0.9)`,
        smooth      : 0.95,
        effectRad   : 75,
        mouseVelMul : 5,
        api         : "https://raw.githubusercontent.com/ChivasQ/JS_Particles/master/sample.json",
        lineHeight  : 15,
        textMaxLen  : 30,
        font        : 12,
    }
    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector("canvas");
    const ctx    = canvas.getContext('2d');
    const counter = document.getElementById("ParticleCount");
    let id = 0;


    class Dot {
        constructor(text= "#", connectTo = []) {
            this.id     = this.newId();
            this.text   = text;
            this.connect= connectTo;
            this.pos    = {x: width/2 + random(-10, 10), y: height/2 + random(-10, 10)};
            this.vel    = {x: 0, y: 0};
            this.rad    = random(config.dotMinRad, config.dotMaxRad);
            this.mass   = this.rad * config.massFactor;
            this.color  = config.defColor;
            this.lineColor  = nextColor();
        }

        draw() {
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            if (this.pos.x + this.rad > width || this.pos.x - this.rad < 0) {this.vel.x *= -1;}
            if (this.pos.y + this.rad > height || this.pos.y - this.rad < 0) {this.vel.y *= -1;}
            
            fillText(this.text, this.pos.x, this.pos.y, config.font, `rgba(255, 255, 255, 0.9)`);
            createCircle(this.pos.x, this.pos.y, this.rad, true, this.color);

            for (let i = 0; i < this.connect.length; i++) {
                const dot2 = getDotById(this.connect[i], dots);
                if (dot2) {
                    drawLine(this.pos.x, this.pos.y, dot2.pos.x, dot2.pos.y, this.lineColor);
                }
            }
        }

        newId() {
            return id++;
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
        ctx.globalCompositeOperation="destination-over";
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TWO_PI);
        ctx.closePath();
        fill ? ctx.fill() : ctx.stroke();
       
    }

    function fillText(text, x, y, size, color) {
        ctx.globalCompositeOperation="destination-over";
        ctx.fillStyle = color;
        ctx.font = `${size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        let lines = wrapText(text, config.textMaxLen);

        for (let i = 0; i < lines.length; i++){
            ctx.fillText(lines[i], x, y + (i * config.lineHeight) - config.lineHeight*lines.length/2);
        }
    }

    function drawLine(x0, y0, x1, y1, color) {
        ctx.globalCompositeOperation="destination-over";
        ctx.strokeStyle = color;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
       
        ctx.stroke();
    }

    function nextColor() {
        if (c >= colors.length)
            c = 0;
        else
            c++; 
        return colors[c];
    }
    function wrapText(text, maxLength) {
        let words = text.split(' '); 
        let lines = [];
        let currentLine = '';
    
        words.forEach(word => {
            if ((currentLine + word).length <= maxLength) {
                currentLine += word + ' ';
            } else {
                lines.push(currentLine.trim()); 
                currentLine = word + ' '; 
            }
        });
    
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
    
        return lines;
    }


    function iterateJson(jsonData, parentDot = null) {
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
            for (const key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    let dot = new Dot(key);
                    if (parentDot) {
                        dot.connect.push(parentDot.id); // If there's a parent, add its ID
                    }
                    dots.push(dot);
                    iterateJson(jsonData[key], dot);
                }
            }
        } else if (Array.isArray(jsonData)) {
            jsonData.forEach(item => {
                iterateJson(item, parentDot);
            });
        } else {
            let dot = new Dot(jsonData);
            if (parentDot) {
                dot.connect.push(parentDot.id);
            }
            dots.push(dot);
        }
    }
    function getDotById(id, list) {
        const j = list.find(dot => dot.id == id);
        
        return j;
    }
    
    function random(min, max) { 
        return Math.random() * (max - min) + min;
    }

    function init() {
        width = canvas.width = innerWidth;
        height = canvas.height = innerHeight;

        list = [];
        dots = [];

        fetch(config.api)
          .then((res) => res.json())
          .then((data) => {
            iterateJson(data);

            list.forEach((item) => {
              dots.push(new Dot(item));
            });
        });
    }

    function loop() {
        ctx.clearRect(0, 0, width, height);

        updateDots();
        dots.forEach(e => { e.draw() });

        counter.textContent = `Dots count: ${dots.length}`;

        window.requestAnimationFrame(loop);
    }
    init();
    loop();
})();
