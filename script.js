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
        dotMinRad   : 30,
        dotMaxRad   : 30,
        spreadRad   : 150,
        massFactor  : 0.003,
        defColor    : `rgba(250, 10, 30, 0.9)`,
        smooth      : 0.7,
        effectRad   : 150,
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
        constructor(text= "#", connectTo = [], posX=width/2, posY=height/2) {
            this.id     = this.newId();
            this.text   = text;
            this.connect= connectTo;
            this.pos    = {x: posX, y: posY};
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

    function updateDots(arr) {
        for (let i = 0; i < arr.length; i++) {
            let acc = {x: 0, y: 0};
            for (let j = 0; j < arr.length; j++) {
                if (i === j) continue;
                let [a, b] = [arr[i], arr[j]];
    
                let delta = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y};
                let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y) || 1;
    
                if (a == arr[0]) continue;
    
                if (a.connect[0] == b.id) {
                    // Притяжение к родителю для сохранения spreadRad
                    let force = (dist - config.spreadRad) / dist;
                    acc.x += delta.x * force;
                    acc.y += delta.y * force;
                } else if (dist < config.effectRad) {
                    // Добавляем силу отталкивания для всех остальных точек
                    let repulsionForce = (config.spreadRad - dist) / dist * b.mass * 10;
                    acc.x -= delta.x * repulsionForce;
                    acc.y -= delta.y * repulsionForce;
                }
            }
    
            arr[i].vel.x = arr[i].vel.x * config.smooth + acc.x * arr[i].mass;
            arr[i].vel.y = arr[i].vel.y * config.smooth + acc.y * arr[i].mass;
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
        return list.find(dot => dot.id == id);
    }
    
    function random(min, max) { 
        return Math.random() * (max - min) + min;
    }

    function init() {
        width = canvas.width = innerWidth;
        height = canvas.height = innerHeight;
        mouse = {x: width / 2, y: height / 2, old:{x: 0, y: 0}, vel: {x: 0, y: 0}, down: false};

        list = [];
        dots = [];
        a    = [];
        c1 = 0;
        oldDot = null;

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
        if (mouse.down && c1 < dots.length) { 
            dot = dots[c1]
            if (oldDot != null){ 
                dot.pos.y = oldDot.pos.y  + random(-10, 10);
                dot.pos.x = oldDot.pos.x  + random(-10, 10);
            }
                
            a.push(dot);
            oldDot = dots[c1];
            c1++;
            mouse.down = !mouse.down;
        }

        updateDots(a);
        a.forEach(e => { e.draw() });

        counter.textContent = `Dots count: ${a.length}`;
        window.requestAnimationFrame(loop);
    }
    init();
    loop();

    function isDown() {mouse.down = !mouse.down;}
    window.addEventListener('mousedown', isDown);
})();
