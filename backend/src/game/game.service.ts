import { Injectable } from '@nestjs/common';

class baseObject {
  constructor(public x: number, public y: number, public color: string, public collidable: boolean = true, public orientation: string = 'horizontal') {}
  collision(ball) {
    return false;
  }
}

class rectangle extends baseObject{
  constructor(public x: number, public y: number, public width: number, public height: number, public color:string, public orientation: string) {
    super(x, y, color);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
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

class paddle extends rectangle{
  constructor(public x: number, public y: number, public width: number, public height: number, public color:string, public orientation: string) {
    super(x, y, width, height, color, orientation);
  }
  moveUp() {
    if (this.y == 10)
        return;
    else if (this.y - 30 < 10) {
      this.y = 10;
    }
    else
        this.y -= 30;

  }
  moveDown() {
    if (this.y + this.height == 690)
        return;
    else if (this.y + this.height + 30 > 690)
        this.y = 690 - this.height;
    else
        this.y += 30;
  }
}

class Ball extends baseObject {
  constructor(public x: number, public y: number, public radius: number, public dx: number, public dy: number, public color: string, collidable: boolean = false) {
    super(x, y, color, collidable);
    this.dy = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
    this.dx = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
  }
  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  checkCollision(elements: baseObject[]) {
    for (const e of elements) {
      if (e.collidable && e.collision(this)) {
        if (e.orientation == 'horizontal') {
          this.dy = -this.dy;
        } else if (e instanceof paddle) {
          this.dx = -this.dx;
        } else {
          this.x = 500;
          this.y = 350;
          this.dx = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
          this.dy = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
        }
      }
    }
  }
}
@Injectable()
export class GameService {

    private ball = new Ball(500, 350, 15, 5, 5, 'white');
    private paddle1 = new paddle(20, 275, 10 , 150, 'white', 'vertical');
    private paddle2 = new paddle(960, 275, 10 , 150, 'white', 'vertical');
    private hTop = new rectangle(0, 0, 1000, 10, '#ffffff', 'horizontal');
    private hBottom = new rectangle(0, 690, 1000, 10, '#ffffff', 'horizontal');
    private vLeft = new rectangle(0, 0, 10, 700, '#ffffff', 'vertical');
    private vRight = new rectangle(990, 0, 10, 700, '#ffffff', 'vertical');
    private elements = [this.hTop, this.hBottom, this.vLeft, this.vRight, this.paddle1, this.paddle2];
    public map = new Map<string, paddle>();
    public running = false;

    constructor() {
    }
    checkCollision() {
      this.ball.checkCollision(this.elements);
    }

    registerPlayer(id: string) {
      if (this.map.size == 0) {
        this.map.set(id, this.paddle1);
      } else {
        this.map.set(id, this.paddle2);
      }
    }

    movePaddle(id: string, payload: string) {
      if (payload == 'w') {
        this.map.get(id).moveUp();
      } else if (payload == 's'){
        this.map.get(id).moveDown();
      }
    }

    getPaddlePosition(id: number) {
      if (id == 1) {
        return {x: this.paddle1.x, y: this.paddle1.y};
      }
      else if (id == 2){
        return {x: this.paddle2.x, y: this.paddle2.y};
      }
    }

    moveBall() {
      this.checkCollision();
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;
    }

    getBallPosition() {
        return {x: this.ball.x, y: this.ball.y};
    }

    getPositions() {
      return {ball: this.getBallPosition(), paddle1: this.getPaddlePosition(1), paddle2: this.getPaddlePosition(2)};
    }


    reset() {
      this.ball.x = 500;
      this.ball.y = 350;
      this.paddle1.x = 20;
      this.paddle1.y = 275;
      this.paddle2.x = 960;
      this.paddle2.y = 275;
      this.ball.dx = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
      this.ball.dy = 5 * ((Math.random() - 0.5) < 0 ? 1:-1);
    }
    getHello(): string {
        return 'Hello World from game service!';
    }
}