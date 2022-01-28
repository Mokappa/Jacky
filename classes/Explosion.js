class Explosion {
    constructor(context, x, y, radius, dx, dy) {
        this.context = context
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.opacity = 1;
    }

    render() {
        this.context.save()
        this.context.globalAlpha = this.opacity

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

        this.opacity -= 0.05
        this.x += this.dx
        this.y += this.dy
    }
}

export default Explosion