import GameObject from "./GameObject.js"
import { rocksOnMap, enemies, particlesActive, checkCollisionBetween, randomNumberInt } from "../index.js"
import Rocks from "./Rock.js"
import Enemy from "./Enemy.js"
import Particles from "./Particle.js"


class Player extends GameObject {
    constructor(context, x, y, width, height, CONFIG) {
        super(context, x, y, width, height, CONFIG)
        this.dx = 0
        this.dy = 0
        this.lastDirectionX = 1
        this.currentKeys = []
        this.velocity = 0.4
        this.LeftRightBoundaries = true
        this.TopBotBoundaries = true
        
        this.canShoot = true
        
        this.state = 'idle'
        this.previousPerformance = 0
        this.frameX = 0;

        this.ifTheGameJustStarted = true
        
        this.direction = 0
        
        // First initialize everything for the Start Background
        this.everythingClosed = true
        this.whereIsPlayer = 'StartScene'
        this.scene = 'StartScene'
        this.whichMapToGenerate('StartScene')
        this.whereComeFrom = 'start'
    }

    init() {
        // Prevent moving the web page with Arrows and Space
        document.addEventListener('keydown', (event) => {
            this.currentKeys[event.code] = true

            if(event.code.startsWith("Arrow") || event.code === 'Space') {
                event.preventDefault()
            }
        })

        document.addEventListener('keyup', (event) => {
            this.currentKeys[event.code] = false
        })

        // Sprites
        this.sprites = {
            idle: {
                src: './images/idlePlayer.png',
                frames: 6,
                fps: 6,
                image: null,
                frameSize: {
                    width: 220,
                    height: 300
                }
            },

            run: {
                src: './images/runPlayer.png',
                frames: 6,
                fps: 10,
                image: null,
                frameSize: {
                    width: 220,
                    height: 300
                }
            },
            
            dead: {
                src: './images/deathPlayer.png',
                frames: 17,
                fps: 10,
                image: null,
                frameSize: {
                    width: 220,
                    height: 300
                }
            }
        }

        Object.values(this.sprites).forEach(sprite => {
            sprite.image = new Image()
            sprite.image.src = sprite.src
        })
    }

