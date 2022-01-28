import GameObject from "./GameObject.js"
import { player } from "../index.js"


class Enemy extends GameObject {
    constructor(context, x, y, width, height, CONFIG, ifDead) {
        super(context, x, y, width, height, CONFIG)
        this.dx = 0
        this.dy = 0
        this.state = 'walk'
        this.lastDirectionX = 1
        this.velocity = 2
        this.lives = 2
        this.opacity = 1
        this.ifDead = ifDead
    }

    init() {
        // Sprites
        this.sprites = {
            walk: {
                src: './images/walkEnemy.png',
                frames: 5,
                fps: 6,
                image: null,
                frameSize: {
                    width: 220,
                    height: 300
                }
            },

            attack: {
                src: './images/attackEnemy.png',
                frames: 4,
                fps: 4,
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
        if(!this.ifDead && player.state !== 'dead') {
            this.dx = player.x - this.x
            this.dy = player.y - this.y

            if(this.dx < 0) {
                this.lastDirectionX = -1
            }
            else {
                this.lastDirectionX = 1
            }

            this.distance = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
            
            // Calculating the cos and sin for the angle to determine where to go
            this.speedX = this.velocity * (this.dx / this.distance)
            this.speedY = this.velocity * (this.dy / this.distance)
        
            this.x += this.speedX
            this.y += this.speedY
        }
        else if(this.ifDead) {
            this.opacity -= 0.03
        }
    }

    render() {
        super.render()
        
        this.context.save()
        
        this.context.globalAlpha = this.opacity
        this.context.translate(this.x, this.y)

        // Flip the image if we're moving to the left
        this.context.scale(this.lastDirectionX, 1)

        let coords = this.getImageSpriteCoordinates(this.sprites[this.state])

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
        
        this.context.restore()
    }

    getBoundingBox() {
        // Get bounding box from super class (GameObject)
        let bb = super.getBoundingBox()
        
        // Adjust bounding box
        bb.x = bb.x + this.width * 0.35
        bb.y = bb.y + this.height * 0.15
        bb.w = bb.w * 0.3
        bb.h = bb.h * 0.6
        
        return bb
    }

    getImageSpriteCoordinates(sprite) {
        // Calculating the current sprite position
        let frameX = Math.floor(performance.now() / 1000 * sprite.fps % sprite.frames)

        let coords = {
            sourceX: frameX * sprite.frameSize.width,
            sourceY: 0,
            sourceWidth: sprite.frameSize.width,
            sourceHeight: sprite.frameSize.height
        }

        return coords
    }
}   

export default Enemy