"use strict";var Assets={};Assets.preload=function(s){var a=R.range(1,55);R.forEach(function(a){s.load.image("cursor"+a,"/img/cursors/"+a+".png")})(a),s.load.image("table","/assets/table_low.jpg"),s.load.image("stack1","/assets/stack1.png"),s.load.image("stack2","/assets/stack2.png"),s.load.image("save","/assets/save.png"),s.load.image("move","/assets/move.png"),s.load.image("load","/assets/load.png"),s.load.image("rotate","/assets/rotate.png"),s.load.image("soldier","/assets/soldier.png"),s.load.image("farmer","/assets/farmer.png"),s.load.spritesheet("pieces","/assets/pieces.png",64,64,19),s.load.atlasXML("diceWhite","/assets/diceWhite.png","/assets/diceWhite.xml"),s.load.spritesheet("button","/assets/button_sprite_sheet.png",193,71),s.load.atlasJSONHash("tile","/assets/carcassoneSheet.png","/assets/carcassone.json")};