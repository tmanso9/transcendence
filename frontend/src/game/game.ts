import type {Socket} from "socket.io-client";
import {gameStore} from "@/store/game";
import {he} from "vuetify/locale";


const gStore = gameStore();

class object {
  constructor(public x: number, public y: number, public color: string, public collidable: boolean = true, public orientation: string = 'horizontal') {
  }

  collision() {
    return false;
  }
}

class rectangle extends object {
  constructor(public x: number, public y: number, public width: number, public height: number, public color: string, public orientation: string) {
    super(x, y, color);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class paddle extends rectangle {
  constructor(public x: number, public y: number, public width: number, public height: number, public color: string, public orientation: string) {
    super(x, y, width, height, color, orientation);
  }
}

class Ball extends object {
  constructor(public x: number, public y: number, public radius: number, public dx: number, public dy: number, public color: string, collidable: boolean = false) {
    super(x, y, color, collidable);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function drawBoard(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  //draw dashed line
  ctx.beginPath();
  ctx.setLineDash([35, 15]);
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'white';
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2 / 2 - 20);
  ctx.moveTo(x1, y2 / 2 + 30);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();

  //draw circle
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x1, (y2 - y1) / 2 + 10, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();

  //draw innerCircle
  ctx.beginPath();
  ctx.arc(x1, (y2 - y1) / 2 + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}


export function game(canvas: HTMLCanvasElement, socket: Socket, width: number, height: number) {
  const lineWidth = width / 100;
  let winner = null;
  const paddleWidth = width / 50;
  const paddleHeight = height / 5;
  const paddleStartY = height / 2 - paddleHeight / 2;
  const ctx = canvas.getContext('2d');
  const hTop = new rectangle(0, 0, width, lineWidth, '#ffffff', 'horizontal');
  const hBottom = new rectangle(0, height - lineWidth, width, lineWidth, '#ffffff', 'horizontal');
  const vLeft = new rectangle(0, 0, lineWidth, height, '#ffffff', 'vertical');
  const vRight = new rectangle(width - lineWidth, 0, lineWidth, height, '#ffffff', 'vertical');
  const pL = new paddle(paddleWidth, paddleStartY, paddleWidth, paddleHeight, 'red', 'vertical');
  const pR = new paddle(width - 2 * paddleWidth, paddleStartY, paddleWidth, paddleHeight, 'red', 'vertical');
  const ball = new Ball(width / 2, height / 2, width / 200 * 3, width / 200, width / 200, 'white');
  const elements: any[] = [hTop, hBottom, vLeft, vRight, pL, pR, ball];
  window.addEventListener("keydown", keyDownHandler);
  socket.on('gameState', (data: any) => {
    pL.y = data.paddle1.y;
    pR.y = data.paddle2.y;
    ball.x = data.ball.x;
    ball.y = data.ball.y;
    gStore.score.set('paddle1', data.score.paddle1);
    gStore.score.set('paddle2', data.score.paddle2);
  });

  socket.on("gameOver", (w: string) => winner = w);

  function gameOver(winner: string) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'White'; // Text color
    ctx.font = '30px Arial'; // Font size and family
    ctx.textAlign = 'center'; // Align text in the center

    ctx.fillText(`Player ${winner} wins!`, canvas.width / 2, canvas.height / 2);
    console.log("game over");
  }
  function drawFrame() {
    if (winner != null)
      gameOver(winner);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const e of elements) {
        e.draw(ctx)
      }
      drawBoard(ctx, width / 2, lineWidth, width / 2, height - lineWidth);
      requestAnimationFrame(drawFrame)
    }
  }

  function keyDownHandler(e) {
    socket.emit('movePaddle', e.key);
  }

  drawFrame();

}
