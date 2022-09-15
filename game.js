const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1920,
  heigth: 1060,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: true
    },
  }
};

const game = new Phaser.Game(config);

var exitLayer;
var coinLayer;
var score = 0;
var scoreText;
var bombs;
var deathCounter = 0;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('hospitalBackground', 'assets/hospitalbg.png');
  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  this.load.image('spike', 'assets/spike.png');
  this.load.image('coin', 'assets/coinGold.png');

  this.load.image('exit', 'assets/exit.png');
  this.load.image('jumpBoost', 'assets/jumpBoost.png');
  this.load.image('star', 'assets/coinGold.png');
  this.load.image('bomb', 'assets/bomb.png');

  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');
  this.load.tilemapTiledJSON('map1', 'assets/tilemaps/level2.json');
  this.load.tilemapTiledJSON('map2', 'assets/tilemaps/level3.json');
  this.load.tilemapTiledJSON('map3', 'assets/tilemaps/level4.json');

  this.load.atlas('player', 'assets/player.png',
    'assets/player.json');

  this.load.audio("planet_popstar", ["assets/sounds/planet_popstar.mp3"]);
  this.load.audio("jump", ["assets/sounds/jump.mp3"]);
  this.load.audio("death", ["assets/sounds/death.mp3"]);
  this.load.audio("game_over1", ["assets/sounds/game_over1.mp3"]);
  this.load.audio("game_over", ["assets/sounds/game_over.mp3"]);
  this.load.audio("coin", ["assets/sounds/coin.mp3"]);
}

function create() {
  this.music = this.sound.add('planet_popstar', {
    volume: 0.2,
    loop: true
  })

  if (!this.sound.locked) {
    this.music.play()
  }
  else {
    this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      this.music.play()
    })
  }

  const map = this.make.tilemap({ key: 'map3' });
  // const tileset = map.addTilesetImage('yoann_platformer', 'tiles');
  const tileset = map.addTilesetImage('level1', 'tiles');

  var coinTiles = map.addTilesetImage('coin');
  coinLayer = map.createLayer('Coins', coinTiles, 0, 0);

  const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
  backgroundImage.setScale(2, 0.8);

  const platforms = map.createLayer('Platforms', tileset, 0, 200);
  platforms.setCollisionByExclusion(-1, true);
  platforms.setCollisionByProperty({ collides: true });
  // this.matter.world.convertTilemapLayer(platforms);
  // const { width, height } = this.scale
  // this.matter.add.sprite(width * 0.5, height * 0.5, 'player');

  this.player = this.physics.add.sprite(50, 400, 'player');
  this.player.setBounce(0.0);
  this.player.setCollideWorldBounds(true);

  this.player.body.setSize(this.player.width - 40, this.player.height - 20);
  this.physics.add.collider(this.player, platforms);

  this.jump = this.sound.add("jump");
  this.death = this.sound.add("death");
  this.coin = this.sound.add("coin");
  this.planet_popstar = this.sound.add("planet_popstar");
  this.game_over = this.sound.add("game_over");
  this.game_over1 = this.sound.add("game_over1");

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  scoreText.setScrollFactor(0);


  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'robo_player_',
      start: 2,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'robo_player_0' }],
    frameRate: 10,
  });

  this.anims.create({
    key: 'jump',
    frames: [{ key: 'player', frame: 'robo_player_1' }],
    frameRate: 10,
  });

  this.anims.create({
    key: 'fall',
    frames: [{ key: 'player', frame: 'robo_player_6' }],
  })

  this.cursors = this.input.keyboard.createCursorKeys();

  this.spikes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  map.getObjectLayer('Spikes').objects.forEach((spike) => {
    const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
    spikeSprite.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
  });
  this.physics.add.collider(this.player, this.spikes, playerHit, null, this);


  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.cameras.main.startFollow(this.player);

  stars = this.physics.add.group({
    key: 'star',
    repeat: 0,
    setXY: { x: 300, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  });

  exitLayer = map.createLayer('Exit', tileset, 0, 0);
  exitLayer = this.physics.add.sprite(1900, 380, 'exit');

  this.physics.add.collider(exitLayer, platforms);
  this.physics.add.overlap(this.player, exitLayer, nextLevel, null, this);

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(this.player, stars, collectStar, null, this);

  bombs = this.physics.add.group();
  this.physics.add.collider(this.player, bombs, playerHit, null, this);
  this.physics.add.collider(bombs, platforms);
  // this.physics.add.overlap(platforms, bombs, platformHit, null, this);
}

function update() {
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-200);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(200);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else {
    this.player.setVelocityX(0);
    if (this.player.body.onFloor()) {
      this.player.play('idle', true);
    }
  }

  if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(-350);
    this.player.play('jump', true);
    this.jump.play();
  }

  if (this.cursors.shift.isDown) {
    this.player.setVelocityX(this.player.body.velocity.x * 2.1);
  }

  if (this.cursors.down.isDown && !this.player.body.onFloor()) {
    this.player.play('fall', true);
    this.player.setVelocityY(this.player.body.velocity.y + 60);
    this.player.setBounce(0.5);
    if (this.player.body.velocity.y > 900) {
      this.player.setVelocityY(800);
    }
  }

  if (this.player.body.onFloor()) {
    this.player.setBounce(0.0);
  }

  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    this.player.setFlipX(true);
  }
}


function platformHit(platforms) {
  platforms.destroy();
}

function playerHit(player) {
  deathCounter++
  scoreText.setText('Deaths: ' + deathCounter);
  player.setVelocity(0, 0);
  player.setTint(0xff0000);
  player.setX(50);
  player.setY(300);
  this.player.play('fall', true);
  player.setAlpha(0);
  let tw = this.tweens.add({
    targets: player,
    alpha: 1,
    duration: 100,
    ease: 'Linear',
    repeat: 5,
  });
  setTimeout(() => {
    this.player.clearTint();
  }, 1000);

  if (deathCounter === 5) {
    this.add.rectangle(0, 0, 1920, 1080, 0x000000).setOrigin(0, 0);
    this.add.text(800, 400, 'Game Over', { fontSize: '32px', fill: '#fff' });
    this.add.text(800, 500, 'Press r to Restart', { fontSize: '32px', fill: '#fff' });
    this.music.stop();
    this.game_over1.play();
    this.physics.pause();
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
      deathCounter = 0;
      score = 0;
    }
    );
  }
}

function nextLevel() {
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('yoann_platformer', 'tiles');
  const platforms = map.createLayer('Platforms', tileset, 0, 0);
  platforms.setCollisionByExclusion(-1, true);
  platforms.setCollisionByProperty({ collides: true });
  const backgroundImage = this.add.image(0, 0, 'hospitalBackground').setOrigin(0, 0);
  backgroundImage.setScale(2, 0.8);
  deathCounter = 0;
  score = 0;
  this.scene.restart();
}

function collectStar(player, star) {
  this.coin.play();
  score += 5;
  scoreText.setText('Score: ' + score);
  star.disableBody(true, true);
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 10, true, true);
    });

    if (score.toString().includes('0')) {
      if (deathCounter > 0) {
        deathCounter = deathCounter - 1;
      }

      scoreText.setText('Life Added! Deaths: ' + deathCounter,);

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 50, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
}