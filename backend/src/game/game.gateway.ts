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
import {addWaitHandler} from "pactum/src/exports/handler";


export interface Player {
  username: string;
  id: string;
  score: number;
  paddle: paddle;
}
@WebSocketGateway({
    namespace: '/play',
    cors: {origin: `${process.env.HOST}:${process.env.FE_PORT}`}})
export class gameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  //map of socketId to username
  private connectedUsers = new Map<string, Player>();
  private games = new Map<string, GameService>();
  private rooms = new Map<string, string>();
  private roomNumber = 0;

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
      if (game.gameState.has(client.id)) {
        game.gameState.get(client.id).paddle.moving = payload;
      }
      this.server.to(room).emit('gameState', game.getGameState() as any);
    }
  }

  @SubscribeMessage('stopPaddle')
  stopPaddle(client: any, payload: string) {
    if (this.games.size > 0) {
      const room = this.rooms.get(client.id);
      const game = this.games.get(room);
      if (game.gameState.has(client.id))
        game.gameState.get(client.id).paddle.moving = 'false';
      this.server.to(room).emit('gameState', game.getGameState() as any);
    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(client: any, payload: any) {
    client.join(payload.room);
    this.games.set(payload.room, new GameService());
    this.games.get(payload.room).initGame(payload.width, payload.height);
    this.games.get(payload.room).registerPlayer(client.id, this.connectedUsers.get(client.id));
    this.rooms.set(client.id, payload.room);
    this.server.to(payload.room).emit('playerList', Array.from(this.games.get(payload.room).gameState.values()).map(p => p.username) as any);
    await this.prismService.user.update({where: {id: this.connectedUsers.get(client.id).id}, data: {status: "IN_GAME", gameId: payload.room}});
    this.roomNumber++;
    this.server.emit('availableRooms', Array.from(this.games.keys()).map(k => k).filter(k => k.includes("room")) as any);
    this.server.emit("roomNumber", this.roomNumber as any);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: string) {
    if (this.games.has(payload)) {
      client.join(payload);
      if (!this.games.get(payload).registerPlayer(client.id, this.connectedUsers.get(client.id))) {
        client.emit('spectator', true);
      } else {
        await this.prismService.user.update({
          where: {id: this.connectedUsers.get(client.id).id},
          data: {status: "IN_GAME", gameId: payload}
        });
      }
      this.server.to(payload).emit('playerList', Array.from(this.games.get(payload).gameState.values()).map(p => p.username) as any);
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
    if (prismaUser) {
      const user = {username: prismaUser.username, id: decoded.sub, score: 0, paddle: null as any};
      this.connectedUsers.set(client.id, user);
    }
    client.emit('availableRooms', Array.from(this.games.keys()).map(k => k).filter(k => k.includes("room")) as any);
  }


  async handleDisconnect(client: any) {
    const room = this.rooms.get(client.id);
    if (room) {
      let game = this.games.get(room);
      if (game && game.gameState.has(client.id)) {
        this.pauseGame(client, null);
        //fazer com que o outro jogador ganhe 10-0
        if (game.gameState.size == 2) {
          if (!game.finished) {
            Array.from(game.gameState.values()).forEach(p => {
              p == game.gameState.get(client.id) ? p.score = 0 : p.score = 10
            });
          }
          //avisar a room que o outro jogador ganhou por desistencia/disconnect
          this.server.to(room).emit('gaveUpOrDisconnected', {
            quitter: game.gameState.get(client.id).username,
            winner: Array.from(game.gameState.values()).find(p => p != game.gameState.get(client.id)).username
          });
          if (!game.finished) {
            game.finishG(this.server, room);
          }
          Array.from(game.gameState.values()).forEach(p => {
            p.score = 0;
          });

          this.server.to(room).emit('gameState', game.getGameState() as any);
        }
        //emitir o kick para os players
        setTimeout(() => {
          this.server.to(room).emit('kick', null);
        }, 1500);
        //remover o jogo da lista de jogos
        //fechar o room
        this.games.delete(room);
        game = null as any;
      } else if (game && game.spectators.includes(client.id)) {
        game.spectators.splice(game.spectators.indexOf(client.id), 1);
      }
      this.rooms.delete(client.id);
    }
    const user = await this.prismService.user.findUnique({where: {id: this.connectedUsers.get(client.id).id}});
    if (user && user.status == "IN_GAME") {
      await this.prismService.user.update({
        where: {id: user.id},
        data: {status: "ONLINE", gameId: ""}
      });
    }
    this.connectedUsers.delete(client.id);
    this.server.emit('availableRooms', Array.from(this.games.keys()).map(k => k).filter(k => k.includes("room")) as any);
  }

  handleConnection(client: Socket, ...args: any[]): any {
    this.server.emit("roomNumber", this.roomNumber as any);
    this.server.emit('availableRooms', Array.from(this.games.keys()).map(k => k).filter(k => k.includes("room")) as any);
  }

}
