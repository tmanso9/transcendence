import type {Socket} from "socket.io-client";

class object {
    constructor(public x: number, public y: number, public color: string, public collidable: boolean = true, public orientation: string = 'horizontal') {}
    collision(ball) {
        return false;
    }
}

class rectangle extends object{
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
}

class paddle extends rectangle{
    constructor(public x: number, public y: number, public width: number, public height: number, public color:string, public orientation: string) {
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
    ctx.arc(x1, (y2-y1)/2 + 10, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    //draw innerCircle
    ctx.beginPath();
    ctx.arc(x1, (y2-y1)/2 + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}


export function game(canvas: HTMLCanvasElement, socket: Socket) {
    const ctx = canvas.getContext('2d');
    const hTop = new rectangle(0, 0, 1000, 10, '#ffffff', 'horizontal');
    const hBottom = new rectangle(0, 690, 1000, 10, '#ffffff', 'horizontal');
    const vLeft = new rectangle(0, 0, 10, 700, '#ffffff', 'vertical');
    const vRight = new rectangle(990, 0, 10, 700, '#ffffff', 'vertical');
    const pL = new paddle(20, 275, 20, 150, 'red', 'vertical');
    const pR = new paddle(960, 275, 20, 150, 'red', 'vertical');
    const ball = new Ball(500, 350, 15, 5, 5, 'white');
    const elements: any[] = [hTop, hBottom, vLeft, vRight, pL, pR, ball];
    window.addEventListener("keydown", keyDownHandler);
    socket.on('positions', (data: any) => {
      pL.y = data.paddle1.y;
      pR.y = data.paddle2.y;
      ball.x = data.ball.x;
      ball.y = data.ball.y;
    });
    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const e of elements) {
            e.draw(ctx)
        }
        drawBoard(ctx, 500, 10, 500, 690);
        requestAnimationFrame(drawFrame)
    }
    function keyDownHandler(e) {
      socket.emit('movePaddle', e.key);
    }
    drawFrame();

}