    update(timePassedSinceLastRender) {
        const oldPos = {
            x: this.x,
            y: this.y
        }

        // Move Right or Left on arrow press
        if(this.currentKeys['ArrowRight']) {
            this.dx = 1
        }
        else if(this.currentKeys['ArrowLeft']) {
            this.dx = -1
        }
        else {
            this.dx = 0
        }

        // Direction for the Particle
        if(this.currentKeys['ArrowRight']) {
            this.direction = 1
        }
        else if(this.currentKeys['ArrowLeft']) {
            this.direction = -1
        }
        else if(this.currentKeys['ArrowUp']) {
            this.direction = 2
        }
        else if(this.currentKeys['ArrowDown']) {
            this.direction = -2
        }

        // Create Projectile if Player shoots
        document.addEventListener('keydown', () => {
            if(this.currentKeys['KeyX'] && this.canShoot && this.state !== 'dead') {
                let newParticle = new Particles(this.context, this.x + this.width / 2.5, this.y, 20, 20, this.CONFIG, this.direction)
                
                particlesActive.push(newParticle)
                
                this.canShoot = false
                
                setTimeout(() => {
                    this.canShoot = true
                }, 350)
            }
        })

        // Move up or down on arrow press
        if(this.currentKeys['ArrowDown']) {
            this.dy = 1
        }
        else if(this.currentKeys['ArrowUp']) {
            this.dy = -1
        }
        else {
            this.dy = 0
        }

        // Store the last direction we moved in
        if(this.dx !== 0) {
            this.lastDirectionX = this.dx
        }

        // Define current state for the spritesheet
        if(this.dx !== 0 || this.dy !== 0) {
            this.state = 'run'
        }
        else {
            this.state = 'idle'
        }

        // Account for diagonal movement
        if(this.dy != 0 && this.dx != 0) {
            this.dx /= Math.hypot(this.dx, this.dy)
            this.dy /= Math.hypot(this.dx, this.dy)
        }

        // Calculate new positions (x and y)
        this.x += timePassedSinceLastRender * this.dx * this.velocity
        this.y += timePassedSinceLastRender * this.dy * this.velocity
        
        // Right and Left Wall Collision
        if(this.LeftRightBoundaries) {
            if(this.x + this.width / 2 + 40 > this.CONFIG.width) {
                this.x = this.CONFIG.width - this.width / 2 - 40
            }
            else if(this.x + this.width / 2 - 40 < this.width) {
                this.x = 0 + this.width / 2 + 40
            }
        }

        // Top and Bottom Wall Collision
        if(this.TopBotBoundaries) {
            if(this.y + this.height / 2 + 70 > this.CONFIG.height) {
                this.y = this.CONFIG.height - this.height / 2 - 70
            }
            else if(this.y + this.height / 2 + 20 < this.height) {
                this.y = 0 + this.height / 2 - 20
            }
        }

        // Check Collision with each Rock
        rocksOnMap.forEach((eachRock) => {
            if(checkCollisionBetween(this, eachRock)) {
                this.x = oldPos.x
                this.y = oldPos.y
            }
        })
        

        // Check for the doors
        // Start Background
        this.whichBackgroundToGenerate(this.whereIsPlayer)

        if(enemies.length === 0) {
            this.everythingClosed = false

            if(this.scene === 'StartScene') {
                this.whereComeFrom = 'start'

                if(this.x + this.width / 2 > this.CONFIG.width / 2 && this.x + this.width / 2 < this.CONFIG.width / 2 + 50 && this.y > this.CONFIG.height / 2) {
                    if(this.y > this.CONFIG.height - this.height - 30) {
                        this.TopBotBoundaries = false
                    }

                    if(this.y + this.height > this.CONFIG.height) {
                        this.x = this.CONFIG.width / 2
                        this.y = this.height

                        this.whereIsPlayer = 'MiddleScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else {
                    this.TopBotBoundaries = true
                }
            }
            else if(this.scene === 'MiddleScene') {
                this.whereComeFrom = 'middle'

                if(this.x + this.width / 2 > this.CONFIG.width / 2 && this.x + this.width / 2 < this.CONFIG.width / 2 + 50 && this.y < this.CONFIG.height / 2) {
                    if(this.y < this.height / 2) {
                        this.TopBotBoundaries = false
                    }

                    if(this.y + this.height < this.height) {
                        this.x = this.CONFIG.width / 2
                        this.y = this.CONFIG.height - 150

                        this.whereIsPlayer = 'StartScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else {
                    this.TopBotBoundaries = true
                }
                
                if(this.y + this.height / 2 > this.CONFIG.height / 2 - 20 && this.y + this.height / 2 < this.CONFIG.height / 2 + 30 && this.x < this.CONFIG.width / 2) {
                    if(this.x < this.width + 25) {
                        this.LeftRightBoundaries = false
                    }

                    if(this.x + this.width < this.width) {
                        this.x = this.CONFIG.width - 150
                        this.y = this.CONFIG.height / 2 - 50

                        this.whereIsPlayer = 'LeftScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else if(this.y + this.height / 2 > this.CONFIG.height / 2 - 20 && this.y + this.height / 2 < this.CONFIG.height / 2 + 30 && this.x > this.CONFIG.width / 2) {
                    if(this.x > this.CONFIG.width - this.width - 25) {
                        this.LeftRightBoundaries = false
                    }

                    if(this.x + this.width > this.CONFIG.width) {
                        this.x = this.width + 50
                        this.y = this.CONFIG.height / 2 - 50

                        this.whereIsPlayer = 'RightScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else {
                    this.LeftRightBoundaries = true
                }
            }
            else if(this.scene === 'LeftScene') {
                this.whereComeFrom = 'left'
                
                if(this.y + this.height / 2 > this.CONFIG.height / 2 - 20 && this.y + this.height / 2 < this.CONFIG.height / 2 + 30 && this.x > this.CONFIG.width / 2) {
                    if(this.x > this.CONFIG.width - this.width - 25) {
                        this.LeftRightBoundaries = false
                    }

                    if(this.x + this.width > this.CONFIG.width) {
                        this.x = this.width + 50
                        this.y = this.CONFIG.height / 2 - 50

                        this.whereIsPlayer = 'MiddleScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else {
                    this.LeftRightBoundaries = true
                }
            }
            else if(this.scene === 'RightScene') {
                this.whereComeFrom = 'right'

                if(this.y + this.height / 2 > this.CONFIG.height / 2 - 20 && this.y + this.height / 2 < this.CONFIG.height / 2 + 30 && this.x < this.CONFIG.width / 2) {
                    if(this.x < this.width + 25) {
                        this.LeftRightBoundaries = false
                    }
        
                    if(this.x + this.width < this.width) {
                        this.x = this.CONFIG.width - 150
                        this.y = this.CONFIG.height / 2 - 50

                        this.whereIsPlayer = 'MiddleScene'

                        this.whichMapToGenerate(this.whereIsPlayer)
                    }
                }
                else {
                    this.LeftRightBoundaries = true
                }
            }
        }
        else {
            this.everythingClosed = true
            this.TopBotBoundaries = true
            this.LeftRightBoundaries = true
        }
    }
    

    // Render the Player
    render() {
        let coords = this.getImageSpriteCoordinates(this.sprites[this.state])
        
        // Render the bounding box
        super.render()
        
        this.context.translate(this.x, this.y)

        // Flip the image if we're moving to the left
        this.context.scale(this.lastDirectionX, 1)

        this.context.drawImage(
            this.sprites[this.state].image,
            coords.sourceX,
            coords.sourceY,
            coords.sourceWidth,
            coords.sourceHeight,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        )
        
        this.context.resetTransform()
    }


    // Bounding Box Coordinates
    getBoundingBox() {
        // Get bounding box from super class (GameObject)
        let bb = super.getBoundingBox()
        
        // Adjust Bounding Box
        bb.x = bb.x + this.width * 0.1
        bb.y = bb.y + this.height * 0.1
        bb.w = bb.w * 0.8
        bb.h = bb.h * 0.85
        
        return bb
    }


    // Coords for the sprite sheet
    getImageSpriteCoordinates(sprite) {
        if(this.state === 'dead' && this.previousPerformance === 0) {
            this.previousPerformance = performance.now()
        }

        if(this.previousPerformance && this.frameX === sprite.frames - 1) {
            this.frameX = sprite.frames - 1
        }
        else {
            this.frameX = Math.floor((performance.now() - this.previousPerformance) / 1000 * sprite.fps % sprite.frames)
        }
        
        let coords = {
            sourceX: this.frameX * sprite.frameSize.width,
            sourceY: 0,
            sourceWidth: sprite.frameSize.width,
            sourceHeight: sprite.frameSize.height
        }

        return coords
    }


    // Which Map to generate
    whichMapToGenerate(whichScene) {
        if(whichScene === 'StartScene') {
            this.whichPartMapToColor(0)
            
            // Removing every element on the map in order to render new ones
            rocksOnMap.splice(0, rocksOnMap.length)
            enemies.splice(0, enemies.length)
            particlesActive.splice(0, particlesActive.length)
            
            let newRock = new Rocks(this.context, 225, 150, 75, 75, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 700, 200, 100, 100, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 250, 420, 175, 175, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 1100, 520, 90, 90, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 1200, 200, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            if(!this.ifTheGameJustStarted) {
                // Enemies spawning from Left
                for(let i = 0; i < randomNumberInt(1, 3); ++ i) {
                    let newEnemy = new Enemy(this.context, randomNumberInt(50, this.CONFIG.width / 2 - 250), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                    enemies.push(newEnemy)
                }
                
                // Enemies spawning from Right
                for(let i = 0; i < randomNumberInt(1, 3); ++ i) {
                    let newEnemy = new Enemy(this.context, randomNumberInt(this.CONFIG.width / 2 + 250, this.CONFIG.width - 50), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                    enemies.push(newEnemy)
                }
            }
        }
        else if(whichScene === 'MiddleScene') {
            this.ifTheGameJustStarted = false

            this.whichPartMapToColor(2)

            // Removing every element on the map in order to render new ones
            rocksOnMap.splice(0, rocksOnMap.length)
            enemies.splice(0, enemies.length)
            particlesActive.splice(0, particlesActive.length)
            
            let newRock = new Rocks(this.context, 300, 200, 200, 200, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 250, 520, 125, 125, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 700, 575, 125, 150, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 1100, 550, 90, 90, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 1100, 125, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1150, 125, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1200, 125, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1200, 175, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1200, 225, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            if(this.whereComeFrom === 'left') {
                // Enemies spawning from Right
                for(let i = 0; i < randomNumberInt(4, 10); ++ i) {
                    let newEnemy = new Enemy(this.context, randomNumberInt(this.CONFIG.width / 2 + 250, this.CONFIG.width - 50), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                    enemies.push(newEnemy)
                }
            }
            else if(this.whereComeFrom === 'right') {       
                // Enemies spawning from Left
                for(let i = 0; i < randomNumberInt(4, 10); ++ i) {
                    let newEnemy = new Enemy(this.context, randomNumberInt(50, this.CONFIG.width / 2 - 250), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                    enemies.push(newEnemy)
                }
            }
            else if(this.whereComeFrom === 'start') {
                // Enemies spawning from Bottom
                for(let i = 0; i < randomNumberInt(4, 10); ++ i) {
                    let newEnemy = new Enemy(this.context, randomNumberInt(50, this.CONFIG.width - 50), randomNumberInt(this.CONFIG.height / 2 + 100, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                    enemies.push(newEnemy)
                }
            }
        }
        else if(whichScene === 'LeftScene') {
            this.whichPartMapToColor(1)

            // Removing every element on the map in order to render new ones
            rocksOnMap.splice(0, rocksOnMap.length)
            enemies.splice(0, enemies.length)
            particlesActive.splice(0, particlesActive.length)
            
            let newRock = new Rocks(this.context, this.CONFIG.width / 2, 95, 75, 75, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, this.CONFIG.width / 2, 185, 100, 100, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, this.CONFIG.width / 2, 520, 100, 100, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, this.CONFIG.width / 2, 610, 75, 75, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1200, 170, 100, 100, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1000, 525, 70, 70, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 200, 200, 95, 95, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 450, 475, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            // Enemies spawning from Left
            for(let i = 0; i < randomNumberInt(4, 12); ++ i) {
                let newEnemy = new Enemy(this.context, randomNumberInt(50, this.CONFIG.width / 2 - 250), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                enemies.push(newEnemy)
            }
        }
        else if(whichScene === 'RightScene') {
            this.whichPartMapToColor(3)

            // Removing every element on the map in order to render new ones
            rocksOnMap.splice(0, rocksOnMap.length)
            enemies.splice(0, enemies.length)
            particlesActive.splice(0, particlesActive.length)
            
            let newRock = new Rocks(this.context, 525, this.CONFIG.height / 2 - 150, 75, 75, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 610, this.CONFIG.height / 2 - 170, 90, 90, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 685, this.CONFIG.height / 2 - 170, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 770, this.CONFIG.height / 2 - 140, 125, 125, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 820, this.CONFIG.height / 2 - 60, 60, 60, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 800, this.CONFIG.height / 2 + 25, 110, 110, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 730, this.CONFIG.height / 2 + 100, 80, 80, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 650, this.CONFIG.height / 2 + 100, 60, 60, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 565, this.CONFIG.height / 2 + 70, 100, 100, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 485, this.CONFIG.height / 2 + 50, 50, 50, this.CONFIG)
            rocksOnMap.push(newRock)

            newRock = new Rocks(this.context, 1200, 200, 150, 120, this.CONFIG)
            rocksOnMap.push(newRock)
            
            newRock = new Rocks(this.context, 1100, 600, 70, 100, this.CONFIG)
            rocksOnMap.push(newRock)

            // Enemies spawning from Right
            for(let i = 0; i < randomNumberInt(4, 12); ++ i) {
                let newEnemy = new Enemy(this.context, randomNumberInt(this.CONFIG.width / 2 + 250, this.CONFIG.width - 50), randomNumberInt(50, this.CONFIG.height - 50), 110, 140, this.CONFIG, false)
                enemies.push(newEnemy)
            }
        }

        this.scene = whichScene
    }

    // Which Background to render
    whichBackgroundToGenerate(wherePlace) {
        if(!this.everythingClosed) {
            if(wherePlace=== 'StartScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgStart.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'MiddleScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgMiddle.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'LeftScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgLeft.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'RightScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgRight.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
        }
        else {
            if(wherePlace === 'StartScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgStartClose.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'MiddleScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgMiddleClose.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'LeftScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgLeftClose.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
            else if(wherePlace === 'RightScene') {
                document.querySelector('#canvasScene').style.background = `url('./images/bgRightClose.png')`
                document.querySelector('#canvasScene').style.backgroundRepeat = 'no-repeat'
                document.querySelector('#canvasScene').style.backgroundSize = '100% 100%'
            }
        }
    }

    // Which part of the Minimap to color
    whichPartMapToColor(specificPart) {
        let mapArray = ['#mapDivsTop', '#mapDivsLeft', '#mapDivsMid', '#mapDivsRight']

        for(let i = 0; i < mapArray.length; ++ i) {
            if(i === specificPart) {
                document.querySelector(mapArray[i]).style.background = 'rgb(212, 212, 212)'
            }
            else {
                document.querySelector(mapArray[i]).style.background = 'rgb(71, 71, 71)'
            }
        }
    }
}   

export default Player   