import { Server } from 'socket.io';
export declare class appGateway {
    server: Server;
    handleMessage(client: any, payload: any): string;
}
