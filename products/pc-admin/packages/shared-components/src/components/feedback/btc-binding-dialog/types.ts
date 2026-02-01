export interface SaveBindingApi {
  (params: {
    id?: number | string;
    phone?: string;
    email?: string;
    smsCode?: string;
    smsType?: string;
    emailCode?: string;
    scene?: string;
  }): Promise<void>;
}

