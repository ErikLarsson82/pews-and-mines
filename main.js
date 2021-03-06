
const { curry } = R

let textures,
    logoContainer, p1Sprite, p2Sprite, p1cooldown, p2cooldown,
    enemyKills, playerDeaths, wave, waveArray, allWaves,
    counter, tick, spawnCounter, waveCounter, hasInput 

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

const ENEMIES_PER_WAVE = 5

const RENDER_SIZE = 256

const P1_START_X = 10
const P2_START_X = 12
const P1_START_Y = RENDER_SIZE / 2
const P2_START_Y = RENDER_SIZE / 2 + 20

let deltaFactor









const config = {
    antialias: false,
    transparent: false,
    resolution: 1,
    sharedTicker: true,
}

const app = new PIXI.Application(config)
const renderer = PIXI.autoDetectRenderer(RENDER_SIZE, RENDER_SIZE, config)
app.renderer = renderer

const stage = app.stage


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x181425

PIXI.loader.add('assets/player-1.png')
PIXI.loader.add('assets/player-2.png')
PIXI.loader.add('assets/enemy1-hull.png')
PIXI.loader.add('assets/enemy2-hull.png')
PIXI.loader.add('assets/enemy3-hull.png')
PIXI.loader.add('assets/enemy4-hull.png')
PIXI.loader.add('assets/enemy5-hull.png')
PIXI.loader.add('assets/enemy-shield.png')
PIXI.loader.add('assets/enemy-shield-small.png')
PIXI.loader.add('assets/enemy-blast.png')
PIXI.loader.add('assets/enemy-rocket.png')
PIXI.loader.add('assets/enemy-rocket-stopped.png')
PIXI.loader.add('assets/pew.png')
PIXI.loader.add('assets/pew-puff.png')
PIXI.loader.add('assets/stun-effect.png')
PIXI.loader.add('assets/mine.png')
PIXI.loader.add('assets/mine-trig-hull.png')
PIXI.loader.add('assets/mine-trig-shield.png')
PIXI.loader.add('assets/mine-blip.png')
PIXI.loader.add('assets/blast-hull.png')
PIXI.loader.add('assets/blast-shield.png')
PIXI.loader.add('assets/logo.png')
PIXI.loader.add('assets/powerup.png')
PIXI.loader.add('assets/companion.png')
PIXI.loader.load(startGame)








function startGame() {
    tick = 0
    counter = 0

    spawnCounter = 0

    enemyKills = 0
    playerDeaths = 0

    p1cooldown = 0
    p2cooldown = 0

    waveCounter = 0

    highscore = 0

    wave = 0

    waveArray = []

    allWaves = []

    hasInput = false

    textures = {
        p1: PIXI.Texture.fromImage('assets/player-1.png'),
        p2: PIXI.Texture.fromImage('assets/player-2.png'),
        'mine-trig-hull': PIXI.Texture.fromImage('assets/mine-trig-hull.png'),
        'mine-trig-shield': PIXI.Texture.fromImage('assets/mine-trig-shield.png'),
        enemies: {
            horizontal: {
                hull: PIXI.Texture.fromImage('assets/enemy1-hull.png')
            },
            sinus: {
                hull: PIXI.Texture.fromImage('assets/enemy2-hull.png')
            },
            'mini-sinus': {
                hull: PIXI.Texture.fromImage('assets/enemy3-hull.png')
            },
            'fodder-hull': {
                hull: PIXI.Texture.fromImage('assets/enemy4-hull.png')
            },
            'fodder-shield': {
                hull: PIXI.Texture.fromImage('assets/enemy5-hull.png')
            }
        }
    }
	
    for (var i = 0; i < 20; i++) {
        const star = new PIXI.Graphics()
        star.prefixObject = 'star'
        star.position.x = Math.floor(Math.random() * RENDER_SIZE)
        star.position.y = Math.floor(Math.random() * RENDER_SIZE)
        star.beginFill(0x262b44)
        star.drawRect(0, 0, 1, 1)
        stage.addChild(star)
    }

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
    p1Sprite.prefixObject = 'p1'
    p1Sprite.prefixGodmode = 120
	p1Sprite.anchor.set(0.5, 0.5)
	p1Sprite.position.x = P1_START_X
	p1Sprite.position.y = P1_START_Y
	stage.addChild(p1Sprite)

    p2Sprite = new PIXI.Sprite(textures.p2)
    p2Sprite.prefixObject = 'p2'
    p2Sprite.prefixGodmode = 120
    p2Sprite.anchor.set(0.5, 0.5)
    p2Sprite.position.x = P2_START_X
    p2Sprite.position.y = P2_START_Y
	stage.addChild(p2Sprite)

    logoContainer = new PIXI.Sprite(PIXI.Texture.fromImage('assets/logo.png'))
    logoContainer.position.x = 30
    logoContainer.position.y = RENDER_SIZE / 4
    stage.addChild(logoContainer)

    animationLoop()
}









