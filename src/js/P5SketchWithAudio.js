import React, { useRef, useEffect } from "react";
import * as p5 from "p5";
import Tone from 'tone'
import { Midi } from '@tonejs/midi'
import Line from "./Line.js";

import audio from "../audio/lines-no-1.ogg";
import midi from "../audio/lines-no-1.mid";

const P5SketchWithAudio = () => {
    Tone.Transport.PPQ = 3840 * 4;
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.lines = [];

        p.lineArrays = [];

        p.minLines = 8;
        
        p.maxLines = 64;

        p.preload = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[4].notes; // Thor 1 - Percutron
                    const noteSet2 = result.tracks[3].notes; // Synth 2 - Hyperbottom
                    p.player = new Tone.Player(audio, () => { p.audioLoaded = true; }).toMaster();
                    p.player.sync().start(0);
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                }
            );
        }

        p.scheduleCueSet = (noteSet, callbackName)  => {
            let lastTicks = -1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks){
                    Tone.Transport.schedule(
                        () => {
                            p.[callbackName](note);
                        }, 
                        time
                    );
                    lastTicks = ticks;
                }
            }
        } 

        p.setup = () => {
            p.randomColor = require('randomcolor');
            p.bgColour = 0; 
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.darkBGs = p.randomColor({luminosity: 'dark', count: 12});
            p.lightBGs = p.randomColor({luminosity: 'light', count: 12});
            p.preloadLineArrays();
        };

        p.draw = () => {
            p.background(p.bgColour);
            p.lines.forEach(line => line.draw());
            if(p.audioLoaded && p.player.state === 'started'){
                p.lines.forEach(line => line.update());
            }
        };

        p.preloadLineArrays = () => {
            
            for (let i = 0; i < 185; i++) {
                let darkMode = true;
                if((i > 62 && i <= 93) || (i > 124 && i <= 155) ) {
                    darkMode = false;
                }
                const limit = p.random(p.minLines, p.maxLines),
                    luminosity = darkMode ? 'bright' : 'dark',
                    format  = darkMode ? 'rgba' : 'rgb',
                    colours = p.randomColor({luminosity: luminosity, count: limit, format: format});
                if(i > 30) {
                    for (let j = 0; j < limit; j++) {
                        p.lines.push(new Line(p, colours[j], i / 10));
                    }
                }
                else {
                    for (let j = 0; j < limit; j++) {
                        p.lines.push(new Line(p));
                    }
                }
                p.lineArrays.push(p.lines);
                p.lines = [];
            }
            
        };

        p.darkMode = true;

        p.currentCue1 = 1;

        p.executeCueSet1 = (note) => {
            p.lines = p.lineArrays[p.currentCue1 - 1];
            p.currentCue1++;
        };

        p.currentCue2 = 1;

        p.executeCueSet2 = (note) => {
            if((note.ticks / Tone.Transport.PPQ) % 8 === 4) {
                p.darkMode = !p.darkMode;
            }
            if((note.ticks / Tone.Transport.PPQ) % 4 === 0){
                p.bgColour = p.darkMode ? p.random(p.darkBGs) : p.random(p.lightBGs);
            }
            p.currentCue2++;
        };

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.player.state === "started") {
                    Tone.Transport.pause(); // Use the Tone.Transport to pause audio
                } 
                else if (p.player.state === "stopped") {
                    Tone.Transport.start(); // Use the Tone.Transport to start again
                }
            }
        };

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

export default P5SketchWithAudio;
