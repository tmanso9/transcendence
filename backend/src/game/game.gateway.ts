import {Server} from 'socket.io';
import {SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {GameService} from "./game.service";
import {clearInterval} from "timers";

@WebSocketGateway({cors: {origin: 'http://localhost:3001'}})
export class gameGateway implements OnGatewayDisconnect, OnGatewayConnection{
    @WebSocketServer()
    server: Server;

    private intervalId = null;

    constructor(private readonly gameService: GameService) {}

    @SubscribeMessage('message')
    test(client: any, payload: any) {
        console.log(client.id)
    }


    @SubscribeMessage('play')
    startGame(client: any, payload: any) {
        if (this.intervalId == null) {
            this.intervalId = setInterval(() => {
                this.server.to('room1').emit('positions', this.gameService.getPositions() as any);
                this.gameService.moveBall();
            }, 1000 / 60);
        }
    }

    @SubscribeMessage('pause')
    pauseGame(client: any, payload: any) {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    @SubscribeMessage('reset')
    resetGame(client: any, payload: any) {
        this.gameService.reset();
        this.server.to('room1').emit('positions', this.gameService.getPositions() as any);
    }

    @SubscribeMessage('movePaddle')
    movePaddle(client: any, payload: string) {
        this.gameService.movePaddle(client.id, payload);
        this.server.to('room1').emit('positions', this.gameService.getPositions() as any);
    }

    handleDisconnect(client: any): any {
        this.gameService.map.delete(client.id);
        this.pauseGame(null, null);
    }

    handleConnection(client: any, ...args: any[]): any {
        if (this.gameService.map.size >= 2) {
            client.join('room2')
            this.gameService.registerPlayer(client.id);
            return;
        }
        this.gameService.registerPlayer(client.id);
        client.join('room1');
        if (this.gameService.map.size == 2) {
            this.startGame(null, null);
        }
    }
}
