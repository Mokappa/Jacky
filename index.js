import Player from './classes/Player.js'
import Explosion from './classes/Explosion.js'


// Global Variables
let context
let lastTickTimestamp = 0
let player
let enemies = []
let rocksOnMap = []
let particlesActive = []
let particles = []
let scoreAppear = 0
let totalScore = 0
let stopMoving = false
let gameNotStarted = true
let whichScreen = 'start'
let gameEnded = false

const CONFIG = {
    width: 1400,
    height: 700,
    debug: false
}


// Initializing the Game
// Wait for the windows 'load' event before initializing
window.addEventListener('load', function (e) {
    let canvas = document.getElementById('canvasScene')
    context = canvas.getContext('2d')

    canvas.setAttribute('width', CONFIG.width)
    canvas.setAttribute('height', CONFIG.height)

    player = new Player(context, CONFIG.width / 2, CONFIG.height / 2, 70, 100, CONFIG)
    
    lastTickTimestamp = performance.now()
})


// Starting the Game on pressing Key X
window.addEventListener('keydown', function (e) {
    if(whichScreen === "start") {
        if(e.code === 'KeyX' && gameNotStarted) {
            gameNotStarted = false

            document.querySelector('.startMenu').style.opacity = '0'
            document.querySelector('.blackBackground').style.display = 'block'

            setTimeout(function () {
                document.querySelector('.blackBackground').style.opacity = '1'
            }, 100)

            setTimeout(function () {
                document.querySelector('.blackBackground').style.opacity = '0'
            }, 400)

            setTimeout(function () {
                document.querySelector('.startMenu').style.display = 'none'
                document.querySelector('#canvasScene').style.display = 'block'
                document.querySelector('.gameInformations').style.display = 'flex'
                
                requestAnimationFrame(gameLoop)
            }, 410)
            
            setTimeout(function () {
                document.querySelector('.blackBackground').style.display = 'none'
            }, 500)
        }
    }
    else if(whichScreen === "restart") {
        location.reload();
    }
})


// The Game Loop
function gameLoop() {
    let timePassedSinceLastRender = performance.now() - lastTickTimestamp

    update(timePassedSinceLastRender)
    render()
    explode()

    lastTickTimestamp = performance.now()

    requestAnimationFrame(gameLoop)
}