function animationLoop() {
    requestAnimationFrame(animationLoop)

    deltaFactor = 0.114 * app.ticker.elapsedMS

    tick = Math.floor(tick + 1 * deltaFactor)
    counter += 0.01 * deltaFactor

    if (counter > 120) {
    	counter = 0
    }

    stage.children.forEach(tickEntities)

    stage.children.forEach(child => child.prefixDestroy && stage.removeChild(child))

    guiTexts.playerDeathText.text = playerDeaths
    guiTexts.enemyKillText.text = enemyKills

    spawnCounter += 1 * deltaFactor

    if (guiTexts.waveText.prefixTimer > 0 && hasInput) {
        guiTexts.waveText.prefixTimer -= 1 * deltaFactor
        guiTexts.waveText.text = 'WAVE ' + (wave + 1)
        guiTexts.waveText.visible = true
    } else {
        guiTexts.waveText.visible = false
    }
    
    if (waveArray.length > 0 && hasInput && spawnCounter > 100) {
        spawnCounter = 0
        
    	const enemy = new PIXI.Sprite()
    	enemy.prefixObject = 'enemy'
        enemy.anchor.set(0.5, 0.5)

        const name = waveArray.shift()

        if (name === 'horizontal') {
	    	enemy.prefixType = 'horizontal'
            enemy.texture = PIXI.Texture.fromImage('assets/enemy1-hull.png')
	    	enemy.prefixShield = 20
	    	enemy.prefixHull = 40
            enemy.prefixRocketTimer = 40
	    } else if (name === 'sinus') {
	    	enemy.prefixType = 'sinus'
            enemy.texture = PIXI.Texture.fromImage('assets/enemy2-hull.png')
	    	enemy.prefixShield = 5
	    	enemy.prefixHull = 40
	    } else if (name === 'mini-sinus') {
	    	enemy.prefixType = 'mini-sinus'
            enemy.texture = PIXI.Texture.fromImage('assets/enemy3-hull.png')
	    	enemy.prefixShield = 0
	    	enemy.prefixHull = 10
	    } else if (name === 'fodder-hull') {
            enemy.prefixType = 'fodder-hull'
            enemy.texture = PIXI.Texture.fromImage('assets/enemy4-hull.png')
            enemy.prefixShield = 0
            enemy.prefixHull = 1
        } else if (name === 'fodder-shield') {
            enemy.prefixType = 'fodder-shield'
            enemy.texture = PIXI.Texture.fromImage('assets/enemy5-hull.png')
            enemy.prefixShield = 1
            enemy.prefixHull = 1
        }

        if (enemy.prefixShield > 0) {
            const shieldSprite = new PIXI.Sprite()
            let shieldTexturePath = 'assets/enemy-shield.png'
            if (name === 'fodder-shield') {
                shieldTexturePath = 'assets/enemy-shield-small.png'
            }
            shieldSprite.texture = PIXI.Texture.fromImage(shieldTexturePath)
            shieldSprite.anchor.set(0.5, 0.5)
            enemy.prefixShieldSprite = shieldSprite
            enemy.addChild(shieldSprite)
        }

	    enemy.position.x = RENDER_SIZE - 16
	    enemy.position.y = 80 + Math.floor(Math.random() * 100)
	    stage.addChild(enemy)
    }

    if (waveArray.length === 0 && stage.children.filter(isEnemy).length === 0 && hasInput) {
        wave++

        const types = ['horizontal', 'sinus', 'mini-sinus', 'fodder-hull', 'fodder-shield']

        waveArray = []

        for (var i = 1; i <= ENEMIES_PER_WAVE; i++) {
            const r = Math.random()
            waveArray.push(shuffleArray(types)[0])
        }

        //waveArray = ['horizontal']

        console.log('--- new wave ---', waveArray)
        allWaves.push([...waveArray])
        guiTexts.waveText.prefixTimer = 180

        /*
        const powerup = new PIXI.Sprite(PIXI.Texture.fromImage('assets/powerup.png'))
        powerup.prefixObject = 'powerup'
        powerup.anchor.set(0.5, 0.5)
        powerup.position.x = Math.floor(Math.random() * 200) + 100
        powerup.position.y = Math.floor(Math.random() * 100) + 100
        stage.addChild(powerup)
        */
    }

    highscore = enemyKills * 1000 - playerDeaths * 5000
    guiTexts.highscoreText.text = highscore

    if (hasInput) {
        logoContainer.visible = false
    }

    renderer.render(stage)
}


