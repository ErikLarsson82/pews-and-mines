
let player, sprite, up, down, left, right, space

const RENDER_HEIGHT = 256

const config = {
    antialias: false,
    transparent: false,
    resolution: 1
}

const stage = new PIXI.Container()
const renderer = PIXI.autoDetectRenderer(RENDER_HEIGHT, RENDER_HEIGHT, config)

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x222034

PIXI.loader.add('assets/player.png')
PIXI.loader.add('assets/player-swing.png')
PIXI.loader.add('assets/skeleton.png')
PIXI.loader.load(startGame)

function startGame() {
	player = PIXI.Texture.fromImage('assets/player.png')
	playerSwing = PIXI.Texture.fromImage('assets/player-swing.png')
	
	sprite = new PIXI.Sprite(player)
    stage.addChild(sprite)

    animate()
}

function animate() {
    requestAnimationFrame(animate)

    if (left) {
    	sprite.position.x -= 1
    }
    if (right) {
    	sprite.position.x += 1
    }
    if (up) {
    	sprite.position.y -= 1
    }
    if (down) {
    	sprite.position.y += 1
    }
    if (space) {
    	sprite.texture = playerSwing
    }

    renderer.render(stage)
}

window.addEventListener('keydown', e => {
	if (e.keyCode === 68) {
		right = true
	}
	if (e.keyCode === 65) {
		left = true
	}
	if (e.keyCode === 87) {
		up = true
	}
	if (e.keyCode === 83) {
		down = true
	}
	if (e.keyCode === 13) {
		space = true
	}
})

window.addEventListener('keyup', e => {
	if (e.keyCode === 68) {
		right = false
	}
	if (e.keyCode === 65) {
		left = false
	}
	if (e.keyCode === 87) {
		up = false
	}
	if (e.keyCode === 83) {
		down = false
	}
	if (e.keyCode === 13) {
		space = false
	}
})

document.body.appendChild(renderer.view)