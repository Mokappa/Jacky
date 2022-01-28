import GameObject from "./GameObject.js"


class Particles extends GameObject {
    constructor(context, x, y, width, height, CONFIG, direction) {
        super(context, x, y, width, height, CONFIG)
        this.xSpeed = 10
        this.ySpeed = 2
        this.acceleration = 9.81/10

        if(direction === 0) {
            this.direction = 1
        }
        else {
            this.direction = direction
        }

        // Setting the speed in relation to the direction
        if(this.direction === 1 || this.direction === -1) {
            this.ySpeed = 2
        }
        else if(this.direction === 2 || this.direction === -2) {
            this.ySpeed = 8
        }

        // Positioning the Particle when you shoot
        if(this.direction === -1) {
            this.x -= this.width * 3.5
        }
        else if(this.direction === 2) {
            this.y -= this.height * 2
            this.x -= this.width * 2
        }
        else if(this.direction === -2) {
            this.y += this.height
            this.x -= this.width * 2
        }

        this.initialY = this.y
        this.initialX = this.x

        this.distanceBetweenParticleAndShadowXAxis = this.y + 35

        this.shadowYSpeed = this.ySpeed

        this.particleIsFast = false
    }
    
    init() {

    }

    update() {
        if(this.direction === 2) {
            this.y = this.y - this.ySpeed

            this.distanceBetweenParticleAndShadowYAxis = this.distanceBetweenParticleAndShadowYAxis - this.shadowYSpeed

            if(Math.abs(this.initialY - this.y) > 170) {
                this.particleIsFast = true
                
                this.shadowYSpeed = this.shadowYSpeed + this.acceleration
            }
        }
        else if(this.direction === -2) {
            this.y = this.y + this.ySpeed

            if(Math.abs(this.initialY - this.y) > 220) {
                this.particleIsFast = true
                
                this.ySpeed = this.ySpeed + this.acceleration
            }
        }
        else if(this.direction === 1) {
            this.x = this.x + this.xSpeed

            if(Math.abs(this.initialX - this.x) > 220) {
                this.xSpeed = 4
                
                this.y = this.y + this.ySpeed
                this.ySpeed = this.ySpeed + this.acceleration
            }
        }
        else if(this.direction === -1) {
            this.x = this.x - this.xSpeed

            if(Math.abs(this.initialX - this.x) > 220) {
                this.xSpeed = 4
            
                this.y = this.y + this.ySpeed
                this.ySpeed = this.ySpeed + this.acceleration
            }
        }
    }

    render() {
        super.render()

        if(!this.particleIsFast) {
            this.distanceBetweenParticleAndShadowYAxis = this.y + 30
        }

        if((this.direction === -1 || this.direction === 1)) {
            this.whereShadow = this.distanceBetweenParticleAndShadowXAxis
        }
        else if(this.direction === -2 || this.direction === 2) {
            this.whereShadow = this.distanceBetweenParticleAndShadowYAxis
        }
        
        // Rendering the Shadow of the Particle
        this.context.translate(this.x, this.whereShadow)

        this.context.save()

        this.context.globalAlpha = 0.3
        
        // Draw the Shadow
        this.context.beginPath()

        this.context.fillStyle = "#000000"
        this.context.ellipse(10, 10, 8, 5, 0, 0, 2 * Math.PI)
        this.context.fill()

        this.context.closePath()

        this.context.restore()

        this.context.resetTransform()

        // Rendering the Particle
        this.context.translate(this.x, this.y)
        
        this.context.beginPath()

        // Draw the Particle
        this.context.fillStyle = "#cccccc"
        this.context.arc(10, 10, 8, 0, 2 * Math.PI)
        this.context.fill()
        
        this.context.strokeStyle = "#a09d9c"
        this.context.lineWidth = 3
        this.context.stroke()

        this.context.closePath()
        
        this.context.resetTransform()
    }

    getBoundingBox() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        }
    }
}   

export default Particles