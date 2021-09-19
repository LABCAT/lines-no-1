//p5.sound doesn't work correctly when p5 is not available in the global name space so we add it here
import * as p5 from "p5";
window.p5 = p5;
