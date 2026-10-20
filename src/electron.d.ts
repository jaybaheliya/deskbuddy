export {};

export interface DeskBuddyAction {
  type: string;
  payload?: any;
}

export interface ScreenWorkArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface VisitOptions {
  route?: 'bottom' | 'right' | 'left' | 'top';
  staySeconds?: number;
  habitState?: string;
  character?: string;
  reminder?: any;
  message?: string;
}

declare global {
  interface Window {
    deskBuddy?: {
      close: () => void;
      minimize: () => void;
      showPanel: () => void;
      hidePanel: () => void;
      togglePanel: () => void;
      toggleMascot: () => void;
      setWalking: (enabled: boolean) => void;
      setAlwaysOnTop: (alwaysOnTop: boolean) => void;
      startVisit: (options?: VisitOptions) => void;
      exitVisit: () => void;
      setRoute: (route: string) => void;
      setStayDuration: (seconds: number) => void;
      triggerNotification: (title: string, body: string) => void;
      sendAction: (action: DeskBuddyAction) => void;
      onAction: (callback: (action: DeskBuddyAction) => void) => () => void;
      getScreenWorkArea: () => Promise<ScreenWorkArea>;
      getWindowPosition: () => Promise<{ x: number; y: number }>;
      setWindowPosition: (x: number, y: number) => void;
    };
  }
}
