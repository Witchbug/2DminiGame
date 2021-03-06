/// <reference path="../typings/phaser.d.ts"/>
import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',
  scale: {
    width: 500,
    height: 320,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Render the image after scaling 
  render: {
    pixelArt: true
  },
  // telling the phaser that I will use Arcade physics engine 
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 750},
      debug: false,
      debugShowVelocity: true,
      debugShowBody: true,
      debugShowStaticBody: true
    }
  }
};
