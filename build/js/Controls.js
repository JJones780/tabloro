"use strict";var Controls={},cursors;Controls.add=function(){Controls.controls=game.add.group(),Controls.controls.position.set(-100);var o=Controls.controls.create(0,0,"rotate");o.scale.set(.7),T.centerAnchor(o),o.inputEnabled=!0,o.input.useHandCursor=!0,o.events.onInputUp.add(T.onRotate),Cursor.reset(o)},Controls.at=function(o){Controls.controls.visible=!0,Utils.toCorner(Controls.controls,o)},Controls.hide=function(o){o?Controls.target===o&&(Controls.controls.visible=!1):Controls.controls.visible=!1},Controls.cursors=function(){game.input.keyboard.createCursorKeys()};