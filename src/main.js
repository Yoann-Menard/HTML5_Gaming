const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  heigth: 600,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Level1Scene, Level2Scene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: true,
    },
  }
};

const game = new Phaser.Game(config);