const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  heigth: 600,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
      debug: true,
    },
  }
};

const game = new Phaser.Game(config);

var exitLayer;
var jumpBoost;
var coinLayer;
var score = 0;
var scoreText;
var bombs;
var deathCounter = 0;
var jumpBoostCollected = false;

function preload() {
  this.load.image('background', 'assets/background1.gif');
  // this.load.image('background', 'assets/background2.png');
  // this.load.image('background', 'assets/background3.png');
  // this.load.image('background', 'assets/background4.png');
  // this.load.image('background', 'assets/background5.png');
  // this.load.image('background', 'assets/background6.jpg');

  this.load.image('hospitalBackground', 'assets/hospitalbg.png');
  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  this.load.image('spike', 'assets/spike.png');
  this.load.image('coin', 'assets/coinGold.png');

  this.load.image('exit', 'assets/exit.png');
  this.load.image('jumpBoost', 'assets/jumpBoost.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');

  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');
  this.load.tilemapTiledJSON('map1', 'assets/tilemaps/level2.json');
  this.load.tilemapTiledJSON('map2', 'assets/tilemaps/level3.json');
  this.load.tilemapTiledJSON('map3', 'assets/tilemaps/level4.json');

  this.load.atlas('player', 'assets/player.png',
    'assets/player.json');

  this.load.audio("planet_popstar", ["assets/sounds/planet_popstar.mp3"]);
  this.load.audio("jump", ["assets/sounds/jump.mp3"]);
  this.load.audio("superjump", ["assets/sounds/superjump.mp3"]);
  this.load.audio("superjump1", ["assets/sounds/superjump1.mp3"]);
  this.load.audio("death", ["assets/sounds/death.mp3"]);
  this.load.audio("game_over", ["assets/sounds/game_over.mp3"]);
  this.load.audio("coin", ["assets/sounds/coin.mp3"]);
  this.load.audio("yadun", ["assets/sounds/yadun.mp3"]);
  this.load.audio("thinkyoucantakeme", ["assets/sounds/thinkyoucantakeme.mp3"]);
  this.load.audio("behave", ["assets/sounds/behave.mp3"]);
  this.load.audio("spawn", ["assets/sounds/spawn.mp3"]);
  this.load.audio("boing", ["assets/sounds/boing.mp3"]);
  this.load.audio("pop", ["assets/sounds/pop.mp3"]);
  this.load.audio("jump_spawn", ["assets/sounds/jump_spawn.mp3"]);
  this.load.audio("powerup", ["assets/sounds/powerup.mp3"]);
}

function create() {
  this.music = this.sound.add('planet_popstar', {
    volume: 0.5,
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
  const tileset = map.addTilesetImage('level1', 'tiles');

  const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
  backgroundImage.setScale(map.widthInPixels / backgroundImage.width, map.heightInPixels / backgroundImage.height);

  const platforms = map.createLayer('Platforms', tileset, 0, 200);
  platforms.setCollisionByExclusion(-1, true);
  platforms.setCollisionByProperty({ collides: true });

  this.player = this.physics.add.sprite(50, 400, 'player');
  this.player.setBounce(0.0);
  this.physics.world.bounds.width = map.widthInPixels;
  // this.physics.world.bounds.height = map.heightInPixels;
  this.player.setCollideWorldBounds(true);

  this.player.body.setSize(this.player.width - 40, this.player.height - 20);
  this.physics.add.collider(this.player, platforms);

  this.jump = this.sound.add("jump", {
    volume: 0.2,
    loop: false
  });
  this.superjump = this.sound.add("superjump");
  this.superjump1 = this.sound.add("superjump1");
  this.death = this.sound.add("death");
  this.coin = this.sound.add("coin", {
    volume: 0.5,
    loop: false
  });
  this.planet_popstar = this.sound.add("planet_popstar");
  this.game_over = this.sound.add("game_over", {
    volume: 2,
    loop: false
  });

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
  });

  this.anims.create({
    key: 'superjump',
    frames: [{ key: 'player', frame: 'robo_player_7' }],
  });

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
    key: 'coin',
    repeat: 6,
    setXY: { x: 700, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  exitLayer = this.physics.add.sprite(3000, 380, 'exit');

  this.time.addEvent({
    delay: 25000,
    callback: () => {
      this.sound.play("jump_spawn",
        {
          volume: 3,
          loop: false
        });
      jumpBoost = this.physics.add.sprite(600, 780, 'jumpBoost');
      this.physics.add.collider(jumpBoost, platforms);
      this.physics.add.overlap(this.player, jumpBoost, collectJumpBoost, null, this);
    },
    loop: true
  });
  jumpBoost = this.physics.add.group({
    key: 'jumpBoost',
    repeat: 0,
    setXY: { x: -11, y: 0, stepX: 70 }
  });


  this.physics.add.collider(jumpBoost, platforms);
  this.physics.add.overlap(this.player, jumpBoost, collectJumpBoost, null, this);

  this.physics.add.collider(exitLayer, platforms);
  this.physics.add.overlap(this.player, exitLayer, nextLevel, null, this);

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(this.player, stars, collectStar, null, this);

  bombs = this.physics.add.group();
  this.time.addEvent({
    delay: 2000,
    callback: () => {
      const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
      const bomb = bombs.create(x, 16, 'bomb');
      this.sound.play('spawn', {
        volume: 3.5,
        loop: false
      });
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(0, 500), 20);
      bomb.allowGravity = true;
    },
    callbackScope: this,
    loop: true
  });

  this.physics.add.collider(this.player, bombs, playerHit, null, this);
  this.physics.add.collider(bombs, this.spikes, bombHit, null, this);
  this.physics.add.collider(bombs, platforms, () => {
    this.sound.play('boing', {
      volume: 2,
      loop: false
    });
  }
  );
}

