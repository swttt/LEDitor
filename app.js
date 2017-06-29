"use strict";
var	Animation = Homey.manager('ledring').Animation,
	frames = [],
	frame = [];

// save version number as setting, so it's available with index.html
Homey.manager('settings').set('version', Homey.manifest.version );

function init() {
	Homey.log('LEDitor v' + Homey.manifest.version + ' started.');
}

// create animation with 1 empty frame
for( var i = 0; i < 24; i ++){ frame.push( { r:0, g:0, b:0 } ); }
frames.push(frame);
var ani = {
	frames	: frames,
	priority: 'INFORMATIVE',
	duration: 1000,
	options	: { fps: 1, tfps: 60, rpm: 0 }
}

// create initial animation object
var animation = new Animation({
	frames  : ani.frames,
	priority: ani.priority,
	duration: ani.duration,
	options : {
		fps : ani.options.fps,
		tfps: ani.options.tfps,
		rpm : ani.options.rpm
	}
});

// register animation object with Homey
animation.register(function(err, result){
	if( err ) return Homey.error(err);
	animation.start();

	animation.on('start', function(){	// The animation has started playing
		Homey.log('Started animation: ' + animation.id );
	})

	animation.on('stop', function(){	// The animation has stopped playing
		Homey.log( 'Stopped animation: ' + animation.id );
	})
})

Homey.manager('settings')
	.on('set', function (setting) {
	switch(setting){
	case 'animation':
		animation.stop();
		ani = Homey.manager('settings').get('animation');
		animation.args = {
			frames    : ani.frames,
			priority  : ani.priority,
			transition: Math.floor( 1000 / ( Number(ani.options.fps) + 1) ),
			duration  : ani.duration,
			options   : { fps: ani.options.fps, tfps: ani.options.tfps, rpm: ani.options.rpm }
		}
		animation.register(function(err, result){
			if( err ) return Homey.error(err);
			animation.start();
		});
		break;

	case 'frame':
		frame = Homey.manager('settings').get('frame');
		frames = []; frames.push(frame);
		animation.updateFrames(frames);
		break;
	}
});


// *************** FLOW **************

Homey.manager("flow")
	.on("action.animation_select.animationSelector.autocomplete",
		function(callback, args) {
			var aniIndex = Homey.manager('settings').get('aniIndex');
			var values = [];
			for( i=0; i<30; i++){
				var xNum = (i+1).toString(); if(xNum.length<2){xNum = '0' + xNum;}
				values[i] = {
					//name: "Animation " + (i+1),
					name: xNum + ': '+ aniIndex[i].name,
					value: i
				}
			}
			callback( null, values );
		}
	);

Homey.manager('flow')
	.on('action.animation_select', function( callback, args ){
	//Homey.log(args);
	var aniId = 'animation' + args.animationSelector.value;
	var aniDuration = args.animationTime * 1000;

	ani = Homey.manager('settings').get(aniId);
	animation.stop();
	animation.args = {
		frames	: ani.frames,
		priority	: 'INFORMATIVE',
		transition	: Math.round( 300 / Number(ani.options.fps)  ),
		duration	: aniDuration,
		options		: { fps: ani.options.fps, tfps: ani.options.tfps, rpm: ani.options.rpm }
	};
	animation.register(function(err, result){
		if( err ) return Homey.error(err);
		animation.start();
	});

	callback( null, true ); // fired successfully
});        

Homey.manager('flow')
	.on('action.animation_stop', function( callback, args ){
	animation.stop();
	callback( null, true ); // fired successfully
});        

module.exports.init = init;



/* ************************************************
- DOC: example registered LED Ring Animation object
***************************************************
Animation {
	args: {
		frames    : [ [Object], [Object], .... ],	// array, containing max 200 frame-arrays, containing 24 pixel-objects { r:int, g:int, b:int }}
		priority  : 'INFORMATIVE',			// CRITICAL, FEEDBACK or INFORMATIVE
		transition: 300,				// transition time between 2 frames ????
		duration  : 1000,				// duration in ms, or '' for infinite
		options   : {
			fps : '1',				// frame change per second
			tfps: '60',				// interpolated frames per second.
			rpm : '0'				// ring rotations per minute
		}
	},
	id: '5352c7db-be14-4b10-9a9d-939023667288',
	_events: { start: [Function], stop: [Function] },
	_eventsCount: 2 }
}
************************************************** */

