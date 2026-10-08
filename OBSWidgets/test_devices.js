const devices = [
  { deviceId: 'default', label: 'Default Mic' },
  { deviceId: '123', label: 'Mic 1' }
];

console.log(devices.map(d => d.deviceId === 'default' ? 'default-sys' : d.deviceId));
