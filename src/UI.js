import {Sprite, InitiativeSprite, BattleSprite} from './Sprite'

function DamageDisplay(damageDealt, position) {
  this.damageDealt = damageDealt;
  this.color = "rgb(250, 250, 250)"
  this.hasBounced = false;
  if(damageDealt < 0) {
    this.damageDealt *= -1;
    this.color = "rgb(46, 172, 32)";
  }
  this.unitPosition = position;
  //given position will refer to the units poition so the text needs to be centered properly
  this.position = {x: position.x + 16, y: position.y};
  this.velocity = -50;
  this.acceleration = 200;
  this.landingTime = null;
  this.hasLanded = false;
  this.isExpired = false;
}
DamageDisplay.prototype.update = function(gameTime, elapsedTime) {
  if(!this.hasLanded) {
    this.position.y += (this.velocity*elapsedTime)/1000;
    this.velocity += (this.acceleration*elapsedTime)/1000;
    if((this.position.y >= this.unitPosition.y) && (!this.hasBounced)) {
      this.position.y = this.unitPosition.y;
      this.velocity *= -0.5;
      this.hasBounced = true;

    }
    else if(this.position.y >= this.unitPosition.y && this.hasBounced){
      this.position.y = this.unitPosition.y;
      this.velocity = 0;
      this.acceleration = 0;
      this.landingTime = gameTime;
      this.hasLanded = true;
    }
  }
  else {
    if(gameTime > this.landingTime + 1000) {
      this.isExpired = true;
    }
  }
}
DamageDisplay.prototype.draw = function(ctx) {
  ctx.fillStyle = this.color
  ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.lineWidth = 2;
  ctx.font="30px Arial";
  ctx.fillText(this.damageDealt, this.position.x, this.position.y);
  ctx.strokeText(this.damageDealt, this.position.x, this.position.y);
}

function InitiativeDisplay(surManager) {
  this.surManager = surManager;
  this.currentState = "passive";
  this.unitList = null;
  this.initiativeSpriteArray = null;
  this.switchingStartTime = null;
  this.currentTurnOrder = [];
}
InitiativeDisplay.prototype.update = function(gameTime, elapsedTime) {
  let i = 0;
  if(this.initiativeSpriteArray != null) {
    for(i = 0 ; i < this.initiativeSpriteArray.length; i++) {
      if(this.initiativeSpriteArray[i] != null) {
        this.initiativeSpriteArray[i].update(gameTime, elapsedTime);
      }

    }
  }
  else {
    this.unitList = [];
    for(i=0; i<this.surManager.heroManager.assetList.length; i++) {
      if( this.surManager.heroManager.assetList[i].isAlive) {
        this.unitList.push(this.surManager.heroManager.assetList[i]);
      }
    }
    for(i = 0 ; i<this.surManager.monsterManager.assetList.length ; i++) {
      if(this.surManager.monsterManager.assetList[i].isAlive) {
        this.unitList.push(this.surManager.monsterManager.assetList[i]);
      }
    }
    this.initiativeSpriteArray = [];
    for(i=0;i<this.unitList.length;i++) {
      let initiativeSprite = new InitiativeSprite(this.unitList[i]);
      this.unitList[i].initiativeSprite = initiativeSprite;
      this.initiativeSpriteArray.push(initiativeSprite);
    }
  }
  switch(this.currentState) {
    case "passive" :
      this.refresh();
      break;
	  case "switching" :
	  this.updatePositions(gameTime, elapsedTime);
    if(this.switchingStartTime == null) {
      this.switchingStartTime = gameTime;
    }
    else {
      if (gameTime > this.switchingStartTime  + 1000) {
        this.switchingStartTime = null;
        this.currentState = "passive";
      }
    }
	  break;
	  default:
	  console.log("Error, Initiativedisplay current state is invalid");
	  break;
  }

  for(i=0;i<this.unitList.length;i++) {
    if(!this.unitList[i].isAlive){
      this.initiativeSpriteArray[i] = null;
    }
  }
}
InitiativeDisplay.prototype.updatePositions = function(gameTime, elapsedTime) {
	let i = 0;
	for(i=0 ; i<this.currentTurnOrder ; i++) {

	}
}
InitiativeDisplay.prototype.refresh = function() {
  //this.currentTurnOrder = [];
  let newTurnOrder = [];
  let topSpeed = 0;
  let i = 0;
  for(i=0;i<this.unitList.length;i++){
    if(this.unitList[i].combatStats.speed>topSpeed) {
      topSpeed = this.unitList[i].combatStats.speed;
    }
  }
  i=0;
  let j = 0;
  let k = topSpeed;
  while(i<this.unitList.length) {
    let unitsAtThisSpeed = [];
    for(j = 0 ; j < this.unitList.length ; j++) {
      if(this.unitList[j].combatStats.speed == k) {
        if(this.unitList[j].isAlive) {
          unitsAtThisSpeed.push(this.unitList[j]);
        }

        i++;
      }
    }
    if(unitsAtThisSpeed.length != 0) {
      newTurnOrder.push(unitsAtThisSpeed);
    }
    k--;
  }

  if(!this.compareOrder(newTurnOrder, this.currentTurnOrder)) {
    this.currentTurnOrder = newTurnOrder;
    this.currentState = "switching";
    //this.switchingStartTime = null this is set in the update method at the end of a switch
    for(i = 0 ; i < this.currentTurnOrder.length ; i++) {
      for(j = 0 ; j < this.currentTurnOrder[i].length ; j++) {
        this.currentTurnOrder[i][j].initiativeSprite.moveTo(40*i, 40*j, 1000);
      }
    }
  }
}
InitiativeDisplay.prototype.compareOrder = function(newTurnOrder, oldTurnOrder) {
  let i = 0;
  let j = 0;
  var test = true;
  for(i = 0 ; i < newTurnOrder.length ; i++) {
    for(j = 0 ; j < newTurnOrder[i].length ; j++) {
      if(oldTurnOrder[i] != null) {
        if(oldTurnOrder[i][j] != null) {
          if(newTurnOrder[i][j].name != oldTurnOrder[i][j].name) {
            test = false;
          }
        }
        else {
          test = false;
        }
      }
      else {
        test = false;
      }
    }
  }
  return test;
}

export {DamageDisplay, InitiativeDisplay}
