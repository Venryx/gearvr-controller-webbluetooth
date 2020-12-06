/// <reference types="web-bluetooth" />
declare class ControllerData {
    accel: number[];
    gyro: number[];
    magX: number;
    magY: number;
    magZ: number;
    timestamp: number;
    temperature: number;
    axisX: number;
    axisY: number;
    triggerButton: boolean;
    homeButton: boolean;
    backButton: boolean;
    touchpadButton: boolean;
    volumeUpButton: boolean;
    volumeDownButton: boolean;
}
declare class ControllerBluetoothInterface {
    constructor(onControllerDataReceived: (data: ControllerData) => any, onDeviceDisconnected?: (ev: Event) => any);
    gattServer: BluetoothRemoteGATTServer;
    customService: BluetoothRemoteGATTService;
    customServiceNotify: BluetoothRemoteGATTCharacteristic;
    customServiceWrite: BluetoothRemoteGATTCharacteristic;
    onDeviceDisconnected?: (ev: Event) => any;
    onControllerDataReceived?: (data: ControllerData) => any;
    onDeviceConnected(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer> | undefined;
    pair(): Promise<void>;
    disconnect(): void;
    onNotificationReceived(e: any): void;
    runCommand(commandValue: any): Promise<void>;
}
declare class CBIUtils {
    static onBluetoothError: (e: any) => void;
    static UUID_CUSTOM_SERVICE: string;
    static UUID_CUSTOM_SERVICE_WRITE: string;
    static UUID_CUSTOM_SERVICE_NOTIFY: string;
    static CMD_OFF: string;
    static CMD_SENSOR: string;
    static CMD_UNKNOWN_FIRMWARE_UPDATE_FUNC: string;
    static CMD_CALIBRATE: string;
    static CMD_KEEP_ALIVE: string;
    static CMD_UNKNOWN_SETTING: string;
    static CMD_LPM_ENABLE: string;
    static CMD_LPM_DISABLE: string;
    static CMD_VR_MODE: string;
    static GYRO_FACTOR: number;
    static ACCEL_FACTOR: number;
    static TIMESTAMP_FACTOR: number;
    static getAccelerometerFloatWithOffsetFromArrayBufferAtIndex: (arrayBuffer: any, offset: any, index: any) => number;
    static getGyroscopeFloatWithOffsetFromArrayBufferAtIndex: (arrayBuffer: any, offset: any, index: any) => number;
    static getMagnetometerFloatWithOffsetFromArrayBufferAtIndex: (arrayBuffer: any, offset: any) => number;
    static getLength: (f1: any, f2: any, f3: any) => number;
    static getLittleEndianUint8Array: (hexString: any) => Uint8Array;
}