// Updating the position + collectibles
function update(timePassedSinceLastRender) {
    // If the game isn't ended, then update
    if(!gameEnded) {
        // Checking if you have enough score to win
        if(totalScore > 9999) {
            gameEnded = true

            document.querySelector('.winMenu').style.display = 'block'

            setTimeout(function () {
                document.querySelector('.winMenu').style.opacity = '1'

                whichScreen = 'restart'
                gameNotStarted = true
            }, 500)

            setTimeout(function () {
                document.querySelector('#canvasScene').style.display = 'none'
                document.querySelector('.gameInformations').style.display = 'none'
            }, 750)
        }

        if(!stopMoving) {
            player.update(timePassedSinceLastRender)
        }

        enemies.forEach(function (everyEnemy, positionOfEnemy) {
            everyEnemy.update(timePassedSinceLastRender)

            if(everyEnemy.opacity <= 0) {
                enemies.splice(positionOfEnemy, 1)
            }
            else if(checkCollisionBetween(player, everyEnemy) && !(everyEnemy.ifDead)) {
                everyEnemy.state = 'attack'

                stopMoving = true

                player.state = 'dead'

                document.querySelector('#heartSVG').style.opacity = '0'

                document.querySelector('.loseMenu').style.display = 'block'

                setTimeout(function () {
                    gameEnded = true
                    document.querySelector('.loseMenu').style.opacity = '1'
    
                    whichScreen = 'restart'
                    gameNotStarted = true
                }, 2200)
    
                setTimeout(function () {
                    document.querySelector('#canvasScene').style.display = 'none'
                    document.querySelector('.gameInformations').style.display = 'none'
                }, 2450)
            }
            else if(!checkCollisionBetween(player, everyEnemy) && !(everyEnemy.ifDead)) {
                everyEnemy.state = 'walk'
            }

        })

        particlesActive.forEach(function (everyParticle, positionOfParticle) {
            // Left and Right Wall Collision
            if(everyParticle.x + everyParticle.width + 50 > CONFIG.width || everyParticle.x + everyParticle.width / 2 - 40 < everyParticle.width) {
                particlesActive.splice(positionOfParticle, 1)

                creatingExplosion(everyParticle.x, everyParticle.y, timePassedSinceLastRender)
            }
            // Bottom and Top Wall Collision
            else if(everyParticle.y + everyParticle.height + 30 > CONFIG.height || everyParticle.y + everyParticle.height < 50) {
                particlesActive.splice(positionOfParticle, 1)

                creatingExplosion(everyParticle.x, everyParticle.y, timePassedSinceLastRender)
            }
            // If there is no collision, then disappear
            else if(everyParticle.y - everyParticle.whereShadow + 5 > 0) {
                particlesActive.splice(positionOfParticle, 1)
            }

            // Collision with the rocks
            rocksOnMap.forEach(function (everyRock) {
                if(checkCollisionBetween(everyParticle, everyRock)) {
                    particlesActive.splice(positionOfParticle, 1)
                    
                    creatingExplosion(everyParticle.x, everyParticle.y, timePassedSinceLastRender)
                }
            })
            
            // Collision with the enemies
            enemies.forEach(function (everyEnemy) {
                if(checkCollisionBetween(everyParticle, everyEnemy) && !(everyEnemy.ifDead)) {
                    particlesActive.splice(positionOfParticle, 1)
                    
                    creatingExplosion(everyParticle.x, everyParticle.y, timePassedSinceLastRender)
                    
                    if(everyEnemy.lives <= 1) {
                        everyEnemy.ifDead = true
                        everyEnemy.renderStateInitialState = true
                        
                        scoreAppear = randomNumberInt(50, 150)
                        totalScore += scoreAppear
                        
                        document.querySelector('#ScoreAppear').style.opacity = '1'
                        document.querySelector('#ScoreAppear').innerHTML = `+${scoreAppear}`
                        document.querySelector('#ScorePoint').innerHTML = `${totalScore}`
                        
                        setTimeout(function () {
                            document.querySelector('#ScoreAppear').style.opacity = '0'
                        }, 250)
                    }
                    else {
                        -- everyEnemy.lives
                    }
                    
                }
            })
            
            everyParticle.update(timePassedSinceLastRender)
        })
    }
}


// Rendering the objects
function render() {
    context.clearRect(0, 0, CONFIG.width, CONFIG.height)
    
    particlesActive.forEach(function (everyParticle) {
        everyParticle.render()
    })

    player.render()

    rocksOnMap.forEach(function (everyRock) {
        everyRock.render()
    })
    
    enemies.forEach(function (everyEnemy) {
        everyEnemy.render()
    })   
}


// Check collision
function checkCollisionBetween(gameObjectA, gameObjectB) {
    let bbA = gameObjectA.getBoundingBox()
    let bbB = gameObjectB.getBoundingBox()

    if(
        bbA.x < bbB.x + bbB.w &&
        bbA.x + bbA.w > bbB.x &&
        bbA.y < bbB.y + bbB.h &&
        bbA.y + bbA.h > bbB.y
    ) {
        return true
    }
    else {
        return false
    }
}


// Creating the explosion
function creatingExplosion(whereX, whereY, timePassedSinceLastRender) {
    for(let i = 0; i < 20; ++ i) {
        let dx = (Math.random() - 0.5) * (Math.random() * 6)
        let dy = (Math.random() - 0.5) * (Math.random() * 6)
        let radius = Math.random() * 5
        let particle = new Explosion(context, whereX, whereY, radius, dx, dy, timePassedSinceLastRender)
          
        particles.push(particle)
    }

    explode()
}


// Remove particles after fade out
function explode() {
    particles.forEach((particle, i) => {
        if(particle.opacity <= 0) {
            particles.splice(i, 1)
        } 
        else {
            particle.update()
        }
    })
}


// Random Number Generator
function randomNumberInt(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1) + minimum)
}


export { player, rocksOnMap, enemies, particlesActive, checkCollisionBetween, randomNumberInt }