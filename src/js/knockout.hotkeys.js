/*
* Knockout Hotkeys Plugin
* Copyright 2012, Matt Brailsford
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* Based upon the jquery plugin by John Resig:
* https://github.com/jeresig/jquery.hotkeys/
*
* Original idea by:
* Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
*/
var hotkeyHandlerShortcuts = ['keydown', 'keyup', 'keypress']
ko.utils.arrayForEach(hotkeyHandlerShortcuts, function(eventName) {
    ko.bindingHandlers["hot" + eventName] = {
        'init': function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['_hotkey']['init'].call(this, element, newValueAccessor, allBindingsAccessor, viewModel);
        }
    }
});

ko.bindingHandlers._hotkey = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
		var value = valueAccessor();
		for(var eventNameOutsideClosure in value){
			(function() {
				var eventName = eventNameOutsideClosure;
				var val = value[eventName];
				if(val.constructor != Array) val = [val];
				var valLength = val.length;
				for(var idxOutsideClosure = 0; idxOutsideClosure < valLength; idxOutsideClosure++){
					(function() {
						var idx = idxOutsideClosure;
						var innerVal = val[idx];
						
						// Get the hotkey combination
						var hotkey, handlerFunction;
						if("key" in innerVal && "do" in innerVal)
						{
							hotkey = innerVal["key"];
							handlerFunction = innerVal["do"];
						}
						else
						{
							for(var keyName in innerVal) {
								if(keyName !== "if") {
									hotkey = keyName;
									handlerFunction = innerVal[keyName];
									break;	
								}
							}
						}
						
						if(hotkey === undefined || handlerFunction === undefined)
							return;
						
						// Format the hotkey into a parsable format
						hotkey = hotkey.toLowerCase().replace("+", "");
						
						ko.utils.registerEventHandler(ko.hotkeys.defaultOptions.bindElement, eventName, function (event) {

							// Keypress represents characters, not special keys
							var special = event.type !== "keypress" && ko.hotkeys.keymap.specialKeys[ event.which ],
							character = String.fromCharCode( event.which ).toLowerCase(),
							key, modif = "", possible = {};
							
							// check combinations (alt|ctrl|shift+anything)
							if ( event.altKey && special !== "alt" ) {
								modif += "alt";
							}
							
							if ( event.ctrlKey && special !== "ctrl" ) {
								modif += "ctrl";
							}
							
							// TODO: Need to make sure this works consistently across platforms
							if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
								modif += "meta";
							}
							
							if ( event.shiftKey && special !== "shift" ) {
								modif += "shift";
							}
							
							if ( special ) {
								possible[ modif + special ] = true;
							
							} else {
								possible[ modif + character ] = true;
								possible[ modif + ko.hotkeys.keymap.shiftNums[ character ] ] = true;
							
								// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
								if ( modif === "shift" ) {
									possible[ ko.hotkeys.keymap.shiftNums[ character ] ] = true;
								}
							}

							if (possible[ hotkey ]) {
								
								var handlerReturnValue;
								
								try {
									if(!("if" in innerVal) || ko.utils.unwrapObservable(innerVal["if"])) // Only apply the handler function if the "if" statement passes
										handlerReturnValue = handlerFunction.apply(viewModel, [viewModel, event]);
								} finally {
									if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
										if (event.preventDefault)
											event.preventDefault();
										else
											event.returnValue = false;
									}
								}
								
								var bubble = allBindings[eventName + 'Bubble'] !== false;
								if (!bubble) {
									event.cancelBubble = true;
									if (event.stopPropagation)
										event.stopPropagation();
								}
								
							}
							
						});
						
					})();
				}
			})();
		}
    }
};

ko.hotkeys = ko.hotkeys || {};
ko.hotkeys.defaultOptions = {
	bindElement: window
}
ko.hotkeys.keymap = {
	specialKeys: {
		8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
		20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
		96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
		104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
		112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
		120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
	},
	shiftNums: {
		"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
		"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
		".": ">",  "/": "?",  "\\": "|"
	}
}