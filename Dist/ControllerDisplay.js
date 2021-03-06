"use strict";
window.AHRS = require("ahrs");
class ControllerDisplay {
    constructor() {
        this.PATH = 'models/';
        this.TILT = Math.PI * 0.2;
        this.gearVRController = null;
        this.material = null;
        this.materialImage = null;
        this.ctx = null;
        this.selectedDeviceAction = null;
        this.ahrs = new AHRS({
            sampleInterval: 68.84681583453657,
            algorithm: 'Madgwick',
            beta: 0.352,
        });
        this.lastZeroQuaternion = null;
        this.driftCompensation = [0, 0, 0];
        this.lastTimestamp = 0;
        this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.01, 10);
        this.camera.position.z = 1;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x303a4a);
        let light;
        light = new THREE.PointLight(0xaaaaaa, 1, 100);
        light.position.set(15, 15, -15);
        this.scene.add(light);
        light = new THREE.PointLight(0xcccccc, 1, 100);
        light.position.set(15, -15, 15);
        this.scene.add(light);
        this.scene.add(this.camera);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.wasAnyButtonDown = false;
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(this.PATH);
        mtlLoader.load('gear_vr_controller.mtl', materials => this.onMTLLoaded(materials));
        if (navigator.bluetooth) {
            document.getElementById('deviceActions').addEventListener('change', e => this.onSelectDeviceAction(e));
            document.getElementById('deviceActionsButton').addEventListener('click', e => this.onClickDeviceActionButton());
        }
        else {
            document.getElementById('webbluetoothNotSupported').classList.add('show');
        }
        this.logElement = document.getElementById('deviceActionsLog');
        console.log("Test13:", window["ControllerBluetoothInterface"]);
        this.controllerBluetoothInterface = window.test1 = new window.ControllerBluetoothInterface(data => this.onControllerDataReceived(data));
    }
    log(msg) {
        this.logElement.innerHTML = msg;
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
    onMTLLoaded(materials) {
        materials.preload();
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(this.PATH);
        objLoader.load('gear_vr_controller.obj', obj => this.onOBJLoaded(obj));
    }
    ;
    onOBJLoaded(object) {
        object.scale.set(15, 15, 15);
        object.position.set(0, 0.1, -0.5);
        object.rotation.set(this.TILT, 0, 0); //.set(-this.TILT, Math.PI, 0);
        this.scene.add(object);
        this.animate();
        this.gearVRController = object;
        this.material = object.children[0].material;
        this.materialImage = new Image();
        this.materialImage.src = (this.material.map.image || {}).src;
        const canvas = document.createElement('canvas');
        canvas.width = this.materialImage.width;
        canvas.height = this.materialImage.height;
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }
    updateTexture(options) {
        let isAnyButtonDown = false;
        const PI2 = Math.PI * 2;
        const PI_4 = Math.PI * 0.25;
        const { backButton, homeButton, touchpadButton, triggerButton, axisX, axisY, volumeUpButton, volumeDownButton, isBluetoothLightOn } = options;
        const { ctx } = this;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.drawImage(this.materialImage, 0, 0);
        if (touchpadButton) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(197, 60, 30, 0, PI2);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (volumeUpButton) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(106, 13, 11, 0, PI2);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (volumeDownButton) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(140, 13, 11, 0, PI2);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (backButton) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(24, 18, 20, 0, PI2);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (homeButton) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(124, 44, 20, 0, PI2);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (triggerButton) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(113, 61);
            ctx.lineTo(138, 61);
            ctx.lineTo(152, 113);
            ctx.lineTo(154, 170);
            ctx.lineTo(154, 230);
            ctx.lineTo(140, 256);
            ctx.lineTo(117, 256);
            ctx.lineTo(125, 220);
            ctx.lineTo(122, 163);
            ctx.lineTo(111, 120);
            ctx.lineTo(122, 163);
            ctx.lineTo(108, 101);
            ctx.fill();
            isAnyButtonDown = true;
        }
        if (axisX && axisY) {
            // Texture is mapped at an angle
            // Need to compensate for that rotation
            ctx.translate(197, 60);
            ctx.rotate(-PI_4);
            const cx = (axisX - 157.5) / 157.5 * 30;
            const cy = (axisY - 157.5) / 157.5 * 30;
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, PI2);
            ctx.fill();
            ctx.rotate(PI_4);
            ctx.translate(-197, -60);
            isAnyButtonDown = true;
        }
        if (isBluetoothLightOn) {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(197, 208, 1, 0, PI2);
            ctx.fill();
        }
        if (isAnyButtonDown || this.wasAnyButtonDown !== isAnyButtonDown) {
            this.material.map.image.src = this.canvas.toDataURL();
            this.material.needsUpdate = true;
        }
        this.wasAnyButtonDown = isAnyButtonDown;
    }
    onSelectDeviceAction(e) {
        const { value } = e.target;
        this.selectedDeviceAction = value;
    }
    onControllerDataReceived(data) {
        let deltaTimeSeconds = 0;
        this.updateTexture(data);
        if (this.lastTimestamp) {
            //deltaTimeSeconds = (data.timestamp - this.lastTimestamp);
            deltaTimeSeconds = (data.timestamp - this.lastTimestamp);
            this.ahrs.update(data.gyro[0], data.gyro[1], data.gyro[2], data.accel[0], data.accel[1], data.accel[2], data.magX, data.magY, data.magZ, deltaTimeSeconds);
            // this.ahrs.update(
            //     data.gyro[3],
            //     data.gyro[4],
            //     data.gyro[5],
            //     data.accel[3],
            //     data.accel[4],
            //     data.accel[5],
            //     data.magX, data.magY, data.magZ,
            //     deltaTimeSeconds
            // );
            //
            // this.ahrs.update(
            //     data.gyro[6],
            //     data.gyro[7],
            //     data.gyro[8],
            //     data.accel[6],
            //     data.accel[7],
            //     data.accel[8],
            //     data.magX, data.magY, data.magZ,
            //     deltaTimeSeconds
            // );
        }
        this.lastTimestamp = data.timestamp;
        const { x, y, z, w } = this.ahrs.getQuaternion();
        this.gearVRController.quaternion.set(x, z, -y, w);
        if (data.homeButton) {
            this.lastZeroQuaternion = this.gearVRController.quaternion.clone().inverse();
            this.log(`Re-zeroed orientation! ${(new Date()).valueOf()}`);
        }
        if (this.lastZeroQuaternion) {
            this.gearVRController.quaternion.premultiply(this.lastZeroQuaternion);
        }
    }
    async onClickDeviceActionButton() {
        const controllerBluetoothInterface = this.controllerBluetoothInterface;
        console.log("Running command...");
        switch (this.selectedDeviceAction) {
            case 'pair':
                controllerBluetoothInterface.pair();
                break;
            case 'disconnect':
                controllerBluetoothInterface.runCommand(CBIUtils.CMD_OFF)
                    .then(() => controllerBluetoothInterface.disconnect());
                break;
            case 'calibrate':
                this.driftCompensation[2] = parseFloat(prompt('Compensation value', this.driftCompensation[2]));
                //controllerBluetoothInterface.runCommand(CBIUtils.CMD_CALIBRATE);
                break;
            case 'sensor':
                // Have to do the SENSOR -> VR -> SENSOR cycle a few times to ensure it runs
                for (let i = 0; i < 3; i++) {
                    if (i != 0)
                        await new Promise(resolve => setTimeout(resolve, 500));
                    await controllerBluetoothInterface.runCommand(CBIUtils.CMD_VR_MODE);
                    await controllerBluetoothInterface.runCommand(CBIUtils.CMD_SENSOR);
                }
                // sequence from: https://github.com/rdady/gear-vr-controller-linux/blob/master/gearVRC.py#L66
                /*await controllerBluetoothInterface.runCommand(CBIUtils.CMD_SENSOR);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_SENSOR);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_SENSOR);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_LPM_ENABLE);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_LPM_DISABLE);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_VR_MODE);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_VR_MODE);
                await controllerBluetoothInterface.runCommand(CBIUtils.CMD_VR_MODE);*/
                break;
            default:
        }
    }
}
const controllerDisplay = new ControllerDisplay();
