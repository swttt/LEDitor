var 	selectedColor = 0,
	stepColBright = 7,
	colBase = [
		{ r:127, g:127, b:127 },
		{ r:255, g:  0, b:  0 },
		{ r:255, g: 85, b:  0 },
		{ r:255, g:170, b:  0 },
		{ r:255, g:255, b:  0 },
		{ r:170, g:255, b:  0 },
		{ r: 85, g:255, b:  0 },
		{ r:  0, g:255, b:  0 },
		{ r:  0, g:255, b: 85 },
		{ r:  0, g:255, b:170 },
		{ r:  0, g:255, b:255 },
		{ r:  0, g:170, b:255 },
		{ r:  0, g: 85, b:255 },
		{ r:  0, g:  0, b:255 },
		{ r: 85, g:  0, b:255 },
		{ r:170, g:  0, b:255 },
		{ r:255, g:  0, b:255 },
		{ r:255, g:  0, b:170 },
		{ r:255, g:  0, b: 85 }
	];

	// create LED color pool colPal[ {r,g,b}, {r,g,b}, ... ]
	var colPal = [];
	var hR = 0, hG = 0, hB = 0, vR = 0, vG = 0, vB = 0, lR = 0, lG = 0, lB = 0;
	for( var j=0; j< stepColBright*2+1 ; j++){
		for( var i=0; i<colBase.length; i++){
			var xDivider = stepColBright; if(i == 0 ){ xDivider ++;}
			hR = Number(colBase[i].r);
			hG = Number(colBase[i].g);
			hB = Number(colBase[i].b);
				
			lR = hR; lG = hG; lB = hB;
			vR = hR; vG = hG; vB = hB;
								
			// ledcolors
			if( j < stepColBright ){ // brighter
				if( i==0 && j==0){
					hR = 255; hG = 255; hB = 255;
				} else {
					
					if( hR < 255 ){
						hR = hR + (255 - hR)/stepColBright * ( stepColBright -j )*0.75;
					}
					if( hG < 255 ){
						hG = hG + (255 - hG)/stepColBright * ( stepColBright -j )*0.75;
					}
					if( hB < 255 ){
						hB = hB + (255 - hB)/stepColBright * ( stepColBright -j )*0.75;
					}
					
					hR = Math.round( hR );
					hG = Math.round( hG );
					hB = Math.round( hB );
				}

			} else if( j > stepColBright ){ // darker
					
				//lR = hR; lG = hG; lB = hB;

				if( hR >= hG && hR >= hB){
					hR = lR / Math.pow(2, (j- stepColBright )*0.7);
					hG = lG/lR * hR;
					hB = lB/lR * hR;
				} else if( hG >= hR && hG >= hB){
					hG = lG / Math.pow(2, (j- stepColBright )*0.7);
					hR = lR/lG * hG;
					hB = lB/lG * hG;
				} else {
					hB = lB / Math.pow(2, (j- stepColBright )*0.7);
					hR = lR/lB * hB;
					hG = lG/lB * hB;
				}
				
				hR = Math.round( hR );
				hG = Math.round( hG );
				hB = Math.round( hB );
										
				if( hR > 0 ){ hR -= 1; }
				if( hG > 0 ){ hG -= 1; }
				if( hB > 0 ){ hB -= 1; }
			}

			if( hR == 3 &&  hG == 3 &&  hB == 3){
				hR = 0;
				hG = 0;
				hB = 0;
				selectedColor = colBase.length * j + i;
			}
			colPal[colBase.length * j + i] = { r:hR, g:hG, b:hB }
		}
	}

		
function getViewColor( colObj ){
	var	hR = Number(colObj.r), hG = Number(colObj.g), hB = Number(colObj.b),
		vR = hR, vG = hG, vB = hB;

	// convert LED-color to screen viewcolor
	var	upLED = 156,	// max r, g or b below 255 for LEDs
		upDisp = 210,	// max r, g or b below 255 for screen
		lowLED = 2,	// min r, g or b above 0 for LEDs
		lowDisp = 35,	// min r, g or b above 0 for screen
		mult = ( upDisp - lowDisp ) / Math.sqrt(upLED - lowLED);
	
	if( hR<255 && hG<255 && hB<255 && !( hR+hG+hB == 0 )){

		if( hR >= hG && hR >= hB){
			vR = lowDisp + Math.sqrt(hR) * mult;
			vG = hG/hR * vR;
			vB = hB/hR * vR;

		} else if( hG >= hR && hG >= hB){
			vG = lowDisp + Math.sqrt(hG) * mult;
			vR = hR/hG * vG;
			vB = hB/hG * vG;

		} else {
			vB = lowDisp + Math.sqrt(hB) * mult;
			vR = hR/hB * vB;
			vG = hG/hB * vB;
		}
	} else {
		vR = hR * 1.068; if( vR > 255 ){ vR = 255; }
		vG = hG * 1.068; if( vG > 255 ){ vG = 255; }
		vB = hB * 1.068; if( vB > 255 ){ vB = 255; }
	}
	vR = Math.round( vR );
	vG = Math.round( vG );
	vB = Math.round( vB );

	return { r:vR, g:vG, b:vB };
}

function contrastBlackOrWhite( contrastColor ){ // { r:x, g:x, b:x }
	if( contrastColor.r * 0.3 + contrastColor.g* 0.6 + contrastColor.b * 0.1 > 118 ){
		var xR = 0, xG = 0, xB= 0;
	} else {
		var xR = 255, xG = 255, xB= 255;
	}
	return { r:xR, g:xG, b:xB };
}

function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [ h, s, l ];
}

function hslToRgb(h, s, l) {
	var r, g, b;
	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}
	return { r:r * 255, g:g * 255, b:b * 255 };
}



/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;

	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));

	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;

	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;

		case 1:
			r = q;
			g = v;
			b = p;
			break;

		case 2:
			r = p;
			g = v;
			b = t;
			break;

		case 3:
			r = p;
			g = q;
			b = v;
			break;

		case 4:
			r = t;
			g = p;
			b = v;
			break;

		default: // case 5:
			r = v;
			g = p;
			b = q;
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}