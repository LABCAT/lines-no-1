import React, { useRef, useEffect } from "react";
import * as p5 from "p5";



const P5Sketch = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.lines = [];

        p.initialLines = 100;
        p.maxLines = 1000;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);

            for (let i = 0; i < p.initialLines && i < p.maxLines; i++) {
                p.lines.push(p.createLine());
            }

            console.log(p.lines);
        };

        p.draw = () => {
            p.background(0);

            // Step all the lines first
            // Use a fixed delta-time
            const dt = 1 / 24;
            p.lines.forEach(line => p.stepLine(line, dt));

            // Now draw all the lines
            const dim = Math.min(p.width, p.height);
            p.noFill();
            p.stroke(255, 0, 0);

            p.push();
            p.translate(p.width / 2, p.height / 2);
            p.scale(dim, dim);
            p.strokeWeight(0.01);
            p.lines.forEach(({ origin, position }) => {
                const [x0, y0] = origin;
                const [x1, y1] = position;
                p.line(x0, y0, x1, y1);
            });
            p.pop();
        };

        p.createLine = (origin, direction) => {
            // Default to randomly within -1..1 space
            origin = origin || [p.random(-1, 1), p.random(-1, 1)];

            // Default to a random direction
            direction = direction || p.randomUnitVector();

            // We will use normalized coordinates
            // And then scale them to the screen size
            const line = {
                origin: origin.slice(), // starting position
                position: origin.slice(), // initially start at origin
                direction: direction.slice(),
                speed: p.random(0.1, 0.25),
                hits: [],
                moving: true
            };
            return line;
        }

        p.stepLine = (line, deltaTime) => {
            // Ignore stopped lines
            if (!line.moving) return;

            // Line start position
            const x0 = line.origin[0];
            const y0 = line.origin[1];

            // New line end position
            let x1 = line.position[0] + line.direction[0] * line.speed * deltaTime;
            let y1 = line.position[1] + line.direction[1] * line.speed * deltaTime;

            // If we hit another...
            let hitLine;

            // Check intersections against others
            for (let i = 0; i < p.lines.length; i++) {
                const other = p.lines[i];

                // ignore self
                if (other === line) continue;

                // if the lines have collided already, skip
                if (line.hits.includes(other) || other.hits.includes(line)) {
                    continue;
                }

                const hit = p.intersectLineSegments(
                    // this line A->B
                    [x0, y0],
                    [x1, y1],
                    // other line A->B
                    [other.origin[0], other.origin[1]],
                    [other.position[0], other.position[1]]
                );

                // We hit another line, make sure we didn't go further than it
                if (hit) {
                    // Clamp position to the intersection point so it doesn't go beyond
                    x1 = hit[0];
                    y1 = hit[1];

                    hitLine = other;
                    break;
                }

                // Line has reached outside of frame, stop it
                const outsideBounds = x1 > 1 || x1 < -1 || y1 > 1 || y1 < -1;
                if (outsideBounds) {
                    line.moving = false;
                    break;
                }
            }

            line.position[0] = x1;
            line.position[1] = y1;

            if (hitLine) {
                // Mark this line as stopped
                line.moving = false;

                // Mark the lines as hit so they don't check again
                line.hits.push(hitLine);
                hitLine.hits.push(line);

                if (p.lines.length < p.maxLines) {
                    // Produce a new line at perpendicular
                    const producedLine = p.produceLine(line);

                    // Make sure the line knows we already hit these two
                    producedLine.hits = [line, hitLine];

                    // Also make sure the hit line knows not to check it
                    hitLine.hits.push(producedLine);

                    // Add to list
                    p.lines.push(producedLine);
                }
            }
        }

        p.produceLine = (line) => {
            // Select a random point along the line and create a new
            // line extending in a perpendicular angle
            const t = p.random(0.15, 0.85);
            const px = p.lerp(line.origin[0], line.position[0], t);
            const py = p.lerp(line.origin[1], line.position[1], t);

            // Get a perpendicular to the line
            const direction = [-line.direction[1], line.direction[0]];

            // Randomly negate it
            const sign = p.random(0, 1) > 0.5 ? 1 : -1;
            direction[0] *= sign;
            direction[1] *= sign;

            return p.createLine([px, py], direction);
        }

        p.randomUnitVector = () => {
            const radius = 1; // unit circle
            const theta = p.random(0, 1) * 2.0 * Math.PI;
            const out = [];
            out[0] = radius * Math.cos(theta);
            out[1] = radius * Math.sin(theta);
            return out;
        }

        p.intersectLineSegments = (p1, p2, p3, p4) => {
            const t = p.intersectLineSegmentsFract(p1, p2, p3, p4);
            if (t >= 0 && t <= 1) {
                return [
                    p1[0] + t * (p2[0] - p1[0]),
                    p1[1] + t * (p2[1] - p1[1])
                ];
            }
            return false;
        }

        p.intersectLineSegmentsFract = (p1, p2, p3, p4) => {
            // https://github.com/evil-mad/EggBot/blob/master/inkscape_driver/eggbot_hatch.py
            const d21x = p2[0] - p1[0];
            const d21y = p2[1] - p1[1];
            const d43x = p4[0] - p3[0];
            const d43y = p4[1] - p3[1];

            // denominator
            const d = d21x * d43y - d21y * d43x;
            if (d === 0) return -1;

            const nb = (p1[1] - p3[1]) * d21x - (p1[0] - p3[0]) * d21y;
            const sb = nb / d;
            if (sb < 0 || sb > 1) return -1;

            const na = (p1[1] - p3[1]) * d43x - (p1[0] - p3[0]) * d43y;
            const sa = na / d;
            if (sa < 0 || sa > 1) return -1;
            return sa;
        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.redraw();
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
        </div>
    );
};

export default P5Sketch;
