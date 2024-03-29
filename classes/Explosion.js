class Explosion {
    constructor(context, x, y, radius, dx, dy, timePassedSinceLastRender) {
        this.context = context
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.opacity = 1;
        this.timePassedSinceLastRender = timePassedSinceLastRender
        this.velocity = 0.2
    }

    render() {
        this.context.save()
        
        this.context.globalAlpha = this.opacity

        // Begin to draw the particle
        this.context.beginPath()

        this.context.fillStyle = "#cccccc"
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        this.context.fill()
    
        this.context.strokeStyle = "#a09d9c"
        this.context.lineWidth = 3
        this.context.stroke()
          
        this.context.restore()
    }

    update() {
        this.render()

        this.opacity -= 0.024
        this.x += this.dx * this.timePassedSinceLastRender * this.velocity
        this.y += this.dy * this.timePassedSinceLastRender * this.velocity
    }
}

export default Explosion