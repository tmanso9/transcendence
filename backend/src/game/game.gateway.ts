import {Server, Socket} from 'socket.io';
import {SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {GameService} from "./game.service";


@WebSocketGateway({cors: {origin: 'http://localhost:3001'}})
export class gameGateway implements OnGatewayDisconnect, OnGatewayConnection{
    @WebSocketServer()
    server: Server;
    activeConnections = new Set();

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
        this.games.get(this.rooms.get(client.id))?.pauseG()
    }

    @SubscribeMessage('reset')
    resetGame(client: any, payload: any) {
        this.games.get(this.rooms.get(client.id))?.reset();
        this.server.to(this.rooms.get(client.id)).emit('gameState', this.games.get(this.rooms.get(client.id))?.getGameState() as any);
    }

    @SubscribeMessage('movePaddle')
    movePaddle(client: any, payload: string) {
        if (this.games.size > 0) {
            const room = this.rooms.get(client.id);
            const game = this.games.get(room);
            if (game.map.has(client.id))
                game.movePaddle(client.id, payload);
            this.server.to(room).emit('gameState', game.getGameState() as any);
        }
    }

    @SubscribeMessage('createRoom')
    createRoom(client: any, payload: string) {
        client.join(payload);
        this.games.set(payload, new GameService());
        this.games.get(payload).registerPlayer(client.id);
        this.rooms.set(client.id, payload);
        this.server.emit('availableRooms',Array.from(this.games.keys()) as any);
    }

    @SubscribeMessage('joinRoom')
    joinRoom(client: Socket, payload: string) {
        if (this.games.has(payload)) {
            client.join(payload);
            if (!this.games.get(payload).registerPlayer(client.id)) {
                client.emit('spectator', true);
            }
            this.rooms.set(client.id, payload);
            if (this.games.get(payload).map.size == 2 && this.games.get(payload).spectators.length == 0)
                this.games.get(payload).playG(this.server, payload)
            this.server.to(payload).emit('gameState', this.games.get(payload).getGameState() as any);
        }
    }

    handleDisconnect(client: any): any {
        const room = this.rooms.get(client.id);
        if (room) {
            const game = this.games.get(room);
            if (game.map.has(client.id)) {
                this.pauseGame(client, null);
                if (game.spectators.length > 0) {
                    this.server.sockets.sockets.get(game.spectators[0]).emit('spectator', false as any);
                    game.promoteToPlayer(client.id, game.spectators[0]);
                }
                game.map.delete(client.id);
            } else {
                game.spectators.splice(game.spectators.indexOf(client.id), 1);
            }
            this.rooms.delete(client.id);
            if (game.map.size == 0) {
                this.games.delete(room);
            }
        }
        this.server.emit('availableRooms',Array.from(this.games.keys()) as any);
    }

    handleConnection(client: any, ...args: any[]): any {
        this.server.emit('availableRooms',Array.from(this.games.keys()) as any);

    }
}