const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);




const isCollision = curry((sprite1, sprite2) => {
    const dx = sprite2.position.x - sprite1.position.x
    const dy = sprite2.position.y - sprite1.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const collisionDistance = (sprite1.width + sprite2.width) / 2
    return distance < collisionDistance
})


const createStunEffect = (followEntity) => {
    const stunEffect = new PIXI.Sprite(PIXI.Texture.fromImage('assets/stun-effect.png'))
    stunEffect.prefixObject = 'stun-effect'
    stunEffect.prefixTimer = 18
    stunEffect.anchor.set(0.5, 0.5)
    stunEffect.prefixFollowEntity = followEntity
    stunEffect.position.x = followEntity.position.x
    stunEffect.position.y = followEntity.position.y
    stage.addChild(stunEffect)
}




function tickEntities(child) {
    switch (child.prefixObject) {
        case 'pew':
            const pew = child

            pew.position.x += 2 * deltaFactor

            let pewHit = false

            stage.children.filter(isRocket).filter(isCollision(pew)).forEach(rocket => {
                pewHit = true

                if (rocket.prefixSpeed !== 0.01) {
                    createStunEffect(rocket)
                }

                rocket.prefixSpeed = 0.01
                rocket.texture = PIXI.Texture.fromImage('assets/enemy-rocket-stopped.png')
                rocket.position.x += 2 * deltaFactor

                if (pew.position.y > rocket.position.y) {
                    rocket.position.y -= 3 * deltaFactor
                } else {
                    rocket.position.y += 3 * deltaFactor
                }
            })

            stage.children
                .filter(isEnemy)
                .filter(isCollision(pew))
                .forEach(enemy => {
                    // collision pew - enemy
                    pewHit = true
                    if (enemy.prefixShield > 0) {
                        enemy.prefixShield = enemy.prefixShield - 1
                    } else {
                        enemy.position.x += 3 * deltaFactor

                        if (pew.position.y > enemy.position.y) {
                            enemy.position.y -= 5 * deltaFactor
                        } else {
                            enemy.position.y += 5 * deltaFactor
                        }
                    }
                })
            
            // collision pew - p2
            if (isCollision(pew, p2Sprite)) {
                pewHit = true
                playerDeaths++

                const ghostSprite = new PIXI.Sprite(textures.p2)
                ghostSprite.prefixObject = 'ghost'
                ghostSprite.prefixTimer = 80
                ghostSprite.anchor.set(0.5, 0.5)
                ghostSprite.position.x = p2Sprite.position.x
                ghostSprite.position.y = p2Sprite.position.y
                ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                ghostSprite.tint = 0x000000
                stage.addChild(ghostSprite)

                p2Sprite.prefixGodmode = 120
                p2Sprite.position.x = P2_START_X
                p2Sprite.position.y = P2_START_Y            
            }

            stage.children.filter(isMine).forEach(mine => {

                // collision pew - mine
                if (isCollision(pew, mine, 6)) {
                    pewHit = true
                    mine.prefixActivationType = 'shield'

                    if (mine.prefixActivationTimer === null) {
                        mine.prefixActivationTimer = 40
                    }
                }
            })

            if (pewHit || pew.position.x > RENDER_SIZE) {
                // create pewpuff
                const pewPuff = new PIXI.Sprite(PIXI.Texture.fromImage('assets/pew-puff.png'))
                pewPuff.prefixObject = 'pew-puff'
                pewPuff.prefixTimer = 5
                pewPuff.anchor.set(0.5, 0.5)
                pewPuff.position.x = pew.position.x
                pewPuff.position.y = pew.position.y
                stage.addChild(pewPuff)
        
                pew.prefixDestroy = true
                stage.removeChild(pew)
            } 

            break


        case 'p1':
        case 'p2':

            if (child.prefixGodmode >= 0) {
                child.prefixGodmode -= 1 * deltaFactor
                child.visible = Math.sin(counter * 25) > 0
            } else {
                child.visible = true    
            }

            if (child.position.y > 230) {
                child.position.y = 230
            }

            if (child.position.y < 30) {
                child.position.y = 30
            }

            if (child.position.x > 240) {
                child.position.x = 240
            }


            if (child.position.x < 15) {
                child.position.x = 15
            }

            if (child.prefixObject === 'p1') {
                if (controls.p1.left) {
                    p1Sprite.position.x -= 1 * deltaFactor
                }
                if (controls.p1.right) {
                    p1Sprite.position.x += 1 * deltaFactor
                }
                if (controls.p1.up) {
                    p1Sprite.position.y -= 1 * deltaFactor
                }
                if (controls.p1.down) {
                    p1Sprite.position.y += 1 * deltaFactor
                }
                if (controls.p1.shoot && p1cooldown <= 0) {
                    // create pew
                    const pewSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/pew.png'))
                    pewSprite.prefixObject = 'pew'
                    pewSprite.anchor.set(0.5, 0.5)
                    pewSprite.position.x = p1Sprite.position.x + 8
                    pewSprite.position.y = p1Sprite.position.y
                    stage.addChild(pewSprite)
                    p1cooldown = 8
                }

                if (p1cooldown > 0) {
                    p1cooldown -= 1 * deltaFactor
                }
            } else if (child.prefixObject === 'p2') {
                if (controls.p2.left) {
                    p2Sprite.position.x -= 1 * deltaFactor
                }
                if (controls.p2.right) {
                    p2Sprite.position.x += 1 * deltaFactor
                }
                if (controls.p2.up) {
                    p2Sprite.position.y -= 1 * deltaFactor
                }
                if (controls.p2.down) {
                    p2Sprite.position.y += 1 * deltaFactor
                }
                if (controls.p2.shoot && p2cooldown <= 0) {
                    // create mine
                    const mineSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/mine.png'))
                    mineSprite.prefixObject = 'mine'
                    mineSprite.prefixActivationTimer = null
                    mineSprite.anchor.set(0.5, 0.5)
                    mineSprite.position.x = p2Sprite.position.x + 8
                    mineSprite.position.y = p2Sprite.position.y
                    mineSprite.prefixVx = 3
                    stage.addChild(mineSprite)
                    p2cooldown = 80
                }

                if (p2cooldown > 0) {
                    p2cooldown -= 1 * deltaFactor
                }
            }
            break

        case 'stun-effect':
            const stunEffect = child
            stunEffect.prefixTimer -= 1 * deltaFactor
            stunEffect.position.x = stunEffect.prefixFollowEntity.position.x
            stunEffect.position.y = stunEffect.prefixFollowEntity.position.y

            if (stunEffect.prefixTimer <= 0) {
                stunEffect.prefixDestroy = true
                stage.removeChild(stunEffect)
            }
            break

        case 'pew-puff':
            const pewpuff = child
            pewpuff.prefixTimer -= 1 * deltaFactor

            if (pewpuff.prefixTimer <= 0) {
                pewpuff.prefixDestroy = true
                stage.removeChild(pewpuff)
            }
            break


        case 'mine':
            const mine = child
            mine.position.x += mine.prefixVx * deltaFactor
            mine.prefixVx -= 0.1 * deltaFactor
            if (mine.prefixVx < 0) {
                mine.prefixVx = 0
            }
            
            // collision mine - enemy
            stage.children.filter(isEnemy).forEach(enemy => {

                if (isCollision(mine, enemy) && mine.prefixActivationTimer === null) {
                    mine.prefixActivationTimer = 40
                    mine.prefixActivationType = 'hull'
                }           
            })

            // collision mine - player
            stage.children.filter(isPlayer).forEach(player => {

                if (isCollision(mine, player) && mine.prefixActivationTimer === null) {
                    mine.prefixActivationTimer = 40
                    mine.prefixActivationType = 'hull'
                }
            })

            // collision mine - blast
            stage.children.filter(isBlast).forEach(blast => {

                if (isCollision(mine, blast) && mine.prefixActivationTimer === null) {
                    mine.prefixActivationTimer = 60
                    mine.prefixActivationType = blast.prefixType
                }

            })

            // create blip
            if (mine.prefixActivationTimer !== null && mine.prefixBlip !== true) {
                const mineBlip = new PIXI.Sprite(PIXI.Texture.fromImage('assets/mine-blip.png'))
                mineBlip.prefixObject = 'mine-blip'
                mineBlip.prefixTimer = mine.prefixActivationTimer
                mineBlip.anchor.set(0.5, 0.5)
                mineBlip.position.x = mine.position.x
                mineBlip.position.y = mine.position.y
                stage.addChild(mineBlip)

                mine.prefixBlip = true
            }

            if (mine.prefixActivationTimer !== null) {
                mine.prefixVx = 0
                mine.texture = textures['mine-trig-' + mine.prefixActivationType]
                if (mine.prefixActivationTimer <= 0) {
                    mine.prefixDestroy = true
                    stage.removeChild(mine)

                    const texture = mine.prefixActivationType === 'shield'
                        ? PIXI.Texture.fromImage('assets/blast-shield.png')
                        : PIXI.Texture.fromImage('assets/blast-hull.png')

                    // create blast
                    const blastSprite = new PIXI.Sprite(texture)
                    blastSprite.prefixObject = 'blast'
                    blastSprite.anchor.set(0.5, 0.5)
                    blastSprite.prefixType = mine.prefixActivationType
                    blastSprite.position.x = mine.position.x
                    blastSprite.position.y = mine.position.y
                    blastSprite.prefixTimer = 30
                    stage.addChild(blastSprite)
                    
                } else {
                    mine.prefixActivationTimer -= 1 * deltaFactor
                }
            }
            break


        case 'mine-blip':
            const mineBlip = child
            mineBlip.prefixTimer -= 1 * deltaFactor

            if (mineBlip.prefixTimer % 8 < 4) {
                mineBlip.visible = true
            } else {
                mineBlip.visible = false
            }

            if (mineBlip.prefixTimer <= 0) {
                mineBlip.prefixDestroy = true
                stage.removeChild(mineBlip)
            }
            break


        case 'blast':
            const blast = child

            // collision blast - enemy
            stage.children.filter(isEnemy).forEach(enemy => {
                if (isCollision(blast, enemy)) {
                    if (blast.prefixType === 'shield') {
                        enemy.prefixShield = 0
                        createStunEffect(enemy)
                    } else if (blast.prefixType === 'hull') {
                        if (enemy.prefixShield <= 0) {
                            enemy.prefixHull = 0
                        } else {
                            const dx = enemy.position.x - blast.position.x
                            const dy = enemy.position.y - blast.position.y
                            const a = Math.atan2(dy,dx)
                            enemy.position.x += Math.cos(a) * 1 * deltaFactor
                            enemy.position.y += Math.sin(a) * 1 * deltaFactor
                        }

                    }
                }           
            })

            // collision blast - players
            stage.children.filter(isPlayer).forEach(player => {
                if (isCollision(blast, player)) {
                    playerDeaths++

                    const ghostSprite = new PIXI.Sprite(player === p1Sprite ? textures.p1 : textures.p2)
                    ghostSprite.prefixObject = 'ghost'
                    ghostSprite.prefixTimer = 80
                    ghostSprite.anchor.set(0.5, 0.5)
                    ghostSprite.position.x = player === p1Sprite ? p1Sprite.position.x : p2Sprite.position.x
                    ghostSprite.position.y = player === p1Sprite ? p1Sprite.position.y : p2Sprite.position.y
                    ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                    ghostSprite.tint = 0x000000
                    stage.addChild(ghostSprite)

                    player.position.x = player === p1Sprite ? P1_START_X : P2_START_X
                    player.position.y = player === p1Sprite ? P1_START_Y : P2_START_Y
                    player.prefixGodmode = 120
                }
            })

            blast.prefixTimer -= 1 * deltaFactor
            blast.position.x += Math.cos(counter * 800) * deltaFactor
            blast.position.y += Math.sin(counter * 800) * deltaFactor

            if (blast.prefixTimer <= 0) {
                blast.prefixDestroy = true
                stage.removeChild(blast)
            }
            break


        case 'enemy':
            const enemy = child

            if (enemy.prefixType === 'fodder-shield' && enemy.prefixShield <= 0) {
                enemy.prefixHull = 0
            }

            if (enemy.prefixHull <= 0) {
                enemyKills++

                const ghostSprite = new PIXI.Sprite()
                ghostSprite.prefixObject = 'ghost'
                ghostSprite.texture = enemy.texture
                ghostSprite.prefixTimer = 40
                ghostSprite.anchor.set(0.5, 0.5)
                ghostSprite.position.x = enemy.position.x
                ghostSprite.position.y = enemy.position.y
                ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                ghostSprite.tint = 0x000000
                stage.addChild(ghostSprite)

                enemy.prefixDestroy = true
                stage.removeChild(enemy)
            }
            if (enemy.position.x <= 0) {
                enemy.prefixDestroy = true
                stage.removeChild(enemy)
                playerDeaths++
            }

            // collision enemy - players
            stage.children.filter(isPlayer).forEach(player => {
                if (isCollision(enemy, player)) {
                    enemy.prefixDestroy = true
                    stage.removeChild(enemy)
                    playerDeaths++
                    
                    const ghostSprite = new PIXI.Sprite(player === p1Sprite ? textures.p1 : textures.p2)
                    ghostSprite.prefixObject = 'ghost'
                    ghostSprite.prefixTimer = 80
                    ghostSprite.anchor.set(0.5, 0.5)
                    ghostSprite.position.x = player === p1Sprite ? p1Sprite.position.x : p2Sprite.position.x
                    ghostSprite.position.y = player === p1Sprite ? p1Sprite.position.y : p2Sprite.position.y
                    ghostSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
                    ghostSprite.tint = 0x000000
                    stage.addChild(ghostSprite)

                    player.position.x = player === p1Sprite ? P1_START_X : P2_START_X
                    player.position.y = player === p1Sprite ? P1_START_Y : P2_START_Y
                    player.prefixGodmode = 120
                }
            })

            if (enemy.prefixShieldSprite && tick % 4 > 2) {
                enemy.prefixShieldSprite.scale.x *= -1
            }

            if (enemy.prefixShield <= 0 && enemy.prefixShieldSprite) {
                enemy.removeChild(enemy.prefixShieldSprite)
                enemy.prefixShieldSprite = null
                createStunEffect(enemy)
            }

            if (enemy.prefixRocketTimer !== null) {
                enemy.prefixRocketTimer -= 1
                if (enemy.prefixRocketTimer <= 0){
                    enemy.prefixRocketTimer = 465

                    // create enemy rocket
                    const rocketSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/enemy-rocket.png'))
                    rocketSprite.prefixObject = 'rocket'
                    rocketSprite.anchor.set(0.5, 0.5)
                    rocketSprite.position.x = enemy.position.x - 14
                    rocketSprite.position.y = enemy.position.y
                    rocketSprite.prefixDy = 1
                    rocketSprite.prefixSpeed = 0.36
                    if (rocketSprite.position.y < RENDER_SIZE / 2) {
                        rocketSprite.prefixDy = -1
                        rocketSprite.scale.y = -1
                    }
                    stage.addChild(rocketSprite)
                }
            }

            // enemy movement
            if (enemy.prefixType === 'horizontal') {
                enemy.position.x -= 0.075 * deltaFactor
            } else if (enemy.prefixType === 'sinus') {
                enemy.position.x -= 0.075 * deltaFactor
                enemy.position.y += Math.sin(counter) * 0.4 * deltaFactor
            } else if (enemy.prefixType === 'mini-sinus') {
                enemy.position.x -= 0.2 * deltaFactor
                enemy.position.y += Math.sin(counter * 10) * 0.7 * deltaFactor
            } else if (enemy.prefixType === 'fodder-hull') {
                enemy.position.x -= 0.5 * deltaFactor
            } else if (enemy.prefixType === 'fodder-shield') {
                enemy.position.x -= 0.5 * deltaFactor
            }

            if (enemy.position.y > 220) {
                enemy.position.y = 220
            }

            if (enemy.position.y < 30) {
                enemy.position.y = 30
            }

            break


        case 'ghost':
            const ghost = child
            ghost.prefixTimer -= 1 * deltaFactor

            ghost.position.x += Math.sin(counter * 100) * deltaFactor
            
            if (ghost.prefixTimer <= 0) {
                ghost.prefixDestroy = true
                stage.removeChild(ghost)
            }
            break


        case 'star':
            const star = child
            star.position.x -= 0.1 * deltaFactor

            if (star.position.x < 0) {
                star.position.x = RENDER_SIZE
            }
            break
        

        case 'powerup':
            const powerup = child
            powerup.position.y = (powerup.position.y + Math.sin(counter) / 20) * deltaFactor

            // collision powerup - player
            stage.children.filter(isPlayer).forEach(player => {
                if (isCollision(powerup, player)) {
                    powerup.prefixDestroy = true
                    stage.removeChild(powerup)

                    const companion = new PIXI.Sprite(PIXI.Texture.fromImage('assets/companion.png'))
                    companion.prefixObject = 'companion'
                    companion.prefixFollowingPlayer = player
                    companion.anchor.set(0.5, 0.5)
                    companion.position.x = player.position.x
                    companion.position.y = player.position.y
                    stage.addChild(companion)
                }    
            })
            break    


        case 'rocket':
            const rocket = child

            rocket.position.x -= rocket.prefixSpeed * deltaFactor
            rocket.position.y += rocket.prefixDy * rocket.prefixSpeed * deltaFactor

            // collision rocket
            stage.children.filter(isRocketCollisionFilter).forEach(entity => {
                if (rocket !== entity && isCollision(rocket, entity)) {
                    if (isBlast(entity) && entity.prefixType === 'shield') {
                        rocket.prefixSpeed = 0.01
                    } else {
                        const blastSprite = new PIXI.Sprite(PIXI.Texture.fromImage('assets/enemy-blast.png'))
                        blastSprite.prefixObject = 'blast'
                        blastSprite.anchor.set(0.5, 0.5)
                        blastSprite.prefixType = 'hull'
                        blastSprite.position.x = rocket.position.x
                        blastSprite.position.y = rocket.position.y
                        blastSprite.prefixTimer = 30
                        stage.addChild(blastSprite)

                        rocket.prefixDestroy = true
                        stage.removeChild(rocket)

                        if (isRocket(entity)) {
                            entity.prefixDestroy = true
                            stage.removeChild(entity)
                        }
                    }
                }
            })

            if (rocket.position.y > 220 || rocket.position.y < 30) {
                rocket.prefixDestroy = true
                stage.removeChild(rocket)
            }
            
            break   


        case 'companion':
            const companion = child
            companion.position.x += (companion.prefixFollowingPlayer.position.x - companion.position.x + 25) * 0.02 * deltaFactor
            companion.position.y += (companion.prefixFollowingPlayer.position.y - companion.position.y) * 0.02 * deltaFactor
            break
    }
}










const isEnemy = ({prefixObject}) => prefixObject === 'enemy'
const isMine = ({prefixObject}) => prefixObject === 'mine'
const isBlast = ({prefixObject}) => prefixObject === 'blast'
const isPlayer = ({prefixObject}) => prefixObject === 'p1' || prefixObject === 'p2'
const isPew = ({prefixObject}) => prefixObject === 'pew'
const isPewPuff = ({prefixObject}) => prefixObject === 'pew-puff'
const isStunEffect = ({prefixObject}) => prefixObject === 'stun-effect'
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

document.getElementById('container').appendChild(app.view)