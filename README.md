# gearvr-controller-webbluetooth

- [Gear VR controller web bluetooth demo](https://jsyang.ca/gearvr-controller-webbluetooth/index.html)
- [Reverse engineering process](http://jsyang.ca/hacks/gear-vr-rev-eng/)

This demo only works in [browsers supporting Web Bluetooth](https://caniuse.com/#feat=web-bluetooth). As of Feb 2018, this just means Chrome. 

If you're not using one watch the demo [on YouTube](https://www.youtube.com/watch?v=QGb5cKL8kZ4).

## Troubleshooting

You may have issues pairing with the GearVR controller, with the error message "GATT Error Unknown".

To fix:
1) Disable your pc's Bluetooth. (using action center or Settings app)
2) Enable your pc's Bluetooth.
3) Remove the "Gear VR Controller" entry from the Bluetooth paired-devices list.
4) Reload the demo webpage.
5) Start the process like normal. (run "Pair with Gear VR controller", wait a bit, then run "Start controller data updates")

## Legal
Gear VR controller model from [Gear VR Framework](https://github.com/Samsung/GearVRf).