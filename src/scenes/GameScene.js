import 'phaser';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { 
      let imageName = item.split(".")[0];
    //   //console.log(item, imageName);
      images[item.replace('./', '').split(".")[0]] = r(item); 
    });
  return images;
}
  
const gameAssets = importAll(require.context('../assets/', false, /\.(png|jpe?g|svg)$/));

const GameConfigVars = {
  SPEED:0.75
};

class GameScene extends Phaser.Scene{
    constructor()
    {
        super('Game');
        this._prevDelta = 0;
        this._moveTween = null;
        this._carHalfWidth = null;
        this._carHalfHeight = null;

        this._backWheel = null;
        this._frontWheel = null;
        this._carChassis = null;
        this._carContainer = null;
        this.SPEED = 0;
        this._isInitialAnimComplete = false;
        this._isTouchContinues = false;
    }

    preload()
    {
        let self = this;
        Object.keys(gameAssets).forEach((key) => {
            self.load.image(key, gameAssets[key]);
        });
        this.load.spritesheet("smoke",gameAssets["PFX_dust"],{frameWidth: 64, frameHeight:64})
    }

    create()
    {  
        // const mainCarObject = this.add.image(400, 150, "TruckChassisSprite");
        // mainCarObject.anchor.set(0.5);
        let cloudTexture = this.textures.get("SkyTileSprite").getSourceImage();
        //console.log(cloudTexture);
        let cloudBg = this.add.tileSprite(0,-100,cloudTexture.width * 2,cloudTexture.height,"SkyTileSprite");
        cloudBg.setOrigin(0,0);
        cloudBg.setScale(0.5);
        this._cloudSpriteRef = cloudBg;
        
        let treeTexture = this.textures.get("BG-trees").getSourceImage();
        let treesSprite = this.add.tileSprite(0,0,treeTexture.width *2 ,treeTexture.height,"BG-trees");
        treesSprite.setOrigin(0,0);
        treesSprite.setScale(1.6);
        this._treeSpriteRef = treesSprite;

        let roadTexture = this.textures.get("BG-road").getSourceImage();
        let roadSprite = this.add.tileSprite(0,430,roadTexture.width*4,roadTexture.height,"BG-road");
        roadSprite.setOrigin(0,0);
        roadSprite.setScale(1.3);
        this._roadSpriteRef = roadSprite;



        let grassTexture = this.textures.get("GrassTile").getSourceImage();
        let grassSprite = this.add.tileSprite(0,520,grassTexture.width*2,grassTexture.height,"GrassTile");
        grassSprite.setOrigin(0,0);
        grassSprite.setScale(1.5);
        this._grassSpriteRef = grassSprite;

        // let grassSprite = this.add.tileSprite(0,900, 4000,1000,"GrassTile");

        const carContainer = this.add.container(300,400);
        this._carContainer = carContainer;
        //console.log(carContainer);
        let carChassis = this.add.sprite(0,0, "TruckChassisSprite");
        carChassis.setOrigin(0,0);
        this._carChassis = carChassis;
       
        this._frontWheel = this.add.sprite(carChassis.width * 0.8,carChassis.height , "TruckWheelSprite");
        this._backWheel = this.add.sprite(carChassis.width * 0.22,carChassis.height , "TruckWheelSprite");
        // const smokeAnim = this.add.sprite(100,100, "smoke", 0);
        // this.anims.create({
        //   key:"smokeAnim",
        //   repeat:-1,
        //   frameRate: 5,
        //   frames: this.anims.generateFrameNames('smoke', {start:0, end:7})
        // });
        //smokeAnim.play("smokeAnim");

        // let particles = this.add.particles('smoke');

        // particles.createEmitter({
        //     frame: "smoke",
        //     x: 200,
        //     y: 300,
        //     lifespan: 2000,
        //     speed: { min: 400, max: 600 },
        //     angle: 330,
        //     gravityY: 300,
        //     scale: { start: 0.4, end: 0 },
        //     quantity: 2,
        //     blendMode: 'ADD'
        // });

        carContainer.add(this._carChassis);
        carContainer.add(this._frontWheel);
        carContainer.add(this._backWheel);
        carContainer.setScale(0.5);
        carContainer.x = -300;//(-50,300);
        carContainer.y = 200;
        carContainer.angle = -30;
        this._carHalfWidth = carChassis.width * 0.25;
        this._carHalfHeight = carChassis.height * 0.25;
        this.tweens.add({
          targets: [this._frontWheel, this._backWheel],
          duration:750,
          angle:360,
          repeat: -1
        });

        this.tweens.add({
          targets:this._carContainer,
          duration:750,
          delay:2000,
          x:100,
          y:400,
          onComplete:this.onInitialised.bind(this)
        });
    }

