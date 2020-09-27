
let textures,
    pews, pewPuffs, mines, enemies, ghosts, stars,
    logoContainer, p1Sprite, p2Sprite, p1cooldown, p2cooldown,
    enemyKills, playerDeaths, wave,
    counter, spawnCounter, waveCounter, hasInput 

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

const guiTexts = {}

const RENDER_SIZE = 256

const P1_START_X = 10
const P2_START_X = 12
const P1_START_Y = RENDER_SIZE / 2
const P2_START_Y = RENDER_SIZE / 2 + 20

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
PIXI.loader.add('assets/player-2.png')
PIXI.loader.add('assets/enemy1-shield.png')
PIXI.loader.add('assets/enemy1-hull.png')
PIXI.loader.add('assets/enemy2-shield.png')
PIXI.loader.add('assets/enemy2-hull.png')
PIXI.loader.add('assets/enemy3-hull.png')
PIXI.loader.add('assets/pew.png')
PIXI.loader.add('assets/pew-puff.png')
PIXI.loader.add('assets/mine.png')
PIXI.loader.add('assets/mine-trig.png')
PIXI.loader.add('assets/blast-hull.png')
PIXI.loader.add('assets/blast-shield.png')
PIXI.loader.add('assets/logo.png')
PIXI.loader.load(startGame)

function startGame() {
    counter = 0

    spawnCounter = 0

    enemyKills = 0
    playerDeaths = 0

    p1cooldown = 0
    p2cooldown = 0

    waveCounter = 0

    highscore = 0

    wave = 0

    hasInput = false

    pews = []
    pewPuffs = []
    mines = []
    blasts = []
    enemies = []
    players = []
    ghosts = []

    textures = {
        p1: PIXI.Texture.fromImage('assets/player-1.png'),
        p2: PIXI.Texture.fromImage('assets/player-2.png'),
        'mine-trig': PIXI.Texture.fromImage('assets/mine-trig.png'),
        enemies: {
            horizontal: {
                shield: PIXI.Texture.fromImage('assets/enemy1-shield.png'),
                hull: PIXI.Texture.fromImage('assets/enemy1-hull.png')
            },
            sinus: {
                shield: PIXI.Texture.fromImage('assets/enemy2-shield.png'),
                hull: PIXI.Texture.fromImage('assets/enemy2-hull.png')
            },
            'mini-sinus': {
                hull: PIXI.Texture.fromImage('assets/enemy3-hull.png')
            }
        }
    }
	
    stars = new Array(20).fill().map(() => {
        const star = new PIXI.Graphics()
        star.position.x = Math.floor(Math.random() * RENDER_SIZE)
        star.position.y = Math.floor(Math.random() * RENDER_SIZE)
        star.beginFill(0x262b44)
        star.drawRect(0, 0, 1, 1)
        stage.addChild(star)
        return star
    })

    const topBorder = new PIXI.Graphics()
    topBorder.beginFill(0x262b44)
    topBorder.drawRect(0, 0, RENDER_SIZE, 18)
    stage.addChild(topBorder)

    const topBorderIndent = new PIXI.Graphics()
    topBorderIndent.beginFill(0x262b44)
    topBorderIndent.drawRect(40, 18, RENDER_SIZE - 80, 8)
    stage.addChild(topBorderIndent)

    guiTexts.waveText = new PIXI.Text('', {fontFamily : 'Press Start 2P', fontSize: 30, fill : 0xffffff})
    guiTexts.waveText.prefixTimer = 180
    guiTexts.waveText.position.x = 42
    guiTexts.waveText.position.y = 50
    stage.addChild(guiTexts.waveText)

    guiTexts.playerDeathText = new PIXI.Text(playerDeaths, {fontFamily : 'Press Start 2P', fontSize: 16, fill : 0xe43b44})
    guiTexts.playerDeathText.position.x = 2
    guiTexts.playerDeathText.position.y = 2
    stage.addChild(guiTexts.playerDeathText)

    guiTexts.enemyKillText = new PIXI.Text(enemyKills, {fontFamily : 'Press Start 2P', fontSize: 16, fill : 0x63c74d})
    guiTexts.enemyKillText.anchor.set(1, 0)
    guiTexts.enemyKillText.position.x = RENDER_SIZE
    guiTexts.enemyKillText.position.y = 2
    stage.addChild(guiTexts.enemyKillText)

    guiTexts.highscoreText = new PIXI.Text(highscore, {fontFamily : 'Press Start 2P', fontSize: 24, fill : 0xffffff})
    guiTexts.highscoreText.anchor.set(0.5, 0)
    guiTexts.highscoreText.position.x = RENDER_SIZE / 2
    guiTexts.highscoreText.position.y = 2
    stage.addChild(guiTexts.highscoreText)

	p1Sprite = new PIXI.Sprite(textures.p1)
    p1Sprite.prefixGodmode = 120
	p1Sprite.anchor.set(0.5, 0.5)
	p1Sprite.position.x = P1_START_X
	p1Sprite.position.y = P1_START_Y
	players.push(p1Sprite)
    stage.addChild(p1Sprite)

    p2Sprite = new PIXI.Sprite(textures.p2)
    p2Sprite.prefixGodmode = 120
    p2Sprite.anchor.set(0.5, 0.5)
    p2Sprite.position.x = P2_START_X
    p2Sprite.position.y = P2_START_Y
	players.push(p2Sprite)
    stage.addChild(p2Sprite)

    logoContainer = new PIXI.Sprite(PIXI.Texture.fromImage('assets/logo.png'))
    logoContainer.position.x = 30
    logoContainer.position.y = RENDER_SIZE / 4
    stage.addChild(logoContainer)

    gameloop()
}

