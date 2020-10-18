
const LEVEL = levels[0]

let textures, tick
    
const controls = {
    p1: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    },
    p2: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    }
}

const RENDER_SIZE = 256

const config = {
    antialias: false,
    transparent: false,
    resolution: 1
}

const stage = new PIXI.Container()
const renderer = PIXI.autoDetectRenderer(RENDER_SIZE, RENDER_SIZE, config)

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x181425

PIXI.loader.add('assets/player-1.png')
PIXI.loader.add('assets/enemy1-hull.png')
PIXI.loader.add('assets/wall.png')
PIXI.loader.add('assets/pew.png')
PIXI.loader.load(startGame)








function startGame() {
    
    tick = 0

    textures = {
        p1: PIXI.Texture.fromImage('assets/player-1.png'),
        wall: PIXI.Texture.fromImage('assets/wall.png')
    }
	
	p1Sprite = new PIXI.Sprite(textures.p1)
    p1Sprite.prefixObject = 'p1'
    p1Sprite.prefixCooldown = 0
    p1Sprite.anchor.set(0.5, 0.5)
	p1Sprite.position.x = 10
	p1Sprite.position.y = 10
	stage.addChild(p1Sprite)

    animationLoop()
}









function animationLoop() {
    requestAnimationFrame(animationLoop)

    tick++

    levelSpawner(tick)

    stage.children.forEach(tickEntities)

    stage.children.forEach(child => child.prefixDestroy && stage.removeChild(child))

    renderer.render(stage)
}

function levelSpawner(tick) {
    const TEMPO = 30
    if (tick % TEMPO === 0) {
        const target = Math.floor(tick / TEMPO)-1
        
        LEVEL.forEach((s, idx) => {
            if (s[target] === '-') {
                const wall = new PIXI.Sprite(PIXI.Texture.fromImage('assets/wall.png'))
                wall.prefixFunc = () => {
                    wall.position.x = wall.position.x - 0.3
                }
                wall.anchor.set(0.5, 0.5)
                wall.position.x = RENDER_SIZE - 5
                wall.position.y = (idx * 20) + 20
                stage.addChild(wall)
            }

            if (s[target] === '1') {
                const enemy = new PIXI.Sprite(PIXI.Texture.fromImage('assets/enemy1-hull.png'))
                enemy.prefixFunc = () => {
                    enemy.position.x = enemy.position.x - 1
                }
                enemy.anchor.set(0.5, 0.5)
                enemy.position.x = RENDER_SIZE - 5
                enemy.position.y = (idx * 20) + 20
                stage.addChild(enemy)
            }
        })
    }
}


function tickEntities(child) {

    child.prefixFunc && child.prefixFunc()

    switch (child.prefixObject) {
        case 'pew':
            const pew = child
            pew.position.x = pew.position.x + 2
            break


        case 'p1':
            
            const player = child

            { // Cap player within screen bounds
                if (player.position.y > 230) {
                    player.position.y = 230
                }

                if (player.position.y < 30) {
                    player.position.y = 30
                }

                if (player.position.x > 240) {
                    player.position.x = 240
                }


                if (player.position.x < 15) {
                    player.position.x = 15
                }
            }

            { // Move sprite
                if (controls.p1.left) {
                    p1Sprite.position.x -= 1
                }
                if (controls.p1.right) {
                    p1Sprite.position.x += 1
                }
                if (controls.p1.up) {
                    p1Sprite.position.y -= 1
                }
                if (controls.p1.down) {
                    p1Sprite.position.y += 1
                }
            }

            // create pew
            if (controls.p1.shoot && player.prefixCooldown <= 0) {
                const pewSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/pew.png'))
                pewSprite.prefixObject = 'pew'
                pewSprite.anchor.set(0.5, 0.5)
                pewSprite.position.x = p1Sprite.position.x + 8
                pewSprite.position.y = p1Sprite.position.y
                stage.addChild(pewSprite)
                player.prefixCooldown = 8
            }

            // Tick cooldown
            if (player.prefixCooldown > 0) {
                player.prefixCooldown = player.prefixCooldown - 1
            }

            break
    }
}










const isEnemy = ({prefixObject}) => prefixObject === 'enemy'
const isMine = ({prefixObject}) => prefixObject === 'mine'
const isBlast = ({prefixObject}) => prefixObject === 'blast'
const isPlayer = ({prefixObject}) => prefixObject === 'p1' || prefixObject === 'p2'
const isPew = ({prefixObject}) => prefixObject === 'pew'
const isPewPuff = ({prefixObject}) => prefixObject === 'pew-puff'
const isRocket = ({prefixObject}) => prefixObject === 'rocket'
const isRocketCollisionFilter = ({prefixObject}) => ['p1', 'p2', 'mine', 'pew', 'enemy', 'blast', 'rocket'].includes(prefixObject)

window.addEventListener('keydown', e => {
    hasInput = true

	if (e.keyCode === 68) {
		controls.p1.right = true
	}
	if (e.keyCode === 65) {
		controls.p1.left = true
	}
	if (e.keyCode === 87) {
		controls.p1.up = true
	}
	if (e.keyCode === 83) {
		controls.p1.down = true
	}
	if (e.keyCode === 32) {
		controls.p1.shoot = true
	}

	if (e.keyCode === 39) {
		controls.p2.right = true
	}
	if (e.keyCode === 37) {
		controls.p2.left = true
	}
	if (e.keyCode === 38) {
		controls.p2.up = true
	}
	if (e.keyCode === 40) {
		controls.p2.down = true
	}
	if (e.keyCode === 13) {
		controls.p2.shoot = true
	}
})

window.addEventListener('keyup', e => {
	if (e.keyCode === 68) {
		controls.p1.right = false
	}
	if (e.keyCode === 65) {
		controls.p1.left = false
	}
	if (e.keyCode === 87) {
		controls.p1.up = false
	}
	if (e.keyCode === 83) {
		controls.p1.down = false
	}
	if (e.keyCode === 32) {
		controls.p1.shoot = false
	}

	if (e.keyCode === 39) {
		controls.p2.right = false
	}
	if (e.keyCode === 37) {
		controls.p2.left = false
	}
	if (e.keyCode === 38) {
		controls.p2.up = false
	}
	if (e.keyCode === 40) {
		controls.p2.down = false
	}
	if (e.keyCode === 13) {
		controls.p2.shoot = false
	}
})

document.getElementById('container').appendChild(renderer.view)