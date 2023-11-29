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
        else if (this.y - 30 < 10)
            this.y = 10;
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

class Ball extends object {
    constructor(public x: number, public y: number, public radius: number, public dx: number, public dy: number, public color: string, collidable: boolean = false) {
        super(x, y, color, collidable);
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    checkCollision(elements: object[]) {
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


export function game(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    const hTop = new rectangle(0, 0, 1000, 10, '#ffffff', 'horizontal');
    const hBottom = new rectangle(0, 690, 1000, 10, '#ffffff', 'horizontal');
    const vLeft = new rectangle(0, 0, 10, 700, '#ffffff', 'vertical');
    const vRight = new rectangle(990, 0, 10, 700, '#ffffff', 'vertical');
    const pL = new paddle(20, 275, 100, 150, 'red', 'vertical');
    const pR = new paddle(870, 275, 100, 150, 'red', 'vertical');
    const ball = new Ball(100, 100, 15, 5, 5, 'white');
    const elements: any[] = [hTop, hBottom, vLeft, vRight, pL, pR, ball];
    document.addEventListener("keydown", keyDownHandler);
    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const e of elements) {
            e.draw(ctx)
        }
        drawBoard(ctx, 500, 10, 500, 690);
        ball.checkCollision(elements);
        ball.move();
        requestAnimationFrame(drawFrame)
    }
    function keyDownHandler(e) {
        if (e.key == "Up" || e.key == "ArrowUp") {
            pR.moveUp();
        }
        else if (e.key == "Down" || e.key == "ArrowDown") {
            pR.moveDown();
        } else if (e.key == "w"){
            pL.moveUp();
        } else if (e.key == "s"){
            pL.moveDown();
        }
    }
    drawFrame();

}
