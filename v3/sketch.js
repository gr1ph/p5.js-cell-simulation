let cells = [];
let showBorder = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 50; i++) {
        cells.push(new Cell(random(width), random(height), random(5, 15), 'single'));
    }
    for (let i = 0; i < 10; i++) {
        cells.push(new Cell(random(width), random(height), random(20, 30), 'multi'));
    }
    setupControls();
}

function draw() {
    background(255);
    if (showBorder) {
        noFill();
        stroke(0);
        rect(0, 0, width, height);
    }
    for (let i = cells.length - 1; i >= 0; i--) {
        let cell = cells[i];
        cell.move();
        cell.display();
        cell.reproduce();
        cell.incrementAge(); // Renamed method
        cell.checkInteractions();
        if (cell.isDead()) {
            cells.splice(i, 1);
        }
    }
}

function setupControls() {
    document.getElementById('addSingleCell').addEventListener('click', () => {
        cells.push(new Cell(random(width), random(height), random(5, 15), 'single'));
    });
    document.getElementById('addMultiCell').addEventListener('click', () => {
        cells.push(new Cell(random(width), random(height), random(20, 30), 'multi'));
    });
    document.getElementById('toggleBorder').addEventListener('change', (event) => {
        showBorder = event.target.checked;
    });
}

class Cell {
    constructor(x, y, size, type) {
        this.position = createVector(x, y);
        this.size = size;
        this.type = type;
        this.age = 0;
        this.lifespan = random(200, 400);
        this.reproductionRate = (this.type === 'single') ? 0.01 : 0.005;
    }

    move() {
        let angle = noise(this.position.x * 0.01, this.position.y * 0.01) * TWO_PI;
        this.position.x += cos(angle);
        this.position.y += sin(angle);
        this.position.x = constrain(this.position.x, 0, width);
        this.position.y = constrain(this.position.y, 0, height);
    }

    display() {
        noStroke();
        if (this.type === 'single') {
            fill(0, 255, 0, map(this.lifespan - this.age, 0, this.lifespan, 50, 255));
        } else {
            fill(0, 0, 255, map(this.lifespan - this.age, 0, this.lifespan, 50, 255));
        }
        ellipse(this.position.x, this.position.y, this.size);
    }

    reproduce() {
        if (random(1) < this.reproductionRate) {
            let newSize = this.size * 0.5;
            if (newSize > 5) {
                let offset = p5.Vector.random2D().mult(this.size);
                cells.push(new Cell(this.position.x + offset.x, this.position.y + offset.y, newSize, this.type));
                this.size = newSize;
            }
        }
    }

    incrementAge() { // Renamed method
        this.age++;
    }

    isDead() {
        return this.age > this.lifespan;
    }

    checkInteractions() {
        for (let other of cells) {
            if (other !== this && p5.Vector.dist(this.position, other.position) < (this.size + other.size) / 2) {
                if (this.type === other.type) {
                    // Merge cells
                    this.size = sqrt(sq(this.size) + sq(other.size));
                    other.size = 0; // Mark other for removal
                } else {
                    // Split cells
                    this.size *= 0.5;
                    other.size *= 0.5;
                }
            }
        }
        cells = cells.filter(cell => cell.size > 0); // Remove cells marked for removal
    }
}
