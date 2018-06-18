
function Stats(owner) {
  this.owner = owner
  this.strength = 0;
  this.toughness = 0;
  this.vigor = 0;
  this.dexterity = 0;
  this.cunning = 0;
  this.spirit = 0;
  this.will = 0;
  this.speed = 0;
  this.load();
}
Stats.prototype.empty = function() {
  this.strength = 0;
  this.toughness = 0;
  this.vigor = 0;
  this.dexterity = 0;
  this.cunning = 0;
  this.spirit = 0;
  this.will = 0;
  this.speed = 0;
}
Stats.prototype.combineStats = function(stats1, stats2) {
  this.strength = stats1.strength + stats2.strength;
  this.toughness = stats1.toughness + stats2.toughness;
  this.vigor = stats1.vigor + stats2.vigor;
  this.dexterity = stats1.dexterity + stats2.dexteriety;
  this.cunning = stats1.cunning + stats2.cunning;
  this.spirit = stats1.spirit + stats2.spirit;
  this.will = stats1.will + stats2.will;
  this.speed = stats1.speed + stats2.speed;
}
Stats.prototype.load = function() {
  var role = this.owner.role;
  switch(role) {
    case "fighter":
    this.loadFighter();
      break;
    case "knight":
    this.loadKnight();
      break;
    case "monster":
      this.loadMonster();
      break;
    case "equipment":
      this.loadEquipment();
      break;
    case "special":
      this.loadSpecial();
      break;
    case "item":
      this.strength = 0;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;

      break;
    case "preemptiveItem":
      this.strength = 0;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = -5;
      break;
    default:
      console.log("error, could not load stats for role: " + role);
      break;
  }
}
Stats.prototype.loadFighter = function() {
  var level = this.owner.currentLV;
  switch(level) {
    case 1:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 4;
    this.speed = 4;
    break;
    case 2:
    this.strength = 9;
    this.toughness = 4;
    this.vigor = 5;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 4;
    this.speed = 5;
    break;
    case 3:
    this.strength = 11;
    this.toughness = 5;
    this.vigor = 6;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 5;
    this.speed = 6;
    break;
    case 4:
    this.strength =  12;
    this.toughness = 7;
    this.vigor = 7;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 6;
    this.speed = 8;
    break;
    case 5:
    this.strength = 13;
    this.toughness = 9;
    this.vigor = 9;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 7;
    this.speed = 9;
    break;
    case 6:
    this.strength = 15;
    this.toughness = 11;
    this.vigor = 11;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 8;
    this.speed = 10;
    break;
    case 7:
    this.strength = 18;
    this.toughness = 13;
    this.vigor = 12;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 9;
    this.speed = 12;
    break;
    case 8:
    this.strength = 20;
    this.toughness = 16;
    this.vigor = 15;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 10;
    this.speed = 13;
    break;
    case 9:
    this.strength = 23;
    this.toughness = 19;
    this.vigor = 17;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 12;
    this.speed = 15;
    break;
    case 10:
    this.strength = 26;
    this.toughness = 22;
    this.vigor = 20;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 14;
    this.speed = 17;
    break;
    case 11:
    this.strength = 29;
    this.toughness = 25;
    this.vigor = 23;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 15;
    this.speed = 20;
    break;
    case 12:
    this.strength = 34;
    this.toughness = 27;
    this.vigor = 24;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 16;
    this.speed = 24;
    break;
    case 13:
    this.strength = 37;
    this.toughness = 30;
    this.vigor = 28;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 20;
    this.speed = 28;
    break;
    case 14:
    this.strength = 41;
    this.toughness = 33;
    this.vigor = 32;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 32;
    break;
    case 15:
    this.strength = 46;
    this.toughness = 36;
    this.vigor = 36;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 36;
    break;
  }
}
Stats.prototype.loadKnight = function() {
  var level = this.owner.currentLV;
  switch(level) {
    case 1:
    this.strength = 6;
    this.toughness = 4;
    this.vigor = 5;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 2;
    this.speed = 3;
    break;
    case 2:
    this.strength = 8;
    this.toughness = 5;
    this.vigor = 6;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 3;
    this.speed = 4;
    break;
    case 3:
    this.strength = 10;
    this.toughness = 5;
    this.vigor = 6;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 4;
    this.speed = 6;
    break;
    case 4:
    this.strength = 12;
    this.toughness = 7;
    this.vigor = 8;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 5;
    this.speed = 7;
    break;
    case 5:
    this.strength = 14;
    this.toughness = 9;
    this.vigor = 10;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 6;
    this.speed = 8;
    break;
    case 6:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 8;
    this.speed = 4;
    break;
    case 7:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 8:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 9:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 10:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 11:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 12:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 13:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 14:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
    case 15:
    this.strength = 8;
    this.toughness = 3;
    this.vigor = 4;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 4;
    break;
  }
}
Stats.prototype.loadMonster = function() {
  var monster = this.owner.name;
  switch(monster) {
    case "Wolf":
      this.strength = 8;
      this.toughness = 3;
      this.vigor = 2;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
      case "Snake":
      this.strength = 5;
      this.toughness = 2;
      this.vigor = 2;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 4;
      break;
      case "Highwayman":
      this.strength = 12;
      this.toughness = 5;
      this.vigor = 4;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 6;
      break;
      case "Mr Snips":
      this.strength = 12;
      this.toughness = 4;
      this.vigor = 5;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 8;
      break;
      case "Zombie Sailor":
      this.strength = 12;
      this.toughness = 5;
      this.vigor = 5;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
      case "Zombie Pirate":
      this.strength = 15;
      this.toughness = 6;
      this.vigor = 7;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 8;
      break;
      default:
      console.log("Error in Stats.loadmonster, invalid name");
      break;
  }
}
Stats.prototype.loadEquipment = function() {
  var type = this.owner.type;
  switch(type) {
    case "emptyEquipment":
    this.strength = 0;
    this.toughness = 0;
    this.vigor = 0;
    this.dexterity = 0;
    this.cunning = 0;
    this.spirit = 0;
    this.will = 0;
    this.speed = 0;
    break;
    case "sword":
    this.loadSword();
    break;
    case "lightBodyArmour":
    this.loadLightBodyArmour();
    break;
    case "heavyBodyArmour":
    this.loadHeavyBodyArmour();
    break;
    case "lightHelm":
    this.loadLightHelm();
    break;
    case "heavyHelm":
    this.loadHeavyHelm();
    break;
    case "lightHandArmour":
    this.loadLightHandArmour();
    break;
    case "heavyHandArmour":
    this.loadHeavyHandArmour();
    break;
    case "lightFootArmour":
    this.loadLightFootArmour();
    break;
    case "heavyFootArmour":
    this.loadHeavyFootArmour();
    break;
    case "greatSword":
    this.loadGreatSword();
    break;
    case "shield":
    this.loadShield();
    break;
    default:
      console.log("loadEquipment error, invalid type");
      break;
  }
}
Stats.prototype.loadSword = function () {
  var name = this.owner.name;
  switch(name) {
      case "Iron Sword":
        this.strength = 2;
        this.toughness = 0;
        this.vigor = 0;
        this.dexterity = 0;
        this.cunning = 0;
        this.spirit = 0;
        this.will = 0;
        this.speed = 0;
      break;
    case "Steel Sword":
        this.strength = 4;
        this.toughness = 0;
        this.vigor = 0;
        this.dexterity = 0;
        this.cunning = 0;
        this.spirit = 0;
        this.will = 0;
        this.speed = 0;
      break;
    default:
      console.log("loadSword error, invalid name");
      break;
    }
}
Stats.prototype.loadGreatSword = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadGreatSword, invalid name")
    break;
  }
}
Stats.prototype.loadShield = function() {
  var name = this.owner.name;
  switch(name) {
    case "Battered Shield":
    this.toughness = 1;
    break;
    default:
      console.log("error in loadShield, invalid name");
    break;
  }
}
Stats.prototype.loadLightBodyArmour = function() {
  var name = this.owner.name;
  switch(name) {
    case"Leather Body Armour":
    this.vigor = 1;
    break;
    default:
      console.log("error in loadLightBodyArmour, invalid name")
    break;
  }
}
Stats.prototype.loadHeavyBodyArmour = function() {
  var name = this.owner.name;
  switch(name) {
    case"Smelly Scale Mail":
    this.vigor = 1;
    this.toughness = 1;
    default:
      console.log("error in loadHeavyBodyArmour, invalid name")
    break;
  }
}
Stats.prototype.loadLightHandArmour = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadLightHandArmour, invalid name")
    break;
  }
}
Stats.prototype.loadHeavyHandArmour = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadHeavyHandArmour, invalid name")
    break;
  }
}
Stats.prototype.loadLightFootArmour = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadLightFootArmour, invalid name")
    break;
  }
}
Stats.prototype.loadHeavyFootArmour = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in LoadHeavyFootArmour, invalid name")
    break;
  }
}
Stats.prototype.loadLightHelm = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadLightHelm, invalid name")
    break;
  }
}
Stats.prototype.loadHeavyHelm = function() {
  var name = this.owner.name;
  switch(name) {
    default:
      console.log("error in loadHeavyHelm, invalid name")
    break;
  }
}

Stats.prototype.loadSpecial = function() {
  var name = this.owner.name;
  switch(name) {
    case "Power Strike":
      this.strength = 3;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 0;
      break;
    case "Wind Slash":
      this.strength = 1;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 3;
      break;
    case "Guard Ally":
      this.strength = 0;
      this.toughness = 2;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
    case "Block Opponent":
      this.strength = 0;
      this.toughness = 2;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
    default:
      console.log("loadPower error, invalid name");
      break;
  }
}

function CombatStats(owner) {
  Stats.call(this, owner);
  this.empty();
}
CombatStats.prototype = Object.create(Stats.prototype);
CombatStats.prototype.constructor = CombatStats;

function EquippedStats(owner) {
  Stats.call(this, owner);
  this.empty();
}
EquippedStats.prototype = Object.create(Stats.prototype);
EquippedStats.prototype.constructor = EquippedStats;

export {Stats, CombatStats, EquippedStats}
