let s
let time0 = new Date() / 1000
let seed
let b, bP

function preload() {
  s = loadShader('s.vert', 's.frag')
}

function setup() {
  pixelDensity(.5);
  let c = createCanvas(540, 540, WEBGL)
  b = createGraphics(width, height, WEBGL)
  bP = createGraphics(width, height, WEBGL)
  b.background('green')
  b.circle(0, 0, 100)
  bP.background('green')
  bP.circle(0, 0, 100)
  noStroke()
}

function draw() {
  // background('yellow')
  b.shader(s)
  s.setUniform('u_res', [width, height])
  s.setUniform('t', new Date() / 1000 - time0)
  s.setUniform('tick', frameCount - 1)
  // s.setUniform('backbuffer', bP)
  b.rect(0, 0, height, height)
  image(bP, -width / 2, -height / 2, width, height)
  // let tmp = b
  // b = bP
  // bP = tmp
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight)
// }

function random_hash() {
  let chars = "0123456789abcdef";
  let result = '0x';
  for (let i = 64; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


function mouseClicked() {
  tokenData = { "hash": random_hash() }
  console.log(tokenData.hash)
  seed = parseInt(tokenData.hash.slice(0, 16), 16) / 1e13
  console.log(seed)
}