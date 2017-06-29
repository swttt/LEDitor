// ==================== Pattern generators ====================

function generateSolid( colRGB, colRGB2, colRGB3 ) {
	var	genFrames = [],
		genFrame = [],
		genColor = colRGB;

	if(inGenFrame == undefined){
		var totalFrames = 30;
	} else {
		var totalFrames = inGenFrame.value;
	}

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // Color flow
		genFrames = generateFlow(totalFrames/6);
	} else {
		if( colRGB2 == ''){
			var col = [colRGB];
		} else {
			var col = getColorFlow( totalFrames, colRGB, colRGB2 );
		}

		// for every frame...
		for( var fr = 0; fr < col.length; fr++ ){
			var genFrame = [];
			var genColor = col[fr];
			// for every pixel...
			for( var pixel = 0; pixel < 24; pixel++ ) {
				genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
			}
			genFrames.push(genFrame);
		}
	}
	return genFrames;
}

function generateFlow() {
	var 	genFrames = [],
		col = [];

	if(inGenFrame == undefined){
		var totalFrames = 30;
	} else {
		var totalFrames = inGenFrame.value;
	}
	col = getColorFlow(totalFrames);

	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var	genFrame = [],
			genColor = col[fr];
		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateFlash( colRGB, colRGB2, colRGB3) {
	var genFrames = [];

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	// for every frame...
	for( var fr = 0; fr < 32; fr++ ){
		var genFrame = [];
		if( fr == 2 ){
			var genColor = colRGB;
		} else if( colRGB2 != '' && fr == 6 ){
			var genColor = colRGB2;
		} else {
			var genColor = colRGB3;
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateBreathe( colRGB, colRGB2, colRGB3 ) {
	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}


	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // full flow
		var nCycle = 6;
	} else { // fixed color or duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * 8;
	} else {
		var totalFrames = inGenFrame.value;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // full flow
		var col = getColorFlow(totalFrames);
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i < totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow(totalFrames, colRGB, colRGB2);
		}
	}

	var 	genFrames = [],
		stepValBreath = 1 / (col.length / nCycle / 2),
		valBreath = 1;
	for( var fr = 0; fr < col.length; fr ++ ){
		var	genFrame = [],
			cR = Math.floor(col[fr][0] * (valBreath * 0.96 + 0.04) ), 
			cG = Math.floor(col[fr][1] * (valBreath * 0.96 + 0.04) ), 
			cB = Math.floor(col[fr][2] * (valBreath * 0.96 + 0.04) ), 
			genColor = [ cR, cG, cB ];

			valBreath -= stepValBreath;
			if( valBreath < 0 ){
				valBreath = 0; //-valBreath;
				stepValBreath = -stepValBreath;
			} else if( valBreath > 1 ){
				valBreath = 1; //2 - valBreath;
				stepValBreath = -stepValBreath;
			}

		for( var pixel = 0; pixel < 24; pixel ++ ){
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateRandomColors() {
	var genFrames = [];

	// for every frame...
	for( var fr = 0; fr < 60; fr++ ){
		var genFrame = [];

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var genColor = [0, 0, 0];
			if(Math.floor( pixel/4)*4 == pixel){
				color = [Math.floor(Math.random()*4)*85 , Math.floor(Math.random()*4)*85 , Math.floor(Math.random()*4)*85 ];
				if(color[0] > 0 && genColor[1] > 0 && genColor[2] > 0){
					color[Math.floor(Math.random()*3)] = 0;
				}
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateSparkle( colRGB, colRGB2, colRGB3 ) {
	var	genFrames = [],
		nFrame = 30;

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // full flow
		var nCycle = 6;
	} else { // fixed color or duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * 30;
	} else {
		var totalFrames = inGenFrame.value;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // full flow
		var col = getColorFlow( totalFrames );
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i< totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow( totalFrames, colRGB, colRGB2 );
		}
	}
	if(checkRandomColors.checked){colRGB = [ -1, -1, -1 ]; }

	var genFrames = [];
	for( var fr = 0; fr < col.length; fr ++ ){
		var	genFrame = [],
			dots = [ Math.floor(Math.random() * 8) , Math.floor(Math.random() * 8) , Math.floor(Math.random() * 8) ];

		for( var pixel = 0; pixel < 24; pixel++ ) {
			var genColor = colRGB3.slice(0);
			if( pixel == dots[0] || pixel == dots[1] + 8 || pixel == dots[2] + 16 ){
				var dat = Math.floor(Math.random() * 255) + 1;
				for( var i=0; i<3; i++) {
					if( colRGB[i] >= 0 ){
						genColor[i] = Math.round(col[fr][i]/255 * dat);
					}else{
						genColor[i] = Math.floor( Math.random() * 4) *85;
					}
				}
				if( colRGB == [-1,-1,-1] && ( genColor[0] > 0 && genColor[1] > 0 && genColor[2] > 0 ) ){
					genColor[Math.floor(Math.random()*3)] = 0;
				}
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateSatellite( colRGB, colRGB2, colRGB3 ) {
	var genFrames = [];

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(checkRandomColors.checked){colRGB = [ -1, -1, -1 ]; }


	if(inGenFrame == undefined){
		var totalFrames = 30;
	} else {
		var totalFrames = inGenFrame.value;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow(totalFrames);
	} else if(colRGB[0] == -1 && colRGB[1] == -1 && colRGB[2] == -1){ // random colors
		var col = getRandomColors(totalFrames);
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = [colRGB];
		} else { // duo flow
			var col = getColorFlow(totalFrames, colRGB, colRGB2);
		}
	}

	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var genFrame = [];

		// for every pixel...
		for( var pix = 0; pix < 24; pix++ ) {
			var pixel = pix + 3; if(pixel > 23){ pixel -= 24;}

			if( pixel == 0 ) { var genColor = col[fr]; } else  { var genColor = colRGB3.slice(0); }
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateLighthouse( colRGB, colRGB2, colRGB3 ){
	var genFrames = [];

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(checkRandomColors.checked){colRGB = [ -1, -1, -1 ]; }

	if(inGenFrame == undefined){
		var totalFrames = 30;
	} else {
		var totalFrames = inGenFrame.value;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow(totalFrames);
	} else if(colRGB[0] == -1 && colRGB[1] == -1 && colRGB[2] == -1){ // random colors
		var col = getRandomColors(totalFrames);
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = [colRGB];
		} else { // duo flow
			var col = getColorFlow(totalFrames, colRGB, colRGB2);
		}
	}

	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var genFrame = [];

		// for every pixel...
		for( var pix = 0; pix < 24; pix++ ) {
			var pixel = pix + 3; if(pixel > 23){ pixel -= 24;}

			if( pixel == 6 || pixel == 18 ) { var genColor = col[fr]; } else  { var genColor = colRGB3.slice(0); }
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateClockwork( colRGB, colRGB2, colRGB3 ){
	var	genFrames = [],
		nFrame = 24;

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var nCycle = 6;
	} else { // fixed color or duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * nFrame;
	} else {
		var totalFrames = inGenFrame.value
		nFrame = totalFrames / nCycle;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow(totalFrames);
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i< totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow(totalFrames, colRGB, colRGB2);
		}
	}


	var pixShift = 24 / ( col.length / nCycle / 2 - 1);
	var pixPos = 0;
	var lastCycle = -1;
	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var genFrame = [];

		var cycle = Math.floor( fr / nFrame );
		if( cycle > lastCycle ){
			lastCycle = cycle;
			var pixShift = 24 / ( col.length / nCycle / 2 - 1);
			pixPos = 0;
		}

		var px = Math.round( pixPos + 3 ); while( px > 23 ){ px -=24; }
		var px2 = px + 12; while( px2 > 23 ){ px2 -=24; }

		pixPos += pixShift;
		if( pixPos >= 24 ){
			pixPos = 24;
			pixShift = -pixShift;

		} else if( pixPos <= 0 ){
			pixPos = 0;
			pixShift = -pixShift;
		}


		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			if( pixel == px || pixel == px2 ){
				var genColor = col[fr];
			} else {
				var genColor = colRGB3.slice(0);
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateButterfly( colRGB, colRGB2, colRGB3 ){
	var	genFrames = [],
		nFrame = 18;

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}


	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var nCycle = 6;
	} else { // fixed color or duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * nFrame;
	} else {
		var totalFrames = inGenFrame.value;
		nFrame = totalFrames / nCycle;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow( totalFrames );
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i< totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow( totalFrames, colRGB, colRGB2);
		}
	}


	var pixShift = 5/(nFrame/3);
	var pixPos = 0;
	var levelShift = 0.95/(nFrame/3);
	var levelVal = 1;
	var lastCycle = -1;
	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var genFrame = [];
			
			cycle = Math.floor( fr / nFrame );
			if( cycle > lastCycle ){
				lastCycle = cycle;
				pixShift = 5/(nFrame/3);
				pixPos = 0;
				levelShift = 1/(nFrame/3);
				levelVal = 1;
			}

			var p1 = 6 - Math.round(pixPos), p2 = 6 + Math.round(pixPos);
			var p3 = 18 - Math.round(pixPos), p4 = 18 + Math.round(pixPos);


		
		genColor = col[fr];
		genColor = [Math.round(genColor[0] * levelVal ), Math.round(genColor[1] * levelVal), Math.round(genColor[2] * levelVal)];


			pixPos += pixShift;
			if(pixPos >= 5){
				pixPos = 5;
				pixShift = -pixShift;
			}
			if(pixPos < 0){
				pixPos = 0;
				pixShift = 0;
			} else if( pixPos == 0 ){
				pixShift = 0;
				levelVal -= levelShift;
				if( levelVal <= 0.05 ){
					levelVal = 0.05;
					levelShift = -levelShift;
				}
				if( levelVal >= 1 ){
					levelVal = 1;
					levelShift = 0;
				}
			}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var genColor = colRGB3.slice(0);
			var px = pixel + 3; if( px > 23 ){px -= 24;}

			if( (( px >= p1) && ( px <= p2 )) || (( px >= p3) && ( px <= p4 )) ){
				genColor = col[fr];
				genColor = [Math.round(genColor[0] * levelVal ), Math.round(genColor[1] * levelVal), Math.round(genColor[2] * levelVal)];
				if(px != p1 && px != p2 && px != p3 && px != p4){
					genColor = [Math.round(genColor[0] / 2), Math.round(genColor[1] / 2), Math.round(genColor[2] / 2)];
				}
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateTriangle( colRGB, colRGB2, colRGB3 ) {
	var	genFrames = [],
		genFrame = [];


	if( colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0 ){
		colRGB2=[255 - colRGB[0], 255 - colRGB[1], 255 - colRGB[2]];
	}
	if( colRGB3[0] == 0 && colRGB3[1] == 0 && colRGB3[2] == 0 ){
		colRGB3=[ colRGB[0] + (colRGB2[0] - colRGB[0])/2, colRGB[1] + (colRGB2[1] - colRGB[1])/2, colRGB[2] + (colRGB2[2] - colRGB[2])/2];
		var maxVal = 0;
		colRGB3.forEach(function(index){
			if( colRGB3[index] > maxVal ){ maxVal = colRGB3[index];}
		});
		if( maxVal > 255 ){
			colRGB3[0] = colRGB3[0] * ( 255 / maxVal );
			colRGB3[1] = colRGB3[1] * ( 255 / maxVal );
			colRGB3[2] = colRGB3[2] * ( 255 / maxVal );
		}
		colRGB3[0] = Math.round( colRGB3[0] );
		colRGB3[1] = Math.round( colRGB3[1] );
		colRGB3[2] = Math.round( colRGB3[2] );
	}

	// for every pixel...
	for( var pixel = 0; pixel < 24; pixel += 1 ) {
		var genColor = [ 0, 0, 0 ];
		if( pixel == 0){ genColor = colRGB; }
		if( pixel == 8){ genColor = colRGB2; }
		if( pixel == 16){ genColor = colRGB3; }
		genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
	}
	genFrames.push(genFrame);
	return genFrames;
}

function generatePulsetrain( colRGB, colRGB2, colRGB3 ) {
	var	genFrames = [],
		nFrame = 32;

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var nCycle = 6;
	} else { // fixed color or  duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * nFrame;
	} else {
		var totalFrames = inGenFrame.value;
		nFrame = totalFrames / nCycle;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow( totalFrames );
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i< totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow( totalFrames, colRGB, colRGB2);
		}
	}

	var stepLevel = 0.95 / nFrame * 2;
	var valLevel = 1;
	var lastCycle = -1;
	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var genFrame = [];
		var cycle = Math.floor( fr / nFrame );
		if( cycle > lastCycle ){
			lastCycle = cycle;
			stepLevel = 0.95 / nFrame * 2;
			valLevel = 1;
		}

		genColor = [ Math.round(col[fr][0] * valLevel), Math.round(col[fr][1] * valLevel), Math.round(col[fr][2] * valLevel) ];

		valLevel -= stepLevel;
		if( valLevel >= 1 ){
			valLevel = 1;
			stepLevel = -stepLevel;
		} else if( valLevel <= 0.05 ){
			valLevel = 0.05;
			stepLevel = -stepLevel;
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel += 1 ) {
			if( Math.floor(pixel/4)*4 == pixel){
				genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
			} else {
				genFrame.push({ r: colRGB3[0], g: colRGB3[1], b: colRGB3[2] });
			}
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateFrontpulse( colRGB, colRGB2, colRGB3 ) {
	var	genFrames = [],
		colpix = [],
		divR = colRGB[0]/255,
		divG = colRGB[1]/255,
		divB = colRGB[2]/255; 

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var nCycle = 6;
	} else { // fixed color or  duo flow
		if(colRGB2 == ''){ var nCycle = 1; } else { var nCycle = 2; }
	}

	if(inGenFrame == undefined){
		var totalFrames = nCycle * nFrame;
	} else {
		var totalFrames = inGenFrame.value;
		nFrame = totalFrames / nCycle;
	}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow( totalFrames );
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = []; for(var i = 0; i< totalFrames; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow( totalFrames, colRGB, colRGB2);
		}
	}


	var pixShift = 12 / nFrame;
	var pixPos = 0;
	var stepLevel = 1 / nFrame;
	var valLevel = 1;
	var lastCycle = -1;
	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var	genFrame = [];

		var cycle = Math.floor( fr / nFrame );
		if( cycle > lastCycle ){
			lastCycle = cycle;
			stepLevel = 1 / nFrame;
			valLevel = 1,
			pixShift = 12 / nFrame;
			pixPos = 0;
		}
		
		var xLevel = Math.pow( valLevel, 2 );
		genColor = [ Math.round(col[fr][0] * xLevel), Math.round(col[fr][1] * xLevel), Math.round(col[fr][2] * xLevel) ];

		valLevel -= stepLevel;
		if( valLevel <= 0 ){
			valLevel = 0;
			stepLevel = 0;
		}

		var pix1 = 21 + Math.round( pixPos ); if( pix1 > 23 ){ pix1 -= 24; }
		var pix2 = 21;
		var pix3 = 21 - Math.round( pixPos );

		pixPos += pixShift;
		if( pixPos > 13 ){
			pixPos = 0;
			pixShift = 0;
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var colpix = colRGB3.slice(0);

			if( ( pixel == pix1 ) || ( pixel == pix3 ) ){
				colpix = genColor.slice(0);
				if( pixel == 21 ){ colpix = [ colpix[0] + 32, colpix[1] + 32, colpix[2] + 32 ]; }
				if( colpix[0] > 255 ) {colpix[0] = 255;}
				if( colpix[1] > 255 ) {colpix[1] = 255;}
				if( colpix[2] > 255 ) {colpix[2] = 255;}
			}else{
				if( pixel == 21 ){ colpix = genColor.slice(0);}
			}
			genFrame.push({ r: colpix[0], g: colpix[1], b: colpix[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generatePulsar( colRGB, colRGB2, colRGB3 ) {
	var genFrames = [];

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow(24);
	} else {
		if(colRGB2 == ''){ // fixed color
			var col = [colRGB]; for(var i = 0; i<24; i++){ col.push(colRGB); }
		} else { // duo flow
			var col = getColorFlow(48, colRGB, colRGB2);
		} 
	}

	// for every frame...
	for( var fr = 0; fr < 24; fr++ ){
		var genFrame = [];

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var	genColor = colRGB3.slice(0),
				px = pixel + 3; if( px > 23 ){px -= 24;}
			
			if( fr<12 ){
				if( px >= 0 && px <= fr ){
					genColor = col[fr];
				} else if( px <= 24 && px >= 24-fr ){
					genColor = col[fr];
				}
			} else {
				if( px >= fr-11 && px <= 12 ){
					genColor = col[fr];
				} else if( px < 36-fr && px >= 12 ){
					genColor = col[fr];
				}
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	// 50% off
	for( var fr = 0; fr < 24; fr++ ){
		var genFrame = [];
		for( var pixel = 0; pixel < 24; pixel++ ) {
			genFrame.push({ r: colRGB3[0], g: colRGB3[1], b: colRGB3[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateOncoming( colRGB1, colRGB2, colRGB3 ) {
	var genFrames = [];

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}


	if( colRGB2 == '' ){
		colRGB2=[255 - colRGB1[0], 255 - colRGB1[1], 255 - colRGB1[2]];
	}

	// for every frame...
	for( var fr = 0; fr < 24; fr++ ){
		var	genFrame = [],
			pixnum1 = fr,
			pixnum2 = 24 - fr; if( pixnum2 > 23 ){ pixnum2 -= 24; }

		// for every pixel...
		for( var pix = 0; pix < 24; pix++ ) {
			var pixel = pix + 3; if(pixel > 23){ pixel -= 24;}
			var genColor = colRGB3.slice(0);

			if( ( pixel == pixnum1 ) ){
				genColor[0] += colRGB1[0];
				genColor[1] += colRGB1[1];
				genColor[2] += colRGB1[2];
			}
			if( ( pixel == pixnum2 ) ){
				genColor[0] += colRGB2[0];
				genColor[1] += colRGB2[1];
				genColor[2] += colRGB2[2];
			}
			var colCheck = 1;
			if( genColor[0] > 255) { if( genColor[0] / 255 > colCheck ) { colCheck = genColor[0] / 255; } }
			if( genColor[1] > 255) { if( genColor[1] / 255 > colCheck ) { colCheck = genColor[1] / 255; } }
			if( genColor[2] > 255) { if( genColor[2] / 255 > colCheck ) { colCheck = genColor[2] / 255; } }
			genColor[0] = Math.round( genColor[0] / colCheck );
			genColor[1] = Math.round( genColor[1] / colCheck );
			genColor[2] = Math.round( genColor[2] / colCheck );
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateNewtonian( colRGB1, colRGB2, colRGB3 ) {
	var	genFrames = [],
		nFrame = 60,
		pixnum1 = 0,
		pixnum2 = 12;

	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}


	if( colRGB2 == '' ){
		colRGB2=[255 - colRGB1[0], 255 - colRGB1[1], 255 - colRGB1[2]];
	}

	if(inGenFrame == undefined){
		var totalFrames = nFrame;
	} else {
		var totalFrames = inGenFrame.value;
	}


	// for every frame...
	for( var fr = 1; fr <= totalFrames; fr++ ){
		var genFrame = [];

		sinVal = Math.sin(( (2/totalFrames) * (fr-1) - 0.5 ) * Math.PI);
		if( sinVal < 0 ){
			pixnum1 = Math.round( sinVal * 12);
			if( pixnum1 < 0 ){ pixnum1 += 24; }
			pixnum2 = 0;
		} else if( sinVal > 0 ){
			pixnum2 = Math.round( sinVal * 12);
			if( pixnum2 < 0 ){ pixnum2 += 24; }
			pixnum1 = 0;
		} else {
			pixnum1 = 0;
			pixnum2 = 0;
		}

		pixnum1 -= 3
		pixnum2 -= 3
		if ( pixnum1 < 0 ){ pixnum1 += 24; }
		if ( pixnum2 < 0 ){ pixnum2 += 24; }

		// for every pixel...
		for( var pix = 0; pix < 24; pix++ ) {
			var	pixel = pix,
				genColor = colRGB3.slice(0);

			if( ( pixel == pixnum1 ) ){
				genColor[0] += colRGB1[0];
				genColor[1] += colRGB1[1];
				genColor[2] += colRGB1[2];
			}
			if( ( pixel == pixnum2 ) ){
				genColor[0] += colRGB2[0];
				genColor[1] += colRGB2[1];
				genColor[2] += colRGB2[2];
			}
			var colCheck = 1;
			if( genColor[0] > 255) { if( genColor[0] / 255 > colCheck ) { colCheck = genColor[0] / 255; } }
			if( genColor[1] > 255) { if( genColor[1] / 255 > colCheck ) { colCheck = genColor[1] / 255; } }
			if( genColor[2] > 255) { if( genColor[2] / 255 > colCheck ) { colCheck = genColor[2] / 255; } }
			genColor[0] = Math.round( genColor[0] / colCheck );
			genColor[1] = Math.round( genColor[1] / colCheck );
			genColor[2] = Math.round( genColor[2] / colCheck );

			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateScannerFrames( colRGB, colRGB2, colRGB3 ) {
	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){ colRGB3 = [ 0, 0, 0 ];}

	if( colRGB2 == '' ){
		var	cR = colRGB[0] + 4,
			cG = colRGB[1] + 4,
			cB = colRGB[2] + 4,
			cR2 = Math.round( colRGB[0] / 32 ),
			cG2 = Math.round( colRGB[1] / 32 ),
			cB2 = Math.round( colRGB[2] / 32 );

		if(cR > 255) {cR = 255;}
		if(cG > 255) {cG = 255;}
		if(cB > 255) {cB = 255;}

	} else {
		var	cR = colRGB[0],
			cG = colRGB[1],
			cB = colRGB[2],
			cR2 = colRGB2[0],
			cG2 = colRGB2[1],
			cB2 = colRGB2[2];
	}

	var genFrames = [];
	// for every frame...
	for( var fr = 0; fr < 12; fr++ ){
		var genFrame = [];

		if( fr <= 6 ){
			var pixnum = fr * 2 + 15;
		} else {
			var pixnum = ( 12 - fr) * 2 + 15;
		}
		if ( pixnum > 23 ){ pixnum -= 24; }

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var genColor = colRGB3.slice(0);
			if( ( pixel <= 3 ) || ( pixel >= 15 ) ){
				var genColor = colRGB3.slice(0);
				if( Math.floor( pixel / 2) * 2 != pixel ){
					if( ( pixel == pixnum ) ){
						genColor = [ cR, cG, cB ];
					} else {
						genColor = [ cR2, cG2, cB2 ];
					}
				}
			}
			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateGort( colRGB1, colRGB2, colRGB3 ) {
	var genFrames = [];
	if( colRGB2 == undefined ){ colRGB2 = '';}
	if(colRGB2[0] == 0 && colRGB2[1] == 0 && colRGB2[2] == 0){ colRGB2 = '';}
	if( colRGB3 == undefined ){
		colRGB3 = [1, 1, 1];
		for( var i = 0; i<3; i++){
			colRGB3[i] = Math.round(colRGB3[i] - colRGB1[i]/510 - colRGB2[i]/510);
		}
	}


	if( colRGB2 == '' ){
		colRGB2=[255 - colRGB1[0], 255 - colRGB1[1], 255 - colRGB1[2]];
	}
	
	// for every frame...
	for( var fr = 0; fr < 16; fr++ ){
		var genFrame = [];

		if( fr < 9 ){ var pixnum = fr + 17; } else { var pixnum = 33 - fr; }
		var pixnum1 = pixnum + 1, pixnum2 = pixnum - 1, pixnum3 = pixnum + 2, pixnum4 = pixnum - 2;
		if( pixnum > 23){ pixnum -=24; }
		if( pixnum1 > 23){ pixnum1 -=24; }
		if( pixnum2 > 23){ pixnum2 -=24; }
		if( pixnum3 > 23){ pixnum3 -=24; }
		if( pixnum4 > 23){ pixnum4 -=24; }

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			var genColor = colRGB3;
			if( pixel == pixnum ){ genColor = colRGB1; }
			if( pixel == pixnum1 || pixel == pixnum2 ){ genColor = [Math.round(colRGB2[0]/8), Math.round(colRGB2[1]/8), Math.round(colRGB2[2]/8)]; }
			if( pixel == pixnum3 || pixel == pixnum4 ){ genColor = [Math.round(colRGB2[0]), Math.round(colRGB2[1]), Math.round(colRGB2[2])]; }

			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateEyes( colRGB1, colRGB2, colRGBring ) {
	var	genFrames = [],
		genColor = [],
		pixcenter = 21,
		pixdest = 0,
		pixnum =[],
		blinkOn = false,
		nFrame = 200;

	if(inGenFrame == undefined){
		var totalFrames = nFrame;
	} else {
		var totalFrames = inGenFrame.value;
		var nFrame = totalFrames;
	}

	if(colRGBring == undefined){
		if(colRGB1[0]==colRGB2[0] && colRGB1[1]==colRGB2[1] && colRGB1[2]==colRGB2[2]){
			if( colRGB1[0] == 255 && colRGB1[1] == 255 && colRGB1[2] == 255 ){
				var colRGB2 = [4, 4, 4];
				var colRGB3 = [2, 2, 2];
			} else {
				var colRGB2 = [Math.round((255-colRGB1[0])/64), Math.round((255-colRGB1[1])/64), Math.round((255-colRGB1[2])/64) ];
				var colRGB3 = [Math.round((255-colRGB1[0])/128), Math.round((255-colRGB1[1])/128), Math.round((255-colRGB1[2])/128) ];
			}
			var colRGB4 = [Math.round(colRGB1[0]/32), Math.round(colRGB1[1]/32), Math.round(colRGB1[2]/32) ];

		} else {
			var colDiv1 = 0; for(var i = 0; i<3; i++){ if( colRGB1[i] > 0){ colDiv1++; } }
			var colDiv2 = 0; for(var i = 0; i<3; i++){ if( colRGB2[i] > 0){ colDiv2++; } }
		
			if( colDiv1 == colDiv2 ){ colDiv1 = 1; colDiv2 = 2; } else { colDiv2++; }

			colRGB1 = [Math.round(colRGB1[0]/Math.pow( 2, colDiv1)), Math.round(colRGB1[1]/Math.pow( 2, colDiv1)), Math.round(colRGB1[2]/Math.pow( 2, colDiv1)) ];
			colRGB2 = [Math.round(colRGB2[0]/Math.pow( 2, colDiv2)), Math.round(colRGB2[1]/Math.pow( 2, colDiv2)), Math.round(colRGB2[2]/Math.pow( 2, colDiv2)) ];

			var colRGB3 = [Math.round(colRGB2[0]/1.5), Math.round(colRGB2[1]/1.5), Math.round(colRGB2[2]/1.5) ];
			var colRGB4 = [Math.round(colRGB2[0]/8), Math.round(colRGB2[1]/8), Math.round(colRGB2[2]/8) ];
		}
	} else {
		colRGB3 = colRGB2.slice(0);
		colRGB4 = colRGB2.slice(0);
	}

	// for every frame...
	for( var fr = 0; fr < nFrame ; fr++ ){
		var genFrame = [];

		// if at destination, set new center destination... or not
		if( !blinkOn && pixdest == 0 && Math.random() >= 0.7 ){
			pixdest = 21 + Math.round(Math.random()*12-6);
		}
		// move center toward destination
		if(pixdest > 0 ){
			blinkOn = false;

			if( pixcenter > pixdest ){
				pixcenter -= 1;
			} else if( pixcenter < pixdest ){
				pixcenter += 1; 
			} else { pixdest = 0; } // set arrived at the destination
		} else {
			if(blinkOn){
				blinkOn = false;
			} else {
				blinkOn = Math.random() < 0.15;
			}
		}
		// last frames: move to start position
		if( fr >= nFrame -3 ){ pixdest = 21; }
		
		// get eye pixels
		for( var i = 1; i<7; i++){
			if(Math.floor(i/2)*2 == i ){
				pixnum[i] = pixcenter - 1 - Math.floor((i+1)/2);
			} else {
				pixnum[i] = pixcenter + 1 + Math.floor((i+1)/2);
			}
			if( pixnum[i] > 23){ pixnum[i] -=24; } else if ( pixnum[i] < 0 ){pixnum[i] += 24;}
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			if( pixel == pixnum[1] || pixel == pixnum[2] ) { // eyes center side
				if(blinkOn){
					genColor =  colRGB4;
				} else {
					genColor =  colRGB3;
				}
			} else if( pixel == pixnum[3] || pixel == pixnum[4] ) { // eyes center
				if(blinkOn){
					genColor =  colRGBring.slice(0);
				} else {
					genColor =  colRGB1;
				}
			} else if( pixel == pixnum[5] || pixel == pixnum[6] ) { // eyes outside
				if(blinkOn){
					genColor =  colRGB4;
				} else {
					genColor =  colRGB2;
				}
			} else  { genColor = colRGBring.slice(0); }

			genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
		}
		genFrames.push(genFrame);
	}
	return genFrames;
}

function generateLedAlert( colRGB1, colRGB2 ) {
	var	genFrames = [],
		genFrame = [],
		genColor = [];

	// for every pixel...
	for( var pix = 0; pix < 24; pix++ ) {
		var pixel = pix + 3; if(pixel > 23){ pixel -= 24;}

		if( pixel < 12 ) { genColor = colRGB1; } else  { genColor = colRGB2; }
		genFrame.push({ r: genColor[0], g: genColor[1], b: genColor[2] });
	}
	genFrames.push(genFrame);
	return genFrames;
}




// ==================== various functions ==================== //

function getColorFlow(nStep, colFlow1, colFlow2 ){
	var	col = [];

	if( colFlow1 == undefined ){ // full flow
		var	fStep = 360/nStep,
			hue = 0;

		for( var i = 0; i<nStep; i ++ ){
			var colRGB = hsvToRgb(Math.round(i * fStep), 100, 100);
			col.push(colRGB);
		}

	} else { // 2 color flow
		
		var	cR = colFlow1[0],
			cG = colFlow1[1],
			cB = colFlow1[2],
			stepR = ( colFlow2[0] - colFlow1[0] ) / (nStep-1) * 2,
			stepG = ( colFlow2[1] - colFlow1[1] ) / (nStep-1) * 2,
			stepB = ( colFlow2[2] - colFlow1[2] ) / (nStep-1) * 2;

		col.push([Math.round(cR), Math.round(cG), Math.round(cB)]);
		nStep --;
		for( var i = 0; i < nStep; i ++ ){
			if( i < (nStep /2) ){
				cR = cR + stepR;
				cG = cG + stepG;
				cB = cB + stepB;
			} else {
				cR = cR - stepR;
				cG = cG - stepG;
				cB = cB - stepB;
			}
			col.push([Math.round(cR), Math.round(cG), Math.round(cB)]);
		}
	}
	return col;
}

function getRandomColors( randomFrames ){
	var	col = [],
		c = [];

	if( randomFrames == undefined ){ randomFrames = 109; }

	for( var i = 0; i < randomFrames; i++ ){
		c = [0, 0, 0];
		while(c[0] == c[1] && c[1] == c[2]){
			c[0] = Math.floor( Math.random() * 4)*85;
			c[1] = Math.floor( Math.random() * 4)*85;
			c[2] = Math.floor( Math.random() * 4)*85;
		}
		if( c[0]>0 && c[1]>0 && c[2]>0 ){c[Math.floor(Math.random()*3)] = 0;}
		col.push(c);
	}
	return col;
}



var previousGenType = '';
selectedGenerator = -1;
function runGenerator( genType ){
	var	genCol1 = [ generatorColor[0][0], generatorColor[0][1], generatorColor[0][2] ],
		genCol2 = [ generatorColor[1][0], generatorColor[1][1], generatorColor[1][2] ],
		genCol3 = [ generatorColor[2][0], generatorColor[2][1], generatorColor[2][2] ],
		genId = Number(genType.substr(4)) - 1;

	if(genId < 0){ return; }
	selectedGenerator = genId;

	if( previousGenType != genType ){
		previousGenType = genType;
		inTFPS.value = 60;
		inFPS.value = 1;
		genName = generatorParameters[genId].generator.substr(8).toLowerCase();
		inFPS.value = Number( generatorParameters[genId].options.fps );
		inTFPS.value = Number( generatorParameters[genId].options.tfps );
		inRPM.value = Number( generatorParameters[genId].options.rpm );
		inRepeat.value = Number( generatorParameters[genId].options.repeat );
		nColors = Number( generatorParameters[genId].options.colorN );
		doRandom = generatorParameters[genId].options.random;
		if( generatorParameters[genId].options.frames != undefined ){
			inGenFrame.value = generatorParameters[genId].options.frames
		}
		checkRandomColors.checked = false;
		checkFullFlow.checked = false;
	}

	checkRandomColors.disabled = false;
	txtRandomColors.style.color = "#000000";
	checkFullFlow.disabled = false;
	txtFullFlow.style.color = "#000000";

	inGenFrame.disabled = false;
	inGenFrame.style.backgroundColor = "#ffffff";
	txtGenFrame.style.color = "#000000";

	generatorCol1.disabled = false;
	genColInfo1.style.color = "#000000";
	generatorCol2.disabled = false;
	genColInfo2.style.color = "#000000";
	generatorCol3.disabled = false;
	genColInfo3.style.color = "#000000";

	if( (!checkRandomColors.disabled && checkRandomColors.checked) || (!checkFullFlow.disabled && checkFullFlow.checked) ){
		notUsed('color1');
		notUsed('color2');
	}

	if(!doRandom){
		notUsed('random');
	}

	switch( nColors ){
	case 1:
		genColInfo1.innerHTML = txt_first_color;
		genColInfo2.innerHTML = txt_flow_to;
		genColInfo3.innerHTML = txt_ring_color;
		switch(genName){
			case 'solid':
			case 'breathe':
				notUsed('color3');
				break;

			case 'pulsar':
				notUsed('frames');
				break;
		}	
		if( generatorCol1.disabled == false && genCol1[0] + genCol1[1] + genCol1[2] == 0 && checkFullFlow.checked == false ){ checkFullFlow.click(); }	
		break;

	case 2:
		genColInfo1.innerHTML = txt_first_color;
		genColInfo2.innerHTML = txt_second_color;
		genColInfo3.innerHTML = txt_ring_color;
		switch(genName){
			case 'ledalert':
				notUsed('color3');
				notUsed('frames');
				break;

			case 'flash':
			case 'oncoming':
			case 'scannerframes':
			case 'gort':
			//case 'eyes':
				notUsed('frames');
				break;
		}
		notUsed('fullflow');
		break;

	case 3:
		genColInfo1.innerHTML = txt_first_color;
		genColInfo2.innerHTML = txt_second_color;
		genColInfo3.innerHTML = txt_third_color;

		notUsed('fullflow');
		notUsed('frames');
		break;

	}

	if( !checkFullFlow.disabled && checkFullFlow.checked ){
		genCol1 = [ 0, 0, 0 ]
	}

	switch(genType){
		case 'gen_1': ledFrames = generateLedAlert( genCol1, genCol2 ); break;
		case 'gen_2': ledFrames = generateFlash( genCol1, genCol2, genCol3 ); break;
		case 'gen_3': ledFrames = generateSolid( genCol1, genCol2, genCol3 ); break;
		case 'gen_4': ledFrames = generateBreathe( genCol1, genCol2, genCol3 ); break;
		case 'gen_5': ledFrames = generateSparkle( genCol1, genCol2, genCol3 ); break;
		case 'gen_6': ledFrames = generateSatellite( genCol1, genCol2, genCol3 ); break;
		case 'gen_7': ledFrames = generateLighthouse( genCol1, genCol2, genCol3 ); break;
		case 'gen_8': ledFrames = generateClockwork( genCol1, genCol2, genCol3 ); break;
		case 'gen_9': ledFrames = generateButterfly( genCol1, genCol2, genCol3 ); break;
		case 'gen_10': ledFrames = generateTriangle( genCol1, genCol2, genCol3 ); break;
		case 'gen_11': ledFrames = generatePulsetrain( genCol1, genCol2, genCol3 ); break;
		case 'gen_12': ledFrames = generateFrontpulse( genCol1, genCol2, genCol3 ); break;
		case 'gen_13': ledFrames = generatePulsar( genCol1, genCol2, genCol3 ); break;
		case 'gen_14': ledFrames = generateOncoming( genCol1, genCol2, genCol3 ); break;
		case 'gen_15': ledFrames = generateNewtonian( genCol1, genCol2, genCol3 ); break;
		case 'gen_16': ledFrames = generateScannerFrames( genCol1, genCol2, genCol3 ); break;
		case 'gen_17': ledFrames = generateGort( genCol1, genCol2, genCol3 ); break;
		case 'gen_18': ledFrames = generateEyes( genCol1, genCol2, genCol3 ); break;
	}

	refreshCounter(); refreshCounter(ledFrames.length);

	selectedFrame = 0;
	refreshFramesList();
}

function notUsed( notUsedParameter ){
	switch(notUsedParameter){
	case 'color1':
		generatorCol1.disabled = true;
		genColInfo1.style.color = "#aaaaaa";
		break;

	case 'color2':
		generatorCol2.disabled = true;
		genColInfo2.style.color = "#aaaaaa";
		break;

	case 'color3':
		generatorCol3.disabled = true;
		genColInfo3.style.color = "#aaaaaa";
		break;

	case 'fullflow':
		checkFullFlow.disabled = true;
		txtFullFlow.style.color = "#aaaaaa";
		break;

	case 'random':
		checkRandomColors.disabled = true;
		txtRandomColors.style.color = "#aaaaaa";
		break;

	case 'frames':
		inGenFrame.disabled = true;
		txtGenFrame.style.color = "#aaaaaa";
		inGenFrame.style.backgroundColor = "#aaaaaa";
		break;
	}
}

var generatorParameters = [
	{ generator: 'generateLedAlert', options: { fps: 1, tfps: 4, rpm: 60, repeat: 10, colorN: 2, random: false } },
	{ generator: 'generateFlash', options: { fps: 16, tfps: 16, rpm: 0, repeat: 5, colorN: 2, random: false  } },
	{ generator: 'generateSolid', options: { fps: 1, tfps: 60, rpm: 0, repeat: 10, colorN: 1, random: false, frames:1  } },
	{ generator: 'generateBreathe', options: { fps: 1, tfps: 60, rpm: 0, repeat: 3, colorN: 1, random: false, frames:8  } },
	{ generator: 'generateSparkle', options: { fps: 4, tfps: 60, rpm: 2, repeat: 1, colorN: 1, random: true, frames:60  } },
	{ generator: 'generateSatellite', options: { fps: 1, tfps: 60, rpm: 10, repeat: 15, colorN: 1, random: true, frames:10  } },
	{ generator: 'generateLighthouse', options: { fps: 1, tfps: 60, rpm: 10, repeat: 15, colorN: 1, random: true, frames:10  } },
	{ generator: 'generateClockwork', options: { fps: 24, tfps: 60, rpm: 0, repeat: 5, colorN: 1, random: false, frames:24  } },
	{ generator: 'generateButterfly', options: { fps: 5, tfps: 60, rpm: 0, repeat: 3, colorN: 1, random: false, frames:15  } },
	{ generator: 'generateTriangle', options: { fps: 1, tfps: 60, rpm: 30, repeat: 10, colorN: 3, random: false  } },
	{ generator: 'generatePulsetrain', options: { fps: 12, tfps: 60, rpm: 17, repeat: 4, colorN: 1, random: false  } },
	{ generator: 'generateFrontpulse', options: { fps: 9, tfps: 60, rpm: 0, repeat: 8, colorN: 1, random: false, frames:12  } },
	{ generator: 'generatePulsar', options: { fps: 12, tfps: 60, rpm: 0, repeat: 3, colorN: 1, random: false  } },
	{ generator: 'generateOncoming', options: { fps: 12, tfps: 60, rpm: 3, repeat: 5, colorN: 2, random: false  } },
	{ generator: 'generateNewtonian', options: { fps: 30, tfps: 60, rpm: 0, repeat: 5, colorN: 2, random: false, frames:60 } },
	{ generator: 'generateScannerFrames', options: { fps: 3, tfps: 60, rpm: 0, repeat: 3, colorN: 2, random: false  } },
	{ generator: 'generateGort', options: { fps: 3, tfps: 60, rpm: 0, repeat: 2, colorN: 2, random: false  } },
	{ generator: 'generateEyes', options: { fps: 2, tfps: 60, rpm: 0, repeat: 1, colorN: 2, random: false  } }
]