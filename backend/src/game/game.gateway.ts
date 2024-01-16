import {Server, Socket} from 'socket.io';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import {GameService} from "./game.service";
import {JwtService} from "@nestjs/jwt";
import {PrismaService} from "../prisma/prisma.service";
import {paddle} from "./game.service";


export interface Player {
  username: string;
  id: string;
  score: number;
  paddle: paddle;
}
@WebSocketGateway({
    namespace: '/play',
    cors: {origin: 'http://localhost:3001'}})
export class gameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  //map of socketId to username
  private connectedUsers = new Map<string, Player>();
  private games = new Map<string, GameService>();
  private rooms = new Map<string, string>();

  constructor(private readonly gameService: GameService, private jwtService: JwtService, private prismService: PrismaService) {
  }

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
      if (game.gameState.has(client.id))
        game.movePaddle(client.id, payload);
      this.server.to(room).emit('gameState', game.getGameState() as any);
    }
  }

  @SubscribeMessage('createRoom')
  createRoom(client: any, payload: any) {
    client.join(payload.room);
    this.games.set(payload.room, new GameService());
    this.games.get(payload.room).initGame(payload.width, payload.height);
    this.games.get(payload.room).registerPlayer(client.id, this.connectedUsers.get(client.id));
    this.rooms.set(client.id, payload.room);
    this.server.emit('availableRooms', Array.from(this.games.keys()) as any);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, payload: string) {
    if (this.games.has(payload)) {
      client.join(payload);
      if (!this.games.get(payload).registerPlayer(client.id, this.connectedUsers.get(client.id))) {
        client.emit('spectator', true);
      }
      this.rooms.set(client.id, payload);
      if (this.games.get(payload).gameState.size == 2 && this.games.get(payload).spectators.length == 0)
        this.games.get(payload).playG(this.server, payload)
      this.server.to(payload).emit('gameState', this.games.get(payload).getGameState() as any);
    }
  }

  @SubscribeMessage('addPlayer')
  async addPlayer(client: Socket, payload: string) {
    const decoded = await this.jwtService.decode(payload);
    const prismaUser = await this.prismService.user.findUnique({where: {id: decoded.sub}});
    const user = {username: prismaUser.username, id: decoded.sub, score: 0, paddle: null as any};
    this.connectedUsers.set(client.id, user);
    client.emit('availableRooms', Array.from(this.games.keys()) as any);
  }


  handleDisconnect(client: any): any {
    const room = this.rooms.get(client.id);
    if (room) {
      const game = this.games.get(room);
      if (game && game.gameState.has(client.id)) {
        this.pauseGame(client, null);
        //fazer com que o outro jogador ganhe 10-0
        if (game.gameState.size == 2) {
          Array.from(game.gameState.values()).forEach(p => {
            p == game.gameState.get(client.id) ? p.score = 0 : p.score = 3
          });
          //avisar a room que o outro jogador ganhou por desistencia/disconnect
          this.server.to(room).emit('gaveUpOrDisconnected', {quitter: game.gameState.get(client.id).username, winner: Array.from(game.gameState.values()).find(p => p != game.gameState.get(client.id)).username});
          if (!game.finished){
            game.finishG(this.server, room);
          }
          Array.from(game.gameState.values()).forEach(p => {
            p.score = 0;
          });
          console.log(game.getGameState());
          this.server.to(room).emit('gameState', game.getGameState() as any);
        }
        //emitir o kick para os players
        this.server.to(room).emit('kick', null);
        //remover o jogo da lista de jogos
        //fechar o room
      } else if (game && game.spectators.includes(client.id)) {
        game.spectators.splice(game.spectators.indexOf(client.id), 1);
      }
      this.rooms.delete(client.id);
    }
    this.connectedUsers.delete(client.id);
    this.server.emit('availableRooms', Array.from(this.games.keys()) as any);
  }

  handleConnection(client: Socket, ...args: any[]): any {
    this.server.emit('availableRooms', Array.from(this.games.keys()) as any);
  }

}
