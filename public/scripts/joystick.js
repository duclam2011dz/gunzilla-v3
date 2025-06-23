export class JoystickController {
    constructor(onMoveCallback) {
        this.onMoveCallback = onMoveCallback;
        this.joystick = null;
        this.init();
    }

    init() {
        const zone = document.getElementById("joystickZone");

        this.manager = nipplejs.create({
            zone: zone,
            mode: "static",
            position: { left: "50%", top: "50%" },
            color: "white"
        });

        this.manager.on("move", (evt, data) => {
            if (data && data.direction) {
                const angle = data.angle.degree;
                const rad = angle * Math.PI / 180;
                const dirX = Math.cos(rad).toFixed(2);
                const dirY = (-Math.sin(rad)).toFixed(2);
                this.onMoveCallback(parseFloat(dirX), parseFloat(dirY));
            }
        });

        this.manager.on("end", () => {
            this.onMoveCallback(0, 0);
        });
    }
}