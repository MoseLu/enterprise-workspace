export interface EpsState {
  service: Record<string, any>;
  epsList: any[];
}

export const epsState: EpsState = {
  service: {},
  epsList: [],
};
