import {Server} from 'socket.io';
import {SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {GameService} from "./game.service";
// import type {Socket} from "socket.io-client";
import {clearInterval} from "timers";
import {Socket} from "net";

@WebSocketGateway({cors: {origin: 'http://localhost:3001'}})
export class gameGateway implements OnGatewayDisconnect, OnGatewayConnection{
    @WebSocketServer()
    server: Server;

    private intervalId = null;
    private games = new Map<string, GameService>();
    private rooms = new Map<string, string>();
    constructor(private readonly gameService: GameService) {}

    @SubscribeMessage('message')
    test(client: any, payload: any) {
        console.log(client.id)
    }


    @SubscribeMessage('play')
    startGame(client: any, payload: any) {
        const room = this.rooms.get(client.id);
        this.games.get(room).playG(this.server, room);
    }

    @SubscribeMessage('pause')
    pauseGame(client: any, payload: any) {
        this.games.get(this.rooms.get(client.id)).pauseG()
    }

    @SubscribeMessage('reset')
    resetGame(client: any, payload: any) {
        this.games.get(this.rooms.get(client.id)).reset();
        this.server.to(this.rooms.get(client.id)).emit('positions', this.games.get(this.rooms.get(client.id)).getPositions() as any);
    }

    @SubscribeMessage('movePaddle')
    movePaddle(client: any, payload: string) {
        if (this.games.size > 0) {
            const room = this.rooms.get(client.id);
            const game = this.games.get(room);
            game.movePaddle(client.id, payload);
            this.server.to(room).emit('positions', game.getPositions() as any);
        }
    }

    handleDisconnect(client: any): any {
        const room = this.rooms.get(client.id);
        const game = this.games.get(room);
        this.pauseGame(client, null);
        game.map.delete(client.id);
    }

    handleConnection(client: any, ...args: any[]): any {
        if (this.games.size == 0) {
            client.join('room1');
            this.games.set('room1', new GameService());
            this.games.get('room1').registerPlayer(client.id);
            this.rooms.set(client.id, 'room1');
        } else {
            const lastGame = Array.from(this.games.values())[this.games.size - 1];
            if (lastGame.map.size < 2) {
                client.join('room' + this.games.size);
                this.rooms.set(client.id, 'room' + this.games.size);
                lastGame.registerPlayer(client.id);
                if (lastGame.map.size == 2)
                    lastGame.playG(this.server, 'room' + this.games.size)
            } else {
                client.join('room' + (this.games.size + 1));
                this.rooms.set(client.id, 'room' + (this.games.size + 1));
                this.games.set('room' + (this.games.size + 1), new GameService());
                this.games.get('room' + (this.games.size)).registerPlayer(client.id);
            }
        }
    }
}