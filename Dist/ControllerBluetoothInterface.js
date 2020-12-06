"use strict";
console.log("Test11");
/*export*/ class ControllerData {
}
class ControllerBluetoothInterface {
    constructor(onControllerDataReceived, onDeviceDisconnected) {
        this.onDeviceDisconnected = onDeviceDisconnected === null || onDeviceDisconnected === void 0 ? void 0 : onDeviceDisconnected.bind(this);
        this.onControllerDataReceived = onControllerDataReceived.bind(this);
    }
    onDeviceConnected(device) {
        var _a;
        if (this.onDeviceDisconnected) {
            device.addEventListener("gattserverdisconnected", this.onDeviceDisconnected);
        }
        return (_a = device.gatt) === null || _a === void 0 ? void 0 : _a.connect();
    }
    async pair() {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [
                CBIUtils.UUID_CUSTOM_SERVICE
            ],
        });
        this.gattServer = await this.onDeviceConnected(device);
        // todo: get battery and device-info services
        //console.log("Test1:", await this.gattServer.getPrimaryServices(CBIUtils.UUID_CUSTOM_SERVICE));
        // get custom service
        //this.customService = await this.gattServer.getPrimaryService(CBIUtils.UUID_CUSTOM_SERVICE);
        this.customService = (await this.gattServer.getPrimaryServices()).find(a => a.uuid == CBIUtils.UUID_CUSTOM_SERVICE);
        //const services = await this.customService.getCharacteristics();
        this.customServiceWrite = await this.customService.getCharacteristic(CBIUtils.UUID_CUSTOM_SERVICE_WRITE);
        //this.customServiceWrite = services.find(a=>a.uuid == CBIUtils.UUID_CUSTOM_SERVICE_WRITE)!;
        this.customServiceNotify = await this.customService.getCharacteristic(CBIUtils.UUID_CUSTOM_SERVICE_NOTIFY);
        //this.customServiceNotify = services.find(a=>a.uuid == CBIUtils.UUID_CUSTOM_SERVICE_NOTIFY)!;
        // sequence from: https://github.com/rdady/gear-vr-controller-linux/blob/master/gearVRC.py#L66
        /*await this.runCommand(CBIUtils.CMD_SENSOR);
        await this.runCommand(CBIUtils.CMD_SENSOR);
        await this.runCommand(CBIUtils.CMD_SENSOR);
        await this.runCommand(CBIUtils.CMD_LPM_ENABLE);
        await this.runCommand(CBIUtils.CMD_LPM_DISABLE);
        await this.runCommand(CBIUtils.CMD_VR_MODE);
        await this.runCommand(CBIUtils.CMD_VR_MODE);
        await this.runCommand(CBIUtils.CMD_VR_MODE);*/
        //await new Promise(resolve=>setTimeout(resolve, 100));
        //console.log("Test2:", await this.customServiceNotify.getDescriptors());
        console.log("Test3:", this.gattServer.connected);
        //this.gattServer = await device.gatt?.connect()!;
        await this.customServiceNotify.startNotifications();
        console.log("Test4");
        this.customServiceNotify.addEventListener("characteristicvaluechanged", this.onNotificationReceived);
        console.log("Test5");
        /*setInterval(async()=>{
            /*const val = await this.customServiceNotify.readValue();
            console.log("Val:", val);*#/
            //console.log("Test4:", this.gattServer.connected);
        }, 100);*/
    }
    disconnect() {
        this.gattServer && this.gattServer.disconnect();
    }
    onNotificationReceived(e) {
        var _a;
        const { buffer } = e.target.value;
        const eventData = new Uint8Array(buffer);
        // Max observed value = 315
        // (corresponds to touchpad sensitive dimension in mm)
        const axisX = (((eventData[54] & 0xF) << 6) +
            ((eventData[55] & 0xFC) >> 2)) & 0x3FF;
        // Max observed value = 315
        const axisY = (((eventData[55] & 0x3) << 8) +
            ((eventData[56] & 0xFF) >> 0)) & 0x3FF;
        // com.samsung.android.app.vr.input.service/ui/c.class:L222
        //const firstInt32 = new Int32Array(buffer.slice(0, 3))[0];
        const firstInt32 = new Int32Array(buffer.slice(0, 4))[0];
        const timestamp = (firstInt32 & 0xFFFFFFFF) / 1000 * CBIUtils.TIMESTAMP_FACTOR;
        // com.samsung.android.app.vr.input.service/ui/c.class:L222
        const temperature = eventData[57];
        const { getAccelerometerFloatWithOffsetFromArrayBufferAtIndex, getGyroscopeFloatWithOffsetFromArrayBufferAtIndex, getMagnetometerFloatWithOffsetFromArrayBufferAtIndex } = CBIUtils;
        // 3 x accelerometer and gyroscope x,y,z values per data event
        const accel = [
            getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4, 0),
            getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 6, 0),
            getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 8, 0),
        ].map(v => v * CBIUtils.ACCEL_FACTOR);
        const gyro = [
            getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 10, 0),
            getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 12, 0),
            getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 14, 0),
        ].map(v => v * CBIUtils.GYRO_FACTOR);
        const magX = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 0);
        const magY = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 2);
        const magZ = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4);
        const triggerButton = Boolean(eventData[58] & (1 << 0));
        const homeButton = Boolean(eventData[58] & (1 << 1));
        const backButton = Boolean(eventData[58] & (1 << 2));
        const touchpadButton = Boolean(eventData[58] & (1 << 3));
        const volumeUpButton = Boolean(eventData[58] & (1 << 4));
        const volumeDownButton = Boolean(eventData[58] & (1 << 5));
        (_a = this.onControllerDataReceived) === null || _a === void 0 ? void 0 : _a.call(this, {
            accel,
            gyro,
            magX, magY, magZ,
            timestamp,
            temperature,
            axisX, axisY,
            triggerButton,
            homeButton,
            backButton,
            touchpadButton,
            volumeUpButton,
            volumeDownButton
        });
    }
    runCommand(commandValue) {
        const { getLittleEndianUint8Array, onBluetoothError } = CBIUtils;
        return this.customServiceWrite.writeValue(getLittleEndianUint8Array(commandValue)).catch(onBluetoothError);
    }
}
window["ControllerBluetoothInterface"] = ControllerBluetoothInterface;
console.log("Test12:", window["ControllerBluetoothInterface"]);
class CBIUtils {
}
CBIUtils.onBluetoothError = e => {
    console.warn('Error: ' + e);
};
CBIUtils.UUID_CUSTOM_SERVICE = "4f63756c-7573-2054-6872-65656d6f7465";
CBIUtils.UUID_CUSTOM_SERVICE_WRITE = "c8c51726-81bc-483b-a052-f7a14ea3d282";
CBIUtils.UUID_CUSTOM_SERVICE_NOTIFY = "c8c51726-81bc-483b-a052-f7a14ea3d281";
CBIUtils.CMD_OFF = '0000';
CBIUtils.CMD_SENSOR = '0100';
CBIUtils.CMD_UNKNOWN_FIRMWARE_UPDATE_FUNC = '0200';
CBIUtils.CMD_CALIBRATE = '0300';
CBIUtils.CMD_KEEP_ALIVE = '0400';
CBIUtils.CMD_UNKNOWN_SETTING = '0500';
CBIUtils.CMD_LPM_ENABLE = '0600';
CBIUtils.CMD_LPM_DISABLE = '0700';
CBIUtils.CMD_VR_MODE = '0800';
CBIUtils.GYRO_FACTOR = 0.0001; // to radians / s
CBIUtils.ACCEL_FACTOR = 0.00001; // to g (9.81 m/s**2)
CBIUtils.TIMESTAMP_FACTOR = 0.001; // to seconds
CBIUtils.getAccelerometerFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer, offset, index) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(16 * index + offset, 16 * index + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 10000.0 * 9.80665 / 2048.0]))[0];
};
CBIUtils.getGyroscopeFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer, offset, index) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(16 * index + offset, 16 * index + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 10000.0 * 0.017453292 / 14.285]))[0];
};
CBIUtils.getMagnetometerFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer, offset) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(32 + offset, 32 + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 0.06]))[0];
};
CBIUtils.getLength = (f1, f2, f3) => Math.sqrt(f1 ** 2 + f2 ** 2 + f3 ** 2);
CBIUtils.getLittleEndianUint8Array = hexString => {
    const leAB = new Uint8Array(hexString.length >> 1);
    for (let i = 0, j = 0; i + 2 <= hexString.length; i += 2, j++) {
        leAB[j] = parseInt(hexString.substr(i, 2), 16);
    }
    return leAB;
};
