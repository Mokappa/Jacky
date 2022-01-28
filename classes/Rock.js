import GameObject from "./GameObject.js"

class Rocks extends GameObject {
    constructor(context, x, y, width, height, CONFIG) {
        super(context, x, y, width, height, CONFIG)
    }

    init() {
        this.image = new Image()
        this.image.src = "./images/rockTexture.png"
    }

    render() {
        super.render()
        this.context.translate(this.x, this.y)
        this.context.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height)

        this.context.resetTransform()
    }

    getBoundingBox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            w: this.width,
            h: this.height
        }
    }
}   

export default Rocks  