<script setup>
import { ref, onMounted } from 'vue'

class paddle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height
    this.color = color
  }
  draw() {
    const ctx = canvas.value.getContext('2d');
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
  moveUp() {
    this.y -= 10;
  }
  moveDown() {
    this.y += 10;
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

class rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height
    this.color = color
  }
  draw() {
    const ctx = canvas.value.getContext('2d');
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

const canvas = ref(null)
const paddle1 = new paddle(20, 300, 20, 100, '#ffffff');
const hTop = new rectangle(0, 0, 1000, 10, '#ffffff');
const hBottom = new rectangle(0, 690, 1000, 10, '#ffffff');
const vLeft = new rectangle(0, 0, 10, 700, '#ffffff');
const vRight = new rectangle(990, 0, 10, 700, '#ffffff');
const obstacles = [hTop, hBottom, vLeft, vRight, paddle1];
let centerX = 500;
let centerY = 350;
let paddleY = 300;
let radius = 30;
let dx = 4 * ((Math.random() - 0.5) < 0 ? 1:-1); // Change in x (speed)
let dy = 4 * ((Math.random() - 0.5) < 0 ? 1:-1); // Change in y (speed)
function drawFrame() {
  // const ctx = canvas.value.getContext('2d')
  // ctx.beginPath();
  // ctx.rect(0, 0, 1000, 700);
  // ctx.strokeStyle = '#ffffff';
  // ctx.lineWidth = 20;
  // ctx.stroke();
  // ctx.closePath();
  hTop.draw();
  hBottom.draw();
  vLeft.draw();
  vRight.draw();
}

function checkCollision() {
  // if (centerX + radius > 990 || centerX - radius < 10) {
  // if (centerX - radius < 10) {
  //   centerX = 500;
  //   centerY = 350;
  //   dx = 4 * ((Math.random() - 0.5) < 0 ? 1:-1);
  //   dy = 4 * ((Math.random() - 0.5) < 0 ? 1:-1);
  // }
  // if (centerX + radius > 990 || paddle1.collision({x: centerX, y: centerY, radius: radius})) {
  //   dx = -dx;
  // }
  // if (centerY + radius > 690 || centerY - radius < 10) {
  //   dy = -dy;
  // }
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].collision({x: centerX, y: centerY, radius: radius})) {
      if (obstacles[i] === paddle1) {
        dx = -dx;
      } else {
        if (obstacles[i] === hTop || obstacles[i] === hBottom) {
          dy = -dy;
        } else {
          dx = -dx;
        }
      }
    }
  }
}

function drawBall() {
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, 1000, 700);
  drawFrame();
  paddle1.draw();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.closePath();
  checkCollision();
  centerX += dx;
  centerY += dy;
  requestAnimationFrame(drawBall);
}

onMounted(() => {
  drawBall();
})
window.addEventListener("keydown", handleKeys);

function handleKeys(e) {
  console.log(e.key);
  if (e.key === "ArrowUp") {
    paddle1.moveUp();
  }
  if (e.key === "ArrowDown") {
    paddle1.moveDown();
  }
}
</script>

<template>
  <canvas width="1000" height="700" id="game-canvas" ref="canvas"></canvas>
    <h4>Move left paddle up and down with the arrow keys</h4>
</template>

<style>
body{
  text-align: center;
}
canvas{
  display: block;
  margin: 0px auto;
  background: black;
}
</style>
