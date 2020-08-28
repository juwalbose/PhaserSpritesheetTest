import Phaser from 'phaser'
import SpriteData from '../items/SpriteData';
import SymbolData from '../items/SymbolData';
import KeyFrame from '../items/KeyFrame';

export default class HelloWorldScene extends Phaser.Scene
{
	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.json('anim_data', 'data/Animation.json');
        this.load.image('char_img', 'images/spritemap1.png');
        this.load.json('sprite_data', 'data/spritemap1.json');
        
        //this.load.image('logo', 'images/VvLogoPng.png');
        //this.load.unityAtlas('intro', 'images/Splash.png', 'data/Splash.json');
        //this.load.atlas('intro', 'images/Splash.png', 'data/Splash.json');//working
    }

    create()
    {
        this.cameras.main.setBackgroundColor('#555555')
        
        /*//working
        this.anims.create({ key: 'everything', frames: this.anims.generateFrameNames('intro'), repeat: -1 });
        this.add.sprite(600, 400, 'intro').play('everything');
        */

       this.rt = this.add.renderTexture(0, 0, 1200, 800);
       this.currentFrame=0;
       this.elapsedTime=0;
       this.renderDelay=30;

       //parse the name of all the texture frames in the texture atlas
       this.spriteNames=[];

       let jsonData=this.cache.json.get('sprite_data');
       let sprites=[];
       sprites=jsonData.ATLAS.SPRITES;
       let texture=this.textures.get("char_img");
       for (let index = 0; index < sprites.length; index++) {
           const element = sprites[index].SPRITE;
           this.spriteNames.push(element.name);
           texture.add(element.name, 0, element.x, element.y, element.w, element.h);
       }
       //this.add.sprite(400, 300, 'char_img',"0010"); 
       
       //parse all the symbols in this whole animation. 
       let animData=this.cache.json.get('anim_data');
       console.log("Frame rate :"+animData.metadata.framerate);
       let symbols=[];
       symbols=animData.SYMBOL_DICTIONARY.Symbols;

       this.symbolMap=new Map();

       for (let index = 0; index < symbols.length; index++) {
           const element = symbols[index];
           
           if(element.TIMELINE.LAYERS.length>1){
               console.error("Multiple layers for "+element.SYMBOL_name);
           }else{
               if(element.TIMELINE.LAYERS[0].Frames.length>1){
                   console.error("Multiple frames for "+element.SYMBOL_name+" layer "+element.TIMELINE.LAYERS[0].Layer_name);
                }else{
                    let frame =element.TIMELINE.LAYERS[0].Frames[0];
                    if(frame.index!==0){
                        console.error("Different frame index than 0 for "+element.SYMBOL_name+" layer "+element.TIMELINE.LAYERS[0].Layer_name);
                    }
                    if(frame.duration!==1){
                        console.error("Different frame duration for "+element.SYMBOL_name+" layer "+element.TIMELINE.LAYERS[0].Layer_name);
                    }
                    let symbolLayers=[];
                    for (let innerIndex = 0; innerIndex< frame.elements.length; innerIndex++) {
                            const innerElement = frame.elements[innerIndex];
                            if(innerElement.ATLAS_SPRITE_instance!==undefined){
                                //console.log("Is Sprite "+innerElement.ATLAS_SPRITE_instance.name);
                                symbolLayers.push(new SpriteData(innerElement.ATLAS_SPRITE_instance.name,
                                    innerElement.ATLAS_SPRITE_instance.DecomposedMatrix.Position,innerElement.ATLAS_SPRITE_instance.DecomposedMatrix.Rotation,
                                    innerElement.ATLAS_SPRITE_instance.DecomposedMatrix.Scaling,innerElement.ATLAS_SPRITE_instance.Matrix3D));
                            }else if(innerElement.SYMBOL_Instance!==undefined){
                            
                                let item=innerElement.SYMBOL_Instance;
                                //console.log("Is Symbol "+item.SYMBOL_name);
                                if(Object.keys(item).length>7||Object.keys(item).length<7){
                                    console.error("Symbol has irregula parameters for "+element.SYMBOL_name+" layer "+element.TIMELINE.LAYERS[0].Layer_name);
                                }
                                symbolLayers.push(new SymbolData(item.SYMBOL_name,item.DecomposedMatrix.Position,item.DecomposedMatrix.Rotation,
                                    item.DecomposedMatrix.Scaling,item.Matrix3D,item.transformationPoint,item.color));

                            }else{
                                console.error("Inner element not Sprite or Symbol for "+element.SYMBOL_name+" layer "+element.TIMELINE.LAYERS[0].Layer_name);
                            }
                    }
                    this.symbolMap.set(element.SYMBOL_name,symbolLayers);  
                }
           }
       }

       //parse the animation frames
       this.keyFrameLayers=[];
       let animLayers=animData.ANIMATION.TIMELINE.LAYERS;
       for (let index = 0; index < animLayers.length; index++) {
           const element = animLayers[index];
           let frames=element.Frames;
           let keyFrameLayer=[];
           for (let innerIndex = 0; innerIndex < frames.length; innerIndex++) {
               const innerElement = frames[innerIndex];
               if(innerElement.elements.length!==0){
                   let items=[];
                   for (let id = 0; id < innerElement.elements.length; id++) {
                       const frame = innerElement.elements[id];
                       if(frame.SYMBOL_Instance===undefined){
                           console.error("Animation Symbol Instance undefined for "+element.Layer_name);
                       }else{

                            let item=frame.SYMBOL_Instance;
                            items.push(new SymbolData(item.SYMBOL_name,item.DecomposedMatrix.Position,item.DecomposedMatrix.Rotation,
                                item.DecomposedMatrix.Scaling,item.Matrix3D,item.transformationPoint,item.color));
                                
                       }
                       
                   }
                   let keyFrame=new KeyFrame(innerElement.index, innerElement.duration,items);
                   keyFrameLayer.push(keyFrame);
               }
           }
           this.keyFrameLayers.push(keyFrameLayer);
       }
    }

    constructFrame(whichFrame) {
        let container=this.add.container(300,300).setVisible(false);
        for (let index = this.keyFrameLayers.length-1; index >=0; index--) {
            const layer = this.keyFrameLayers[index];
            console.log("Layer "+index);
            for (let innerIndex = 0; innerIndex < layer.length; innerIndex++) {
                const keyFrame = layer[innerIndex];
                if(whichFrame>=keyFrame.start && whichFrame<=keyFrame.end){
                    console.log("KeyFrame "+innerIndex);
                    this.drawKeyFrame(container,keyFrame.clips);
                }
            }
            console.log("_____________");
        }
        container.scale=3;
        return container;
    }
    drawKeyFrame(container,clips){
        for (let index = clips.length-1; index >=0; index--) {
            const symbolData = clips[index];
            let innerContainer=this.add.container(0,0);
            let innerSymbols=this.symbolMap.get(symbolData.name)
            
            if(innerSymbols!==null&&innerSymbols.length!==0){
                for (let innerIndex = 0; innerIndex < innerSymbols.length; innerIndex++) {
                    const symbol = innerSymbols[innerIndex];
                   
                    if(symbol instanceof SpriteData){
                        let spr=this.add.sprite(symbol.position.x,symbol.position.y,'char_img',symbol.name);
                        spr.setRotation(symbol.rotation.z);
                        spr.scaleX=symbol.scale.x;
                        spr.scaleY=symbol.scale.y;
                        spr.setOrigin(0,0);
                        innerContainer.add(spr);
                    }else if(symbol instanceof SymbolData){
                        console.log("is symbol");
                    }else{
                        console.log("not sprite or symbol");
                    }
                }
            }else{
                console.log("Cannot get "+symbolData.name);
            }
            innerContainer.x=symbolData.position.x;//-symbolData.transformationPoint.x;
            innerContainer.y=symbolData.position.y;//-symbolData.transformationPoint.y;
            if(symbolData.transformationPoint.x!==0&&symbolData.transformationPoint.y!==0){
                console.log("trfmPt ",symbolData.transformationPoint.x,symbolData.transformationPoint.y);
            }
            innerContainer.setRotation(symbolData.rotation.z);
            innerContainer.scaleX=symbolData.scale.x;
            innerContainer.scaleY=symbolData.scale.y;
            container.add(innerContainer);
        }
        console.log("********************");
    }
    update (timestep, dt){
        this.elapsedTime+=dt;
        if(this.elapsedTime>this.renderDelay){
            this.rt.clear();
            let container=this.constructFrame(this.currentFrame);
            this.currentFrame++;
            if(this.currentFrame>=1040){
                this.currentFrame=0;
            }
            this.rt.draw(container);
            container.destroy();
            this.elapsedTime=0;
        }
    }
}