    onInitialised()
    {
      this._isInitialAnimComplete = true;
      this.SPEED = 0.5;
      this.tweens.add({
        targets: this._carContainer,
        duration:200,
        angle:0
      });
      this.tweens.add({
        targets: this._backWheel,
        duration:500,
        x:"-=20",
        repeat: -1,
        yoyo:true,
      });
      this.tweens.add({
        targets: this._frontWheel,
        duration:500,
        x:"+=20",
        repeat: -1,
        yoyo:true
      });
      
      this.tweens.add({
        targets:this._carChassis,
        duration:500,
        ease: 'Sine.easeInOut',
        y:"+=20",
        repeat: -1,
        yoyo:true
      });
      
      this.input.on("pointerdown",this.onTouchBegan.bind(this));

      this.input.on("pointerup", this.onTouchEnd.bind(this));
    }

    onTouchBegan(touchEvent)
    {
      //console.log("in touch began", touchEvent);
      let targetX = touchEvent.x - this._carHalfWidth;
      let targetY = touchEvent.y - this._carHalfHeight;
      let roadHeight = this._roadSpriteRef.height * 0.6;//road sprite scale
      let bottomRoadBoundary = this._roadSpriteRef.y + roadHeight - this._carHalfHeight;
      let topRoadBoundary = this._roadSpriteRef.y - roadHeight;

      //keep within road boundary
      ////console.log(this._roadSpriteRef.y, this._roadSpriteRef.height);
      if(targetY - this._carHalfHeight > bottomRoadBoundary)
      {
        targetY = bottomRoadBoundary;
      }
      else if (targetY - this._carHalfHeight < topRoadBoundary)
      {
        targetY = topRoadBoundary;        
      }

      let currentX = this._carContainer.x;
      let currentY = this._carContainer.y;
      let distance = Phaser.Math.Distance.Between(currentX, currentY, targetX, targetY);
      //console.log("distance", distance);
      this._isTouchContinues = true;
      if(distance>0)
      {
        this._moveTween = this.tweens.add({
          targets:this._carContainer,
          x:targetX,
          y:targetY,
          duration:distance,
        });
      }
    }

    onTouchEnd()
    {
      if(this._moveTween && this._moveTween.isPlaying())
      {
        this._moveTween.stop();
        this._isTouchContinues = false;
      }
    }

    update(delta)
    {
      let deltaBetweenFrames = delta - this._prevDelta;
      this._prevDelta = delta;
      if(this._isInitialAnimComplete & this._isTouchContinues)
      {
        this.SPEED = this._carContainer.x > 0? 0.5 +(this._carContainer.x * 0.001):0.5;
      }
      // //console.log(delta);
      if(deltaBetweenFrames > 0)
      {
        this._grassSpriteRef.tilePositionX += (this.SPEED * deltaBetweenFrames);
        this._roadSpriteRef.tilePositionX += (this.SPEED * deltaBetweenFrames);
        this._treeSpriteRef.tilePositionX += (this.SPEED * deltaBetweenFrames * 0.7);
        this._cloudSpriteRef.tilePositionX += (this.SPEED * deltaBetweenFrames * 0.5);
  
      }
    }
}


export default GameScene;