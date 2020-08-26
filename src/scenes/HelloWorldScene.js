import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene
{
	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        //this.load.image('logo', 'images/VvLogoPng.png');
        //this.load.unityAtlas('intro', 'images/Splash.png', 'data/Splash.json');
        this.load.atlas('intro', 'images/Splash.png', 'data/Splash.json');
    }

    create()
    {
        //this.add.image(600, 400, 'intro', 'mc instance 10302');
        this.anims.create({ key: 'everything', frames: this.anims.generateFrameNames('intro'), repeat: -1 });
        this.add.sprite(600, 400, 'intro').play('everything');
    }
}
