import {Injectable} from '@nestjs/common';
import {clearInterval} from "timers";
import {GameBackendService} from "../gameBackend/gameBackend.service";
import {PrismaService} from "../prisma/prisma.service";
import {ConfigService} from "@nestjs/config";
import {Player} from "./game.gateway";

class baseObject {
  constructor(public x: number, public y: number, public color: string, public collidable: boolean = true, public orientation: string = 'horizontal') {
  }

  collision(ball) {
    return false;
  }
}

class rectangle extends baseObject {
  constructor(public x: number, public y: number, public width: number, public height: number, public color: string, public orientation: string) {
    super(x, y, color);
  }

  collision(ball) {
    if (ball.x + ball.radius > this.x && ball.x - ball.radius < this.x + this.width) {
      if (ball.y + ball.radius > this.y && ball.y - ball.radius < this.y + this.height) {
        return true;
      }
    }
    return false;
  }
}

export class paddle extends rectangle {
  constructor(public x: number, public y: number, public width: number, public height: number, public color: string, public orientation: string) {
    super(x, y, width, height, color, orientation);
  }

  moveUp(lineWidth: number) {
    if (this.y == lineWidth)
      return;
    else if (this.y - 30 < lineWidth) {
      this.y = lineWidth;
    } else
      this.y -= 30;

  }

  moveDown(lineWidth: number, height: number) {
    if (this.y + this.height == height - lineWidth)
      return;
    else if (this.y + this.height + 30 > height - lineWidth)
      this.y = height - lineWidth - this.height;
    else
      this.y += 30;
  }
}

class Ball extends baseObject {
  constructor(public x: number, public y: number, public radius: number, public dx: number, public dy: number, public color: string, collidable: boolean = false) {
    super(x, y, color, collidable);
    this.dy = this.dy * ((Math.random() - 0.5) < 0 ? 1 : -1);
    this.dx = this.dx * ((Math.random() - 0.5) < 0 ? 1 : -1);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  checkCollision(elements: baseObject[], width: number, height: number, dx: number, dy: number) {
    for (const e of elements) {
      if (e.collidable && e.collision(this)) {
        if (e.orientation == 'horizontal') {
          this.dy = -this.dy;
        } else if (e instanceof paddle) {
          this.dx = -this.dx;
        } else {
          this.x = width / 2;
          this.y = height / 2;
          this.dx = dx * ((Math.random() - 0.5) < 0 ? 1 : -1);
          this.dy = dy * ((Math.random() - 0.5) < 0 ? 1 : -1);
          return e;
        }
      }
    }
  }
}


const scoreToWin = 3;

@Injectable()
export class GameService {

  static gameBackend: GameBackendService = new GameBackendService(new PrismaService(new ConfigService<Record<string, unknown>, false>()));
  private ball;
  private paddle1;
  private paddle2;
  private hTop;
  private hBottom;
  private vLeft;
  private vRight;
  private elements: baseObject[];
  public gameState = new Map<string, Player>();
  private intervalId = null;
  public spectators: string[] = [];
  // public score = new Map<string, Player>();
  private lineWidth;
  private paddleWidth;
  private paddleHeight;
  private paddleStartY;
  private width;
  private height;
  public finished = false;

  constructor() {
  }

  initGame(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.lineWidth = width / 100;
    this.paddleWidth = width / 50;
    this.paddleHeight = height / 5;
    this.paddleStartY = height / 2 - this.paddleHeight / 2;
    this.hTop = new rectangle(0, 0, width, this.lineWidth, '#ffffff', 'horizontal');
    this.hBottom = new rectangle(0, height - this.lineWidth, width, this.lineWidth, '#ffffff', 'horizontal');
    this.vLeft = new rectangle(0, 0, this.lineWidth, height, '#ffffff', 'vertical');
    this.vRight = new rectangle(width - this.lineWidth, 0, this.lineWidth, height, '#ffffff', 'vertical');
    this.paddle1 = new paddle(this.paddleWidth, this.paddleStartY, this.paddleWidth, this.paddleHeight, 'red', 'vertical');
    this.paddle2 = new paddle(width - 2 * this.paddleWidth, this.paddleStartY, this.paddleWidth, this.paddleHeight, 'red', 'vertical');
    this.ball = new Ball(width / 2, height / 2, width / 200 * 3, width / 200, width / 200, 'white');
    this.elements = [this.hTop, this.hBottom, this.vLeft, this.vRight, this.paddle1, this.paddle2, this.ball];
  }

