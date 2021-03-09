/// <reference path="../../typings/phaser.d.ts"/>
import Phaser from 'phaser';
import Hero from '../entities/Hero';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  
  }

  preload() {

    // loading json data for level-1 tilmap 
    this.load.tilemapTiledJSON('level-1','assets/tilemaps/level-1.json');

    //loading the tiles image for json data of level-1
    this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2
    });
    //loadin the cloud tiles image
    this.load.spritesheet('clouds-sheet', 'assets/tilesets/Clouds.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2
    });

    this.load.spritesheet('hero-run-sheet','assets/hero/run.png', {
      frameWidth: 32,
      frameHeight: 64
    });

    this.load.spritesheet('hero-idle-sheet','assets/hero/idle.png', {
      frameWidth: 32,
      frameHeight: 64
    });

    this.load.spritesheet('hero-pivot-sheet','assets/hero/pivot.png', {
      frameWidth: 32,
      frameHeight: 64
    });

    this.load.spritesheet('hero-flip-sheet','assets/hero/spinjump.png', {
      frameWidth: 32,
      frameHeight: 64
    });

    this.load.spritesheet('hero-fall-sheet','assets/hero/fall.png', {
      frameWidth: 32,
      frameHeight: 64
    });
    this.load.spritesheet('hero-jump-sheet','assets/hero/jump.png', {
      frameWidth: 32,
      frameHeight: 64
    });
    this.load.spritesheet('hero-die-sheet','assets/hero/bonk.png', {
      frameWidth: 32,
      frameHeight: 64
    });
    this.load.spritesheet('hero-food-sheet','assets/hero/food.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('princess-sheet','assets/hero/princess.png', {
      frameWidth: 32,
      frameHeight: 46
    });

    // loading sound 
    this.load.audio('jump', 'assets/audio/jump.mp3');
    this.load.audio('doubleJump', 'assets/audio/doubleJump.mp3');
    this.load.audio('food', 'assets/audio/food.mp3');
    this.load.audio('dead', 'assets/audio/dead.mp3');
    this.load.audio('game', 'assets/audio/game.mp3');
    this.load.audio('clap', 'assets/audio/clap.mp3');

  }

  create(data) {
    // keyboard eventlister using keyboard plugin feature of phaser
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    // crate sound 
    this.jumpSound = this.sound.add('jump', { loop: false,  volume: 0.1 });
    this.doubleJumpSound = this.sound.add('doubleJump', { loop: false,  volume: 0.1 });
    this.foodSound = this.sound.add('food', { loop: false,  volume: 0.1 });
    this.deadSound = this.sound.add('dead', { loop: false,  volume: 0.1 });
    this.clapSound = this.sound.add('clap', { loop: false,  volume: 0.01});
    this.gameSound = this.sound.add('game', { loop: true,  volume: 0.05});
    
    // create animation 
    this.anims.create({
      key: 'hero-running',
      frames: this.anims.generateFrameNumbers('hero-run-sheet'),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNumbers('hero-idle-sheet')
    });

    this.anims.create({
      key: 'hero-pivoting',
      frames: this.anims.generateFrameNumbers('hero-pivot-sheet')
    });

    this.anims.create({
      key: 'hero-jumping',
      frames: this.anims.generateFrameNumbers('hero-jump-sheet'),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hero-flipping',
      frames: this.anims.generateFrameNumbers('hero-flip-sheet'),
      frameRate: 30,
      repeat: 0,
    });

    this.anims.create({
      key: 'hero-dead',
      frames: this.anims.generateFrameNumbers('hero-die-sheet')
    });
    
    this.anims.create({
      key: 'hero-falling',
      frames: this.anims.generateFrameNumbers('hero-fall-sheet'),
      frameRate: 10,
      repeat: -1,
    });

    // calling the addMap method to load the map in the game
    this.addMap();

    // calling addHero method for creating hero by using Hero Class
    this.addHero();

    // Enabling the camera to follow the hero 
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  // creating hero 
  addHero() {
    this.gameSound.play();
    //listing initial texts
    this.score = 0; 
    this.gameText = '';
    // showing the score 
    this.scoreText = this.add.text(6, 2, 'Score: ' + this.score, { fontSize: '12px', fill: 'White', align: 'left', fontFamily: 'Anton', stroke: 'black', strokeThickness: 5});
    this.scoreText.setOrigin(0);
    this.scoreText.setScrollFactor(0);

    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y, this.jumpSound); // hero starting position
    this.cameras.main.startFollow(this.hero);
 
    //pushing the forground behind the hero
    this.children.moveTo(this.hero, this.children.getIndex(this.map.getLayer('Foreground').tilemapLayer));

    // Colliding the Hero with the map tiles.
    const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);

    // killing the Hero after ovelapping it with the spike 
    const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
      this.deadSound.play();
      this.gameText = "Game Over!!!\nPress Space key\nto restart Game";
      this.hero.kill();
    });

    //princess rescued
    const princessCollider = this.physics.add.overlap(this.hero, this.princessGroup, () => {
      this.clapSound.play();
      this.gameText = "Congratulations!\nYou have rescued the princess\nPress space key to play again.";
      this.hero.kill();
    });

    //Eating the food 
    const foodCollider = this.physics.add.overlap(this.hero, this.foodGroup, (hero, food) => {
      this.foodSound.play();
      this.foodGroup.killAndHide(food);
      food.body.enable = false;

      this.score += 10;
      this.scoreText.text = 'Score: ' + this.score;
    });

    // playig sound on jumping 
    this.hero.on('jumped', () => {
      this.jumpSound.play();
    });

    this.hero.on('doubleJumped', () => {
      this.doubleJumpSound.play();
    });


    this.hero.on('died', () => { //died event listner is createn in kill () method in side Hero Class
      this.gameSound.stop();
      groundCollider.destroy();
      spikesCollider.destroy();
      foodCollider.destroy();
      princessCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();

      // removing the foods from the map 
      this.foodGroup.children.iterate(food => {
        this.foodGroup.killAndHide(food);
        food.body.enable = false;
      });
      this.foodGroup.clear(true);

      //creating game over texts
      this.gameOverText = this.add.text(250, 160, this.gameText, { fontSize: '28px', fill: 'White', align: 'center', fontFamily: 'Anton', stroke: 'black', strokeThickness: 8});
      this.gameOverText.setOrigin(0.5);
      this.gameOverText.setScrollFactor(0);
      this.gameOverText.visible = true;
    });
  }

  // creating game map
  addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    // adding tilesets and binding them with the tiles images 
    const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
    const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');

    //creating the layers
    const backgroundLayer2 = this.map.createStaticLayer('Background2', backgroundTiles);
    backgroundLayer2.setScrollFactor(0.7);
    const backgroundLayer = this.map.createStaticLayer('Background', backgroundTiles);
    backgroundLayer.setScrollFactor(0.5);

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles); // Ground = is specified then name of the layer in level-1.json file
    groundLayer.setCollision([1,2,4], true);

    //setting the boundary of the game according to the map layers size starting from 0,0 to end onf map width and height
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, false, true);

    // creating physics group for spikes
    this.spikeGroup = this.physics.add.group({ immovable: true, allowGravity: false });

    //getting start object data from tiled map
    this.map.getObjectLayer('Objects').objects.forEach(object => {
      if(object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y };
      }
      if(object.gid === 7) {
        const spike = this.spikeGroup.create(object.x, object.y, 'world-1-sheet', object.gid - 1); // gid-1 : the grame number in tile tiled starts from 0
        spike.setOrigin(0, 1);

        // setting the size for collision of the spike 
        spike.setSize(object.width - 10, object.height - 10);
        spike.setOffset(5, 10);
      }
    });

    //setting food object layer in the map
    this.foodGroup = this.physics.add.group({ allowGravity: false, enableBody: true });
    this.map.getObjectLayer('Foods').objects.forEach(foodObj => {
      const food = this.foodGroup.create(foodObj.x, foodObj.y, 'hero-food-sheet', foodObj.gid - 1);
      
      food.setOrigin(0, 1);
      food.setSize(foodObj.width - 10, foodObj.height - 10);
    });

    //setting Princess object layer in the map
    this.princessGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.map.getObjectLayer('Princess').objects.forEach(princessObj => {
      const princess = this.princessGroup.create(princessObj.x, princessObj.y, 'princess-sheet', princessObj.gid - 1);
      
      princess.setOrigin(0, 1);
      princess.setSize(princessObj.width - 10, princessObj.height - 10);
    });

    // creating foreground layer 
    this.map.createStaticLayer('Foreground', groundTiles);

    // Debuging the Graphics
    // const debugGraphics = this.add.graphics();
    // groundLayer.renderDebug(debugGraphics);
  }

  update(time, delta) {
    const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
    if(this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100 && this.cursorKeys.space.isDown) {
      this.hero.destroy();
      this.gameOverText.visible = false;
      this.scoreText.text = '';
      this.addMap();
      this.addHero();
    }
  }
}

export default Game;