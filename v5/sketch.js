let cells = [];
let foodSources = [];
let showBorder = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 50; i++) {
        cells.push(new Cell(random(width), random(height), random(5, 15), 'single'));
    }
    for (let i = 0; i < 10; i++) {
        cells.push(new Cell(random(width), random(height), random(20, 30), 'multi'));
    }
    for (let i = 0; i < 20; i++) {
        foodSources.push(new Food(random(width), random(height)));
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
    for (let i = foodSources.length - 1; i >= 0; i--) {
        foodSources[i].display();
    }
    for (let i = cells.length - 1; i >= 0; i--) {
        let cell = cells[i];
        cell.move();
        cell.display();
        cell.reproduce();
        cell.incrementAge(); // Renamed method
        cell.checkInteractions();
        cell.checkFood();
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
        this.mutationRate = 0.01;
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
        } else if (this.type === 'multi') {
            fill(0, 0, 255, map(this.lifespan - this.age, 0, this.lifespan, 50, 255));
        } else {
            fill(255, 0, 0, map(this.lifespan - this.age, 0, this.lifespan, 50, 255));
        }
        ellipse(this.position.x, this.position.y, this.size);
    }

    reproduce() {
        if (random(1) < this.reproductionRate) {
            let newSize = this.size * 0.5;
            if (newSize > 5) {
                let offset = p5.Vector.random2D().mult(this.size);
                let newType = this.type;
                if (random(1) < this.mutationRate) {
                    newType = 'mutant';
                }
                cells.push(new Cell(this.position.x + offset.x, this.position.y + offset.y, newSize, newType));
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
                    this.size = sqrt(sq(this.size) + sq(other.size));
                    other.size = 0;
                } else {
                    this.size *= 0.5;
                    other.size *= 0.5;
                }
            }
        }
        cells = cells.filter(cell => cell.size > 0);
    }

    checkFood() {
        for (let i = foodSources.length - 1; i >= 0; i--) {
            let food = foodSources[i];
            if (p5.Vector.dist(this.position, food.position) < this.size / 2) {
                this.size += food.nutrition;
                foodSources.splice(i, 1);
                foodSources.push(new Food(random(width), random(height)));
            }
        }
    }
}

class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.nutrition = random(1, 5);
    }

    display() {
        fill(255, 204, 0);
        noStroke();
        ellipse(this.position.x, this.position.y, this.nutrition * 2);
    }
}