  checkCollision() {
    return (this.ball as Ball).checkCollision(this.elements, this.width, this.height, this.width / 200, this.width / 200);
  }

  registerPlayer(id: string, player: Player) {
    if (this.gameState.size == 0) {
      player.paddle = this.paddle1;
      this.gameState.set(id, player);
    } else if (this.gameState.size == 1) {
      player.paddle = this.paddle2;
      this.gameState.set(id, player);
    } else {
      this.spectators.push(id);
      return false;
    }
    return true;
  }

  // promoteToPlayer(oldPlayer: string, newPlayer: string) {
  //   this.map.set(newPlayer, this.map.get(oldPlayer));
  //   this.spectators.splice(this.spectators.indexOf(newPlayer), 1);
  // }

  movePaddle(id: string, payload: string) {
    if (payload == 'w') {
      this.gameState.get(id).paddle.moveUp(this.lineWidth);
    } else if (payload == 's') {
      this.gameState.get(id).paddle.moveDown(this.lineWidth, this.height);
    }
  }

  getPaddlePosition(id: number) {
    if (id == 1) {
      return {x: this.paddle1.x, y: this.paddle1.y};
    } else if (id == 2) {
      return {x: this.paddle2.x, y: this.paddle2.y};
    }
  }

  moveBall() {
    const collidedObject = this.checkCollision();
    if (collidedObject instanceof rectangle && collidedObject.orientation == 'vertical') {
      if (collidedObject.x == 0) {
        const player = Array.from(this.gameState.values()).find(p => p.paddle == this.paddle2);
        player.score = player.score + 1;
      } else {
        const player = Array.from(this.gameState.values()).find(p => p.paddle == this.paddle1)
        player.score = player.score + 1;
      }
    }
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
  }

  getBallPosition() {
    return {x: this.ball.x, y: this.ball.y};
  }

  getGameState() {
    return {
      ball: this.getBallPosition(),
      paddle1: this.getPaddlePosition(1),
      paddle2: this.getPaddlePosition(2),
      score: {
        paddle1: Array.from(this.gameState.values()).find(p => p.paddle == this.paddle1)?.score || 0,
        paddle2: Array.from(this.gameState.values()).find(p => p.paddle == this.paddle2)?.score || 0
      }
    };
  }

  playG(server, room) {
    if (this.intervalId == null) {
      this.intervalId = setInterval(() => {
        if (Array.from(this.gameState.values()).find(p => p.score == scoreToWin)) {
          this.finishG(server, room);
        } else {
          server.to(room).emit('gameState', this.getGameState() as any);
        }
        this.moveBall();
      }, 1000 / 60);
    }
  }

  pauseG() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  finishG(server, room) {
    const winner = Array.from(this.gameState.values()).find(p => p.score == scoreToWin);
    const loser = Array.from(this.gameState.values()).find(p => p.score != scoreToWin);
    GameService.gameBackend.createGame({
      winnerId: winner.id,
      loserId: loser.id,
      loserScore: loser.score,
      winnerUsername: winner.username,
      loserUsername: loser.username,
    }).then(r => (console.log(r)));
    if (!this.finished){
      server.to(room).emit('gameOver', winner.username);
      this.reset();
      server.to(room).emit('gameState', this.getGameState() as any);
      this.pauseG();
    }
    this.finished = true;

  }

  reset() {
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.paddle1.x = this.paddleWidth;
    this.paddle1.y = this.paddleStartY
    this.paddle2.x = this.width - 2 * this.paddleWidth;
    this.paddle2.y = this.paddleStartY;
    this.ball.dx = this.width / 200 * ((Math.random() - 0.5) < 0 ? 1 : -1);
    this.ball.dy = this.width / 200 * ((Math.random() - 0.5) < 0 ? 1 : -1);
  }

  getHello(): string {
    return 'Hello World from game service!';
  }
}