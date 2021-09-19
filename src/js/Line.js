export default class Line {

    constructor(p5, colour, weight = 0) {
        this.p = p5;
        this.origin = {
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height)
        };
        this.destination = {
            x: this.origin.x,
            y: this.origin.y
        };
        this.direction = this.randomUnitVector();
        this.length = this.p.random(this.p.width / 16, this.p.width / 2);
        this.colour = colour ? colour : parseInt(this.p.random(255));
        if(Number.isInteger(this.colour)){
            this.colour = this.p.color(this.colour);
            this.colour.setAlpha(this.p.random(255));
        }
        this.weight = 5 + weight;
    }

    randomUnitVector() {
        const radius = 1; // unit circle
        const theta = this.p.random(0, 1) * 2.0 * Math.PI;
        const out = [];
        out[0] = radius * Math.cos(theta);
        out[1] = radius * Math.sin(theta);
        return out;
    }

    draw() {
        this.p.strokeWeight(this.weight);
        this.p.stroke(this.colour);
        this.p.line(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
    }

    update() {
        const distance = this.p.dist(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
        if(distance < this.length){
            this.destination.x = this.destination.x + this.direction[0] * 10;
            this.destination.y = this.destination.y + this.direction[1] * 10;
        }
    }
}