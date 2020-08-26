import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 800,
	scene: [HelloWorldScene],
	scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
	render: {
		//pixelArt: true
		antialias:true
	}
}

export default new Phaser.Game(config)
