interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface Window {
  ondeviceorientationabsolute: ((this: Window, ev: DeviceOrientationEvent) => any) | null;
}

interface WindowEventMap {
  "deviceorientationabsolute": DeviceOrientationEvent;
}
