import {Server} from 'socket.io';
import {SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
@WebSocketGateway({cors: {origin: 'http://localhost:3001'}})
export class appGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): string {
        console.log(payload)
        return 'Hello world!';
    }
}

