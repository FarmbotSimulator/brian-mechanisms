/* Copyright 2020 Brian Onang'o
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;
export default class joystick {
    constructor() {
        console.log("starting joy...")
        this.controllers = {}

    }
    async connect() {
        return new Promise((resolve, reject) => {
            // function connecthandler(e) {
            //     addgamepad(e.gamepad);
            // }
            // function 
            // function removegamepad(gamepad) {
            //     delete this.controllers[gamepad.index];
            // }

            // function updateStatus() {
            //     this.scangamepads();
            //     for (j in this.controllers) {
            //         var controller = this.controllers[j];
            //         for (var i = 0; i < controller.buttons.length; i++) {
            //             var val = controller.buttons[i];
            //             var pressed = val == 1.0;
            //             var touched = false;
            //             if (typeof (val) == "object") {
            //                 pressed = val.pressed;
            //                 if ('touched' in val) {
            //                     touched = val.touched;
            //                 }
            //                 val = val.value;
            //             }
            //             var pct = Math.round(val * 100) + "%";

            //             if (pressed) {
            //                 console.log(`pressed ${i}`)
            //             }
            //             if (touched) {
            //                 console.log(`touched ${i}`)
            //             }
            //         }

            //         for (var i = 0; i < controller.axes.length; i++) {
            //             // console.log(`Axis ${i} `)
            //             // var a = axes[i];
            //             // a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
            //             // a.setAttribute("value", controller.axes[i]);
            //         }
            //     }
            // }

            // function scangamepads() {
            //     var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
            //     for (var i = 0; i < gamepads.length; i++) {
            //         if (gamepads[i] && (gamepads[i].index in controllers)) {
            //             this.controllers[gamepads[i].index] = gamepads[i];
            //         }
            //     }
            // }
            let self = this
            if (haveEvents) {
               
                window.addEventListener("gamepadconnected",  (e)=>{self.connecthandler(e)});
                // window.addEventListener("gamepaddisconnected", disconnecthandler);
                console.log("ASBDNSAD")
            } else if (haveWebkitEvents) {
                window.addEventListener("webkitgamepadconnected",   (e)=>{self.connecthandler(e)});
                // window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
                console.log("22222")
            } else {
                setInterval(this.scangamepads, 500);
                console.log("333333")
            }
            // function connecthandler(e) {
            //     addgamepad(e.gamepad);
            //     console.log("connected joysick")
            //   }
            console.log("inside connectf...")

            // window.addEventListener("gamepadconnected", this.connecthandler);
            resolve()
        })
    }
    connecthandler(e) {
        console.log("connected joysick")
        this.addgamepad(e.gamepad);
       
    }
    addgamepad(gamepad) {
        this.controllers[gamepad.index] = gamepad;
        for (var i = 0; i < gamepad.buttons.length; i++) {
        }
        for (i = 0; i < gamepad.axes.length; i++) {

        }
        rAF(this.updateStatus())
    }
    removegamepad(gamepad) {
        delete this.controllers[gamepad.index];
    }

    updateStatus() {
        this.scangamepads();
        for (let j in this.controllers) {
            var controller = this.controllers[j];
            for (var i = 0; i < controller.buttons.length; i++) {
                var val = controller.buttons[i];
                var pressed = val == 1.0;
                var touched = false;
                if (typeof (val) == "object") {
                    pressed = val.pressed;
                    if ('touched' in val) {
                        touched = val.touched;
                    }
                    val = val.value;
                }
                var pct = Math.round(val * 100) + "%";

                if (pressed) {
                    console.log(`pressed ${i}`)
                }
                if (touched) {
                    console.log(`touched ${i}`)
                }
            }

            for (var i = 0; i < controller.axes.length; i++) {
                // 
            }
        }
        rAF(this.updateStatus())
    }
    scangamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && (gamepads[i].index in this.controllers)) {
                this.controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }
    destroy() {
        // window.removeEventListener("gamepadconnected")
    }
}