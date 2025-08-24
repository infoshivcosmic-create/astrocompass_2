interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

declare global {
  interface Window {
    ondeviceorientationabsolute: ((this: Window, ev: DeviceOrientationEvent) => any) | null;
  }

  interface WindowEventMap {
    "deviceorientationabsolute": DeviceOrientationEvent;
  }
}
