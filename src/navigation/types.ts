import { NegotiationMode } from '../types/session';

export type RootStackParamList = {
  Home: undefined;
  LiveSession: {
    mode: NegotiationMode;
  };
  Insights: {
    sessionId: string;
  };
  Settings: undefined;
};
