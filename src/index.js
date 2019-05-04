import Phaser from "phaser";
import config from './config/config'
import GameScene from './scenes/GameScene';

class Game extends Phaser.Game{
  constructor()
  {
    super(config);
    this.scene.add('Game', GameScene);
    this.scene.start('Game');
  }
}

window.onload = function(){
  window.game = new Game();
  window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}
function resize(){
  let canvas = document.querySelector("canvas");
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let windowRatio = windowWidth / windowHeight;
  let gameRatio = game.config.width / game.config.height;
  if(windowRatio < gameRatio){
      canvas.style.width = windowWidth + "px";
      canvas.style.height = (windowWidth / gameRatio) + "px";
  }
  else{
      canvas.style.width = (windowHeight * gameRatio) + "px";
      canvas.style.height = windowHeight + "px";
  }
}