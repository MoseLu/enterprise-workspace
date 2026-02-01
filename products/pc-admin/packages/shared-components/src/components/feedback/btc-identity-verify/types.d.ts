export interface VerifyPhoneApi {
    (params: {
        type: 'phone';
    }): Promise<string | {
        data: string;
        phone?: string;
    }>;
}
export interface VerifyEmailApi {
    (params: {
        type: 'email';
    }): Promise<string | {
        data: string;
        email?: string;
    }>;
}
