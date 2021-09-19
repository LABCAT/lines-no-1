export default class Line {

    constructor(p5, divisor, colour, weight = 0) {
        this.p = p5;
        this.divisor = divisor > 1 ? divisor : 1;
        this.origin = {
            x: this.p.random(this.p.width) / this.divisor, 
            y: this.p.random(this.p.height) / this.divisor
        };
        this.destination = {
            x: this.origin.x,
            y: this.origin.y
        };
        this.direction = this.randomUnitVector();
        this.length = this.p.random(this.p.width / 16, this.p.width / 2) / this.divisor;
        this.colour = colour ? colour : parseInt(this.p.random(255));
        if(Number.isInteger(this.colour)){
            this.colour = this.p.color(this.colour);
            this.colour.setAlpha(this.p.random(255));
        }
        this.weight = 5 + weight;
        this.strokeCap = this.p.ROUND; 
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
        this.p.push();
        this.p.translate(this.p.width / 2 - (this.p.width / this.divisor / 2), this.p.height / 2 - (this.p.height / this.divisor / 2));
        this.p.strokeWeight(this.weight);
        this.p.strokeCap(this.strokeCap);
        this.p.stroke(this.colour);
        this.p.line(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
        this.p.pop();
    }

    update() {
        const distance = this.p.dist(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
        if(distance < this.length){
            this.destination.x = this.destination.x + this.direction[0] * 10;
            this.destination.y = this.destination.y + this.direction[1] * 10;
        }
    }
}