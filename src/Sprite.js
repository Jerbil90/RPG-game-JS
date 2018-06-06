function Sprite() {
  this.image = null;
  this.position = {x:0, y:0};
  this.startingPosition = null;
  this.targetPosition = null;
  this.moveStartTime = null;
  this.moveDuration = 0;
  this.isMoving = false;
  this.isNewMove = false;
}
Sprite.prototype.update = function(gameTime, elapsedTime) {
  if(this.isNewMove) {
    this.isNewMove = false;
    this.moveStartTime = gameTime;
  }
  if(this.isMoving) {
    if(gameTime > this.moveStartTime + this.moveDuration) {
      this.isMoving = false;
      this.position = this.targetPosition;
    }
    else {
      let fraction = ((gameTime - this.moveStartTime) / this.moveDuration);
      this.position.x = this.startingPosition.x + fraction * (this.targetPosition.x - this.startingPosition.x);
      this.position.y = this.startingPosition.y + fraction * (this.targetPosition.y - this.startingPosition.y);
    }

  }
}
Sprite.prototype.draw = function(ctx) {
  ctx.drawImage(this.image, this.position.x, this.position.y);
}
Sprite.prototype.setPosition = function(x, y) {
  this.position.x = x;
  this.position.y = y;
}
Sprite.prototype.moveTo = function(x, y, duration) {
  this.startingPosition = this.position;
  this.targetPosition = {x: x, y: y};
  this.moveDuration = duration;
  this.isMoving = true;
  this.isNewMove = true;
}
Sprite.prototype.loadBattleSprite = function() {
    switch(this.owner.role) {
    case "monster":
    this.image = new Image();
    //this.image.src = "C:\Users\Jeremy\Projects\jeremygame\assets\myMonsterSymbol.png";
    this.image.src = "https://raw.githubusercontent.com/Jerbil90/Rpg-Game/master/myMonsterSymbol.png";
    break;
    case "knight":
    this.image = new Image();
    this.image.src = "https://raw.githubusercontent.com/Jerbil90/Rpg-Game/master/myKnightSymbol.png";
    break;
    case "fighter":
    this.image = new Image();
    this.image.src = "https://raw.githubusercontent.com/Jerbil90/Rpg-Game/master/myFighterSymbol.png";
    break;
    default:
    console.log("error loading battle sprites: " + this.name + " has invalid role: " + this.role);
    break;
  }
}

function InitiativeSprite(owner) {
  Sprite.call(this);
  this.owner = owner;
  this.loadBattleSprite();
}
InitiativeSprite.prototype = Object.create(Sprite.prototype);
InitiativeSprite.prototype.constructor = InitiativeSprite;

function BattleSprite(owner) {
  Sprite.call(this);
  this.owner = owner;
  this.loadBattleSprite();
  this.setPassivePosition();
}
BattleSprite.prototype = Object.create(Sprite.prototype);
BattleSprite.prototype.constructor = BattleSprite;
BattleSprite.prototype.setPassivePosition = function() {
  if(this.owner.role == "monster") {
    this.position = {x:450, y:100 + this.owner.partyPosition*50};
  }
  else{
    this.position = {x:150, y:100 + this.owner.partyPosition*50};
  }
}

export {Sprite, InitiativeSprite, BattleSprite}