function gameloop() {
    requestAnimationFrame(gameloop)

    counter = counter + 0.01

    if (counter > 120) {
    	counter = 0
    } 

    if (players.find(p => p === p1Sprite)) {
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
	    if (controls.p1.shoot && p1cooldown <= 0) {
	    	const pewSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/pew.png'))
	    	pewSprite.anchor.set(0.5, 0.5)
	    	pewSprite.position.x = p1Sprite.position.x
	    	pewSprite.position.y = p1Sprite.position.y
	    	stage.addChild(pewSprite)
	    	pews.push(pewSprite)
	    	p1cooldown = 8
	    }

	    if (p1cooldown > 0) {
	    	p1cooldown = p1cooldown - 1
	    }
	}

    if (players.find(p => p === p2Sprite)) {
	    if (controls.p2.left) {
	    	p2Sprite.position.x -= 1
	    }
	    if (controls.p2.right) {
	    	p2Sprite.position.x += 1
	    }
	    if (controls.p2.up) {
	    	p2Sprite.position.y -= 1
	    }
	    if (controls.p2.down) {
	    	p2Sprite.position.y += 1
	    }
	    if (controls.p2.shoot && p2cooldown <= 0) {
	    	const mineSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/mine.png'))
	    	mineSprite.prefixActivationTimer = null
	    	mineSprite.anchor.set(0.5, 0.5)
	    	mineSprite.position.x = p2Sprite.position.x
	    	mineSprite.position.y = p2Sprite.position.y
	    	stage.addChild(mineSprite)
	    	mines.push(mineSprite)
	    	p2cooldown = 80
	    }

	    if (p2cooldown > 0) {
	    	p2cooldown = p2cooldown - 1
	    }
	}

    pews.forEach(p => {
    	p.position.x = p.position.x + 2

    	let pewHit = false

    	enemies.forEach(e => {
    		const dx = p.position.x - e.position.x
    		const dy = p.position.y - e.position.y
    		const distance = Math.sqrt(dx * dx + dy * dy)

    		if (distance < 8 + 2) {
    			pewHit = true
    			if (e.prefixShield > 0) {
    				e.prefixShield = e.prefixShield - 1
    			} else {
    				e.position.x += 3

    				if (p.position.y > e.position.y) {
    					e.position.y -= 5
    				} else {
    					e.position.y += 5
    				}
    			}
    		}	
    	})

    	const dx = p.position.x - p2Sprite.position.x
		const dy = p.position.y - p2Sprite.position.y
		const distance = Math.sqrt(dx * dx + dy * dy)
		if (distance < 8 + 2) {
			pewHit = true
			playerDeaths++

            const ghostSprite = new PIXI.Sprite(textures.p2)
            ghostSprite.prefixTimer = 80
            ghostSprite.anchor.set(0.5, 0.5)
            ghostSprite.position.x = p2Sprite.position.x
            ghostSprite.position.y = p2Sprite.position.y
            ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
            ghostSprite.tint = 0x000000
            ghosts.push(ghostSprite)
            stage.addChild(ghostSprite)

            p2Sprite.prefixGodmode = 120
            p2Sprite.position.x = P2_START_X
            p2Sprite.position.y = P2_START_Y            
		}

		mines.forEach(m => {
			const dx = p.position.x - m.position.x
			const dy = p.position.y - m.position.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			if (distance < 2 + 2 + 2) {
				pewHit = true				

				if (m.prefixActivationTimer === null) {
					m.prefixActivationTimer = 40
					m.prefixActivationType = 'shield'
					m.texture = textures['mine-trig']
				}
			}
		})

    	if (pewHit || p.position.x > RENDER_SIZE) {
            const pewPuff = new PIXI.Sprite(PIXI.Texture.fromImage('assets/pew-puff.png'))
            pewPuff.prefixTimer = 5
            pewPuff.anchor.set(0.5, 0.5)
            pewPuff.position.x = p.position.x
            pewPuff.position.y = p.position.y
            pewPuffs.push(pewPuff)
            stage.addChild(pewPuff)
    
    		p.prefixDestroy = true
    		stage.removeChild(p)
    	} 
    })

    pewPuffs.forEach(pp => {
        pp.prefixTimer--

        if (pp.prefixTimer <= 0) {
            pp.prefixDestroy = true
            stage.removeChild(pp)
        }
    })

    mines.forEach(m => {
    	
    	enemies.forEach(e => {
    		const dx = m.position.x - e.position.x
    		const dy = m.position.y - e.position.y
    		const distance = Math.sqrt(dx * dx + dy * dy)	

    		if (distance < 8 + 2 && m.prefixActivationTimer === null) {
    			m.prefixActivationTimer = 40
				m.prefixActivationType = 'hull'
				m.texture = textures['mine-trig']
    		}			
    	})

    	const dx = m.position.x - p1Sprite.position.x
		const dy = m.position.y - p1Sprite.position.y
		const distance = Math.sqrt(dx * dx + dy * dy)
		if (distance < 8 + 2 && m.prefixActivationTimer === null) {
			m.prefixActivationTimer = 40
			m.prefixActivationType = 'hull'
			m.texture = textures['mine-trig']
		}

		if (m.prefixActivationTimer !== null) {
			if (m.prefixActivationTimer <= 0) {
				m.prefixDestroy = true
				stage.removeChild(m)

                const texture = m.prefixActivationType === 'shield'
                    ? PIXI.Texture.fromImage('assets/blast-shield.png')
                    : PIXI.Texture.fromImage('assets/blast-hull.png')
                    
				const blastSprite = new PIXI.Sprite(texture)
		    	blastSprite.anchor.set(0.5, 0.5)
		    	blastSprite.prefixType = m.prefixActivationType
		    	blastSprite.position.x = m.position.x
		    	blastSprite.position.y = m.position.y
		    	blastSprite.prefixTimer = 30
		    	stage.addChild(blastSprite)
		    	blasts.push(blastSprite)
	    	} else {
	    		m.prefixActivationTimer--
	    	}
	    }
    })

    blasts.forEach(blast => {

    	enemies.forEach(e => {
    		const dx = blast.position.x - e.position.x
    		const dy = blast.position.y - e.position.y
    		const distance = Math.sqrt(dx * dx + dy * dy)

    		if (distance < 48 + 8) {
    			if (blast.prefixType === 'shield') {
    				e.prefixShield = 0
    			} else if (blast.prefixType === 'hull' && e.prefixShield <= 0) {
    				e.prefixHull = 0
    			}
    		}			
    	})

    	players.forEach(player => {
    		const dx = blast.position.x - player.position.x
			const dy = blast.position.y - player.position.y
			const distance = Math.sqrt(dx * dx + dy * dy)
			if (distance < 48 + 8) {
				playerDeaths++

                const ghostSprite = new PIXI.Sprite(player === p1Sprite ? textures.p1 : textures.p2)
                ghostSprite.prefixTimer = 80
                ghostSprite.anchor.set(0.5, 0.5)
                ghostSprite.position.x = player === p1Sprite ? p1Sprite.position.x : p2Sprite.position.x
                ghostSprite.position.y = player === p1Sprite ? p1Sprite.position.y : p2Sprite.position.y
                ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                ghostSprite.tint = 0x000000
                ghosts.push(ghostSprite)
                stage.addChild(ghostSprite)

				player.position.x = player === p1Sprite ? P1_START_X : P2_START_X
                player.position.y = player === p1Sprite ? P1_START_Y : P2_START_Y
                player.prefixGodmode = 120
			}

    	})

    	blast.prefixTimer = blast.prefixTimer - 1

    	if (blast.prefixTimer <= 0) {
    		blast.prefixDestroy = true
    		stage.removeChild(blast)
    	}
    }) 

    enemies.forEach(e => {
    	if (e.prefixHull <= 0) {
    		enemyKills++

            const ghostSprite = new PIXI.Sprite()

            if (e.prefixType === 'horizontal') {
                ghostSprite.texture = textures.enemies.horizontal.hull
            } else if (e.prefixType === 'sinus') {
                ghostSprite.texture = textures.enemies.sinus.hull
            } else if (e.prefixType === 'mini-sinus') {
                ghostSprite.texture = textures.enemies['mini-sinus'].hull
            }

            ghostSprite.prefixTimer = 40
            ghostSprite.anchor.set(0.5, 0.5)
            ghostSprite.position.x = e.position.x
            ghostSprite.position.y = e.position.y
            ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
            ghostSprite.tint = 0x000000
            ghosts.push(ghostSprite)
            stage.addChild(ghostSprite)

			e.prefixDestroy = true
    		stage.removeChild(e)
		}
		if (e.position.x <= 0) {
			e.prefixDestroy = true
    		stage.removeChild(e)
    		playerDeaths++
		}

		players.forEach(player => {
			const dx = player.position.x - e.position.x
    		const dy = player.position.y - e.position.y
    		const distance = Math.sqrt(dx * dx + dy * dy)

    		if (distance < 8 + 8) {
    			e.prefixDestroy = true
    			stage.removeChild(e)
    			playerDeaths++
    			
                const ghostSprite = new PIXI.Sprite(player === p1Sprite ? textures.p1 : textures.p2)
                ghostSprite.prefixTimer = 80
                ghostSprite.anchor.set(0.5, 0.5)
                ghostSprite.position.x = player === p1Sprite ? p1Sprite.position.x : p2Sprite.position.x
                ghostSprite.position.y = player === p1Sprite ? p1Sprite.position.y : p2Sprite.position.y
                ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                ghostSprite.tint = 0x000000
                ghosts.push(ghostSprite)
                stage.addChild(ghostSprite)

                player.position.x = player === p1Sprite ? P1_START_X : P2_START_X
                player.position.y = player === p1Sprite ? P1_START_Y : P2_START_Y
                player.prefixGodmode = 120
    		}
		})

    	if (e.prefixShield > 0) {
            if (e.prefixType === 'horizontal') {
                e.texture = textures.enemies.horizontal.shield
            } else if (e.prefixType === 'sinus') {
                e.texture = textures.enemies.sinus.shield    
            }
    	} else {
            if (e.prefixType === 'horizontal') {
    		  e.texture = textures.enemies.horizontal.hull
            } else if (e.prefixType === 'sinus') {
              e.texture = textures.enemies.sinus.hull
            } else if (e.prefixType === 'mini-sinus') {
              e.texture = textures.enemies['mini-sinus'].hull
            }
    	}

    	if (e.prefixType === 'horizontal') {
    		e.position.x = e.position.x - 0.075		
    	} else if (e.prefixType === 'sinus') {
    		e.position.x = e.position.x - 0.075
    		e.position.y = e.position.y + Math.sin(counter) * 0.4
    	} else if (e.prefixType === 'mini-sinus') {
    		e.position.x = e.position.x - 0.2
    		e.position.y = e.position.y + Math.sin(counter * 10) * 0.7
    	}

    	if (e.position.y > 220) {
    		e.position.y = 220
    	}

    	if (e.position.y < 30) {
    		e.position.y = 30
    	}
    })

    players.forEach(p => {
        if (p.prefixGodmode >= 0) {
            p.prefixGodmode--
            p.visible = Math.sin(counter * 25) > 0
        } else {
            p.visible = true    
        }

        if (p.position.y > 230) {
            p.position.y = 230
        }

        if (p.position.y < 30) {
            p.position.y = 30
        }

        if (p.position.x > 240) {
            p.position.x = 240
        }

        if (p.position.x < 15) {
            p.position.x = 15
        }


    })

    ghosts.forEach(g => {
        g.prefixTimer--

        g.position.x += Math.sin(counter * 100)
        
        if (g.prefixTimer <= 0) {
            g.prefixDestroy = true
            stage.removeChild(g)
        }
    })

    stars.forEach(s => {
        s.position.x -= 0.1

        if (s.position.x < 0) {
            s.position.x = RENDER_SIZE
        }
    })

    pews = pews.filter(p => !p.prefixDestroy)
    pewPuffs = pewPuffs.filter(p => !p.prefixDestroy)
    enemies = enemies.filter(p => !p.prefixDestroy)
    mines = mines.filter(p => !p.prefixDestroy)
    blasts = blasts.filter(p => !p.prefixDestroy)
    ghosts = ghosts.filter(p => !p.prefixDestroy)
    
    guiTexts.playerDeathText.text = playerDeaths
    guiTexts.enemyKillText.text = enemyKills

    spawnCounter++

    const MAX_ENEMIES = 5

    if (guiTexts.waveText.prefixTimer > 0 && hasInput) {
        guiTexts.waveText.prefixTimer--
        guiTexts.waveText.text = 'WAVE ' + (wave + 1)
        guiTexts.waveText.visible = true
    } else {
        guiTexts.waveText.visible = false
    }

    if (spawnCounter > 100 && waveCounter < MAX_ENEMIES && hasInput) {
    	waveCounter++
    	spawnCounter = 0

    	const enemy = new PIXI.Sprite()
    	enemy.anchor.set(0.5, 0.5)

    	const rand = Math.random()
    	if (rand < 0.3) {
	    	enemy.prefixType = 'horizontal'
	    	enemy.prefixShield = 20
	    	enemy.prefixHull = 40
	    } else if (rand < 0.6) {
	    	enemy.prefixType = 'sinus'
	    	enemy.prefixShield = 5
	    	enemy.prefixHull = 40
	    } else {
	    	enemy.prefixType = 'mini-sinus'
	    	enemy.prefixShield = 0
	    	enemy.prefixHull = 10
	    }

	    enemy.position.x = RENDER_SIZE - 16
	    enemy.position.y = 80 + Math.floor(Math.random() * 100)
	    enemies.push(enemy)
	    stage.addChild(enemy)
    }

    if (waveCounter >= MAX_ENEMIES && enemies.length === 0) {
    	waveCounter = 0
        wave++
        guiTexts.waveText.prefixTimer = 180
    }

    highscore = enemyKills * 1000 - playerDeaths * 5000
    guiTexts.highscoreText.text = highscore

    if (hasInput) {
        logoContainer.visible = false
    }

    renderer.render(stage)
}

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