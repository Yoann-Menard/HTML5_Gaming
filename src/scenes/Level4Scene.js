class Level4Scene extends Phaser.Scene {
  constructor() {
    super('Level4Scene');
  }

  preload() {
    this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
    this.load.image('spike', 'assets/spike.png');
    this.load.image('enemy', 'assets/enemy.png');

    this.load.image('jumpBoost', 'assets/jumpBoost.png');

    this.load.tilemapTiledJSON('level4', 'assets/tilemaps/level4.json');

    this.load.atlas('player', 'assets/player.png',
      'assets/player.json');

    this.load.audio("boss", "assets/sounds/boss.mp3");
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
    this.load.audio("win", ["assets/sounds/win.mp3"]);
  }



  create() {
    this.music = this.sound.add('boss', {
      volume: 1.85,
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
    const map = this.make.tilemap({ key: 'level4' });
    const tileset = map.addTilesetImage('platformPack_tilesheet', 'tiles');

    // const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    // backgroundImage.setScale(map.widthInPixels / backgroundImage.width, map.heightInPixels / backgroundImage.height);

    const platforms = map.createLayer('Platforms', tileset, 0, 200);
    platforms.setCollisionByExclusion(-1, true);
    platforms.setCollisionByProperty({ collides: true });

    this.player = this.physics.add.sprite(0, 1750, 'player');
    this.player.setBounce(0.0);
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = 9999999;
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
    this.game_over = this.sound.add("game_over", {
      volume: 2,
      loop: false
    });
    this.win = this.sound.add("win", {
      volume: 2,
      loop: false
    });
    scoreText = this.add.text(16, 16, 'Great Basilisk Paco', { fontSize: '32px', fill: '#f00' });
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
    this.physics.add.collider(this.player, this.spikes, playerHit4, null, this);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);


    jumpBoost = this.physics.add.sprite(1900, 3000, 'jumpBoost');
    this.physics.add.collider(jumpBoost, platforms);
    this.physics.add.overlap(this.player, jumpBoost, collectJumpBoost, null, this);


    this.time.addEvent({
      delay: 25000,
      callback: () => {
        this.sound.play("jump_spawn",
          {
            volume: 3,
            loop: false
          });
        jumpBoost = this.physics.add.sprite(450, 1510, 'jumpBoost');
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

    this.enemy = this.physics.add.sprite(70, 600, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setSize(this.enemy.width - 90, this.enemy.height - 90);
    this.physics.add.collider(this.player, this.enemy, playerHit4, null, this);
    this.physics.add.collider(this.enemy, this.spikes, enemyHit, null, this);
    this.physics.add.collider(this.enemy, platforms);
  }

  update() {
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).isDown) {
      deathCounter = 0;
      score = 0;
      this.sound.stopAll();
      this.scene.restart();
    }

    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F).isDown && !this.scale.isFullscreen) {
      this.scale.startFullscreen();
      this.sound.stopAll();
      this.scene.restart();
    }

    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U).isDown) {
      this.sound.stopAll();
      this.scene.stop();
      this.scene.start("Level1Scene");
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
      this.player.setVelocityY(-950);
      this.player.play('jump', true);
    }

    if (this.cursors.shift.isDown) {
      this.player.setVelocityX(this.player.body.velocity.x * 4.1);
    }

    if (this.cursors.down.isDown && !this.player.body.onFloor()) {
      this.player.play('fall', true);
      this.player.setVelocityY(this.player.body.velocity.y + 600);
      this.player.setBounce(0);
    }

    if (this.player.body.onFloor()) {
      this.player.setBounce(0.0);
    }

    if (this.player.body.velocity.y > 900) {
      this.player.setVelocityY(800);
    }

    if (this.player.body.velocity.x > 0) {
      this.player.setFlipX(false);
    } else if (this.player.body.velocity.x < 0) {
      this.player.setFlipX(true);
    }

    if (this.enemy.x < this.player.x) {
      this.enemy.setVelocityX(200);
    }

    if (this.enemy.x > this.player.x) {
      this.enemy.setVelocityX(-200);
    }
    if (this.enemy.y < this.player.y) {
      this.enemy.setVelocityY(100);
    }
    if (this.enemy.y > this.player.y) {
      this.enemy.setVelocityY(-100);
    }

    if (this.enemy.body.velocity.x > 0) {
      this.enemy.setFlipX(false);
    }
    if (this.enemy.body.velocity.x < 0) {
      this.enemy.setFlipX(true);
    }
  }
}

var jumpBoost;;
var score = 0;
var scoreText;
var deathCounter = 0;
var enemyDeathCounter = 0;
var jumpBoostCollected = false;

function useJumpBoost(player) {
  player.play('superjump', true);
  jumpBoostCollected = false;
  player.clearTint();
  player.setVelocityY(-1500);
  scoreText.setText('Score: ' + score);
}

function playerHit4(player) {
  this.death.play();
  player.play('fall', true);
  deathCounter++
  scoreText.setText('Deaths: ' + deathCounter);
  player.setVelocity(0, 0);
  player.setTint(0xff0000);
  player.setX(0);
  player.setY(1550);
  this.enemy.setX(70);
  this.enemy.setY(600);
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

  if (deathCounter >= 15) {
    this.add.rectangle(0, 0, 1920, 1080, 0x000000).setOrigin(1300, 1500);
    this.add.text(800, 400, 'Game Over', { fontSize: '32px', fill: '#fff' });
    this.add.text(800, 500, 'Press R to Restart', { fontSize: '32px', fill: '#fff' });
    this.music.stop();
    this.game_over.play();
    this.jump.mute = true;
    this.time.removeAllEvents();
    this.physics.pause();
    this.input.keyboard.on('keydown-R', () => {
      this.jump.mute = false;
      score = 0;
      deathCounter = 0;
      this.game_over.stop();
      this.scene.stop();
      this.scene.start("Level1Scene");
    }
    );
  }
}

function enemyHit(enemy) {
  enemy.setX(900);
  enemy.setY(950);
  enemyDeathCounter++
  this.sound.play('pop', {
    volume: 2,
    loop: false
  });
  const particles = this.add.particles('enemy');
  const emitter = particles.createEmitter({
    speed: 200,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD'
  });
  emitter.startFollow(enemy);
  setTimeout(() => {
    particles.destroy();
  }, 1950);

  if (enemyDeathCounter >= 3) {
    this.music.stop();
    this.win.play();
    this.jump.mute = true;
    this.time.removeAllEvents();
    this.physics.pause();
    this.input.keyboard.on('keydown-R', () => {
      this.jump.mute = false;
      score = 0;
      deathCounter = 0;
      enemyDeathCounter = 0;
      this.game_over.stop();
      this.scene.stop();
      this.scene.start("Level1Scene");
    }
    );
  }
}

function startLevel1() {
  this.sound.stopAll();
  this.scene.stop();
  this.scene.start('Level1Scene');
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