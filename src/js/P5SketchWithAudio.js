import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import Line from "./Line.js";

import audio from "../audio/lines-no-1.ogg";
import midi from "../audio/lines-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;
        
        p.PPQ = 3840 * 4;

        p.lines = [];

        p.lineArrays = [];

        p.minLines = 8;
        
        p.maxLines = 64;

        p.preload = () => {
            p.song = p.loadSound(audio);
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[4].notes; // Thor 1 - Percutron
                    const noteSet2 = result.tracks[3].notes; // Synth 2 - Hyperbottom
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
                    note.currentCue = i + 1;
                    p.song.addCue(time, p.[callbackName], note);
                    lastTicks = ticks;
                }
            }
        } 

        p.setup = () => {
            p.randomColor = require('randomcolor');
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.bgColour = 0;
            p.darkBGs = p.randomColor({luminosity: 'dark', count: 12});
            p.lightBGs = p.randomColor({luminosity: 'light', count: 12});
            p.preloadLineArrays();
        };

        p.draw = () => {
            p.background(p.bgColour);
            if(p.lines.length){
                p.lines.forEach(line => line.draw());
                if(p.song.isPlaying()){
                    p.lines.forEach(line => line.update());
                }
            }
        };

        p.preloadLineArrays = () => {
            let divisor = 12;
            for (let i = 0; i < 185; i++) {
                if(i % 31 === 0){
                    divisor = divisor - 2;
                }
                let darkMode = true;
                if((i > 61 && i <= 92) || (i > 123 && i <= 154) ) {
                    darkMode = false;
                }
                const limit = p.random(p.minLines, p.maxLines),
                    luminosity = darkMode ? 'bright' : 'dark',
                    format  = darkMode ? 'rgba' : 'rgb',
                    colours = p.randomColor({luminosity: luminosity, count: limit, format: format});
                if(i > 30) {
                    for (let j = 0; j < limit; j++) {
                        p.lines.push(new Line(p, divisor, colours[j], i / 10));
                    }
                }
                else {
                    for (let j = 0; j < limit; j++) {
                        p.lines.push(new Line(p, divisor));
                    }
                }
                p.lineArrays.push(p.lines);
                p.lines = [];
                
            }
        };

        p.darkMode = true;

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            p.lines = p.lineArrays[currentCue - 1];
        };


        p.executeCueSet2 = (note) => {
            const { ticks } = note;
            if((ticks / p.PPQ) % 8 === 4) {
                p.darkMode = !p.darkMode;
            }
            if((ticks / p.PPQ) % 4 === 0){
                p.bgColour = p.darkMode ? p.random(p.darkBGs) : p.random(p.lightBGs);
            }
        };

        p.mousePressed = () => {
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    p.reset();
                }
                //document.getElementById("play-icon").classList.add("fade-out");
                p.canvas.addClass("fade-in");
                p.song.play();
            }
        };

        p.reset = () => {
            p.bgColour = 0;
            p.darkBGs = p.randomColor({luminosity: 'dark', count: 12});
            p.lightBGs = p.randomColor({luminosity: 'light', count: 12});
            p.lineArrays = [];
            p.preloadLineArrays();
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

export default P5SketchWithAudio;