function update() {
  if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).isDown) {
    this.sound.stopAll();
    this.scene.restart();
  }

  if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F).isDown && !this.scale.isFullscreen) {
    this.scale.startFullscreen();
    this.sound.stopAll();
    this.scene.restart();
  }

  if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown && this.player.body.onFloor()) {
    // make the player face the player and while jumping


  }

  bombs.children.iterate((bomb) => {
    if (bomb.body.velocity.x > 0) {
      bomb.setFlipX(true);
    } else {
      bomb.setFlipX(false);
    }
  });

  if (!this.scale.isFullscreen) {
    this.add.text(128, 328, 'PRESS F TO PLAY THE GAME FULLSCREEN (REQUIRED FOR PHYSICS TO WORK PROPERLY !!!!!)', { fontSize: '32px', fill: '#f00' }).setScrollFactor(0);
  }

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
    this.jump.play();
    this.player.setVelocityY(-350);
    this.player.play('jump', true);
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


function useJumpBoost(player) {
  player.play('superjump', true);
  jumpBoostCollected = false;
  player.clearTint();
  player.setVelocityY(-900);
  scoreText.setText('Score: ' + score);
}

function playerHit(player) {
  this.death.play();
  player.play('fall', true);
  deathCounter++
  scoreText.setText('Deaths: ' + deathCounter);
  player.setVelocity(0, 0);
  player.setTint(0xff0000);
  player.setX(50);
  player.setY(300);
  player.setAlpha(0);
  let tw = this.tweens.add({
    targets: player,
    alpha: 1,
    duration: 100,
    ease: 'Linear',
    repeat: 5,
  });
  if (jumpBoostCollected) {
    jumpBoostCollected = false;
    player.clearTint();
  }
  setTimeout(() => {
    this.player.clearTint();
  }, 1000);

  if (deathCounter === 5) {
    this.add.rectangle(0, 0, 1920, 1080, 0x000000).setOrigin(0, 0);
    this.add.text(800, 400, 'Game Over', { fontSize: '32px', fill: '#fff' });
    this.add.text(800, 500, 'Press r to Restart', { fontSize: '32px', fill: '#fff' });
    this.music.stop();
    this.game_over.play();
    this.jump.mute = true;
    this.time.removeAllEvents();
    this.physics.pause();
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
      this.game_over.stop();
      this.jump.mute = false;
      deathCounter = 0;
      score = 0;
    }
    );
  }
}

function bombHit(bombs) {
  bombs.destroy();
  this.sound.play('pop', {
    volume: 2,
    loop: false
  });
  const particles = this.add.particles('bomb');
  const emitter = particles.createEmitter({
    speed: 200,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD'
  });
  emitter.startFollow(bombs);
  setTimeout(() => {
    particles.destroy();
  }, 0800);
}

function nextLevel() {
  // const map = this.make.tilemap({ key: 'map2' });
  // const tileset = map.addTilesetImage('yoann_platformer', 'tiles');
  // const platforms = map.createLayer('Platforms', tileset, 0, 0);
  // platforms.setCollisionByExclusion(-1, true);
  // platforms.setCollisionByProperty({ collides: true });
  // const backgroundImage = this.add.image(0, 0, 'hospitalBackground').setOrigin(0, 0);
  deathCounter = 0;
  score = 0;
  // this.time.removeAllEvents();
  // this.scene.remove();
  // this.physics.pause();
  this.music.stop();
  this.scene.restart();
}

function collectJumpBoost(player, jumpBoost) {
  scoreText.setText('Jump Boost Collected Press A to use it!');
  jumpBoostCollected = true;

  this.music.pause();
  setTimeout(() => {
    this.music.resume();
  }, 3300);
  this.sound.play('powerup', {
    volume: 2.5,
    loop: false
  });

  const particles = this.add.particles('star');
  const emitter = particles.createEmitter({
    speed: 1200,
    scale: { start: 1.7, end: 0 },
    blendMode: 'ADD'
  });
  emitter.startFollow(player);
  setTimeout(() => {
    particles.destroy();
  }, 1900);
  player.setTint(0x00ff00);
  jumpBoost.destroy()
  this.input.keyboard.on('keydown-A', () => {
    if (jumpBoostCollected) {
      useJumpBoost(player);
      if (player.body.onFloor()) {
        this.superjump1.play();
      }
      else {
        this.superjump.play();
      }
      const particles = this.add.particles('jumpBoost');
      const emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
      });
      emitter.startFollow(player);
      setTimeout(() => {
        particles.destroy();
      }
        , 1500);
    }
  })
}

function collectStar(player, star) {
  this.sound.play('coin', {
    volume: 0.5,
    loop: false
  });
  score += 5;
  scoreText.setText('Score: ' + score);
  star.destroy();
  if (score.toString().includes('0')) {
    if (deathCounter > 0) {
      deathCounter = deathCounter - 1;
    }

    scoreText.setText('Life Added! Deaths: ' + deathCounter,);

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 50, 'bomb');
    this.sound.play('spawn',
      {
        volume: 3.5,
        loop: false,
      });
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}