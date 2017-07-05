
	var 	thisApp = {
			versionMajor: 0,
			versionMinor: 0,
			versionRevision: 0
		},
		selectedAnimation = 0,
		playFrame = 0,
		selectedFrame = 0,
		undoList = [], undoPointer = -1,
		max_fields = 200,	//maximum frames allowed by Homey
		count_frames = 0,	//used frames

		txtMoveUp = '',
		txtMoveDown = '',
		txtRemove = '',
		txt_frame_add = '',
		txt_frame_copy = '',
		txt_wrong_image = '',
		txt_ani_copy = '',
		txt_ed_apply_off = '',
		txt_drop_type = [],
		txt_drop_range = [],
		txt_plural_s = '',
		txt_count = [],
		
		txt_pure_red = 'txt_pure_red',
		txt_pure_green ='txt_pure_green',
		txt_pure_blue = 'txt_pure_blue',
		txt_pure_yellow = 'txt_pure_yellow',
		txt_pure_magenta = 'txt_pure_magenta',
		txt_pure_cyan = 'txt_pure_cyan',
		txt_bright_white = 'txt_bright_white',
		txt_no_color = 'txt_no_color',


		txt_first_color = 'txt_first_color',
		txt_second_color = 'txt_second_color',
		txt_third_color = 'txt_third_color',
		txt_flow_to = 'txt_flow_to',
		txt_ring_color = 'txt_ring_color',

		helpText = {},

		ctxRing = canvRing.getContext("2d"),				// ring colors
		ctxRing2 = canvRing2.getContext("2d"),				// ring colors 2
		ctxTop = canvTop.getContext("2d"),				// Homey's case
		butAddFrame = document.getElementById("but_frame_add"),
		butCopyFrame = document.getElementById("but_frame_copy"),
		butUndo = document.getElementById("but_edit_undo"),
		butRedo = document.getElementById("but_edit_redo"),
		butClock = document.getElementById("but_frame_clock"),
		butCounterClock = document.getElementById("but_frame_counterclock"),
		butPush = document.getElementById("but_frame_push"),
		butPull = document.getElementById("but_frame_pull"),
		butCopyAni = document.getElementById("but_copy_ani"),
		butRenameAni = document.getElementById("but_rename_ani"),
		valFillType = '',
		valFillRange = '',

		editW = 400,				// display canvas width/height
		editW2 = editW/2,
		ledEditW = Math.floor(editW/25),	// size of led-color indicators/selectors
		caseRadius = editW * 0.43,
		ledW = editW,				// max. radiation radius for leds
		topColor = 3,				// editor color outside led-ring - 0...3 (black, 33% grey, 67% grey, white)

		ledFrame = [],				// container for 24 LED objects {r:<0...255>, g:<0...255>, b:<0...255>}
		ledFrames = [],				// container for multiple ledFrames
		playMode = false,			// preview mode true/false
		generatorOn = false,
		valGenType = 'gen_0',
		generatorColor = [[255, 0, 0], [0, 0, 255], [0, 0, 0]],
		colorSelector = 0; // 0 = standard selection, 1 2 & 3 = pattern generator

	for(var i=0; i< 3; i ++){
		document.getElementById('generatorCol' +(i+1)).style.backgroundColor = 'rgba(' + generatorColor[i][0] + ',' + generatorColor[i][1] + ',' + generatorColor[i][2] + ',1)';
	}

	// led color markers
	tempCode = '';
	for(var i=0; i<24; i++){
		tempCode += ('<div id="ledMarker' + i + '" style="position:absolute; left:0px; top:0px; width:10px; height:10px; background-color:#000000; transition: border-color .25s linear; cursor:pointer;" onclick="clickLedMarker(this);" onmouseover="showActiveLeds(this); showHelp(this, event)" onmouseout="resetShowActive(); showHelp(this, event);" title="Click to colorize"></div>');
	}
	ledMarkers.innerHTML = tempCode; tempCode = null;

	parentRing.style.width = editW + 'px';
	parentRing.style.height = editW + 'px';
	divRing.style.width = editW + 'px';
	divRing.style.height = editW + 'px';
	canvRing.width = editW;
	canvRing.height = editW;
	canvRing.style.width = editW + 'px';
	canvRing.style.height = editW + 'px';
	canvRing2.width = editW;
	canvRing2.height = editW;
	canvRing2.style.width = editW + 'px';
	canvRing2.style.height = editW + 'px';
	canvTop.width = editW;
	canvTop.height = editW;
	canvTop.style.width = editW + 'px';
	canvTop.style.height = editW + 'px';

	// create empty frame & fill ledFrame empty
	var emptyFrame = [];
	for(i = 0; i < 24; i++){
		emptyFrame.push({r:0, g:0, b:0});
		ledFrame.push({r:0, g:0, b:0});
	}
	ledFrames.push(ledFrame);


	refreshButtons(false);
	var fileListEmpty = null;

	function onHomeyReady(){
		Homey.ready();
		Homey.get('version', function(err, version){
			if (version == undefined){
				version = '0.0.0';
			}
			xV = version;
			var	p1 = xV.indexOf('.'),
				p2 = xV.lastIndexOf('.');

			thisApp.versionMajor = xV.substr(0, p1);
			thisApp.versionMinor = xV.substr(p1 + 1, p2 - p1 - 1);
			thisApp.versionRevision = xV.substr(p2 + 1);
			versionNr.innerHTML = 'v' + thisApp.versionMajor + '.' + thisApp.versionMinor + '.' + thisApp.versionRevision;
		});
		

		txtRemove = __('settings.remove');
		txtMoveUp = __('settings.move_up');
		txtMoveDown = __('settings.move_down');
		txt_ed_apply_off = __('settings.ed_apply_off');

		txt_frame_add = __('settings.frame_button_add');
		txt_frame_copy = __('settings.frame_button_copy');
		txt_ani_copy = __('settings.animation_button_copy');

		butCopyAni.title = txt_ani_copy.replace('###', selectedAnimation+1);

		but_ani_open.title = __('settings.txt_but_ani_open');
		but_ani_store.title = __('settings.txt_but_ani_store');
		butAddFrame.title = txt_frame_add.replace('###', selectedFrame+1);
		butCopyFrame.title = txt_frame_copy.replace('###', selectedFrame+1);
		but_ani_fill_flow.title = __('settings.txt_but_ani_fill_flow');
		but_ani_fill_connect.title = __('settings.txt_but_ani_fill_connect');
		but_ani_generator.title = __('settings.txt_but_ani_generator');
		but_generator_close.title = __('settings.txt_but_generator_close');
		but_image_import.title = __('settings.txt_but_image_import');

		butPush.title = __('settings.frame_button_push');
		butPull.title = __('settings.frame_button_pull');
		butClock.title = __('settings.frame_button_clock');
		butCounterClock.title = __('settings.frame_button_counterclock');
		butUndo.title = __('settings.txt_undo');
		butRedo.title = __('settings.txt_redo');

		but_edit_fill.title = __('settings.ed_fill_equal');
		but_edit_flow.title = __('settings.ed_fill_gradient');

		txt_solid = __('settings.txt_solid');
		txt_drop_type[0] = __('settings.txt_drop_type_1');
		txt_drop_type[1] = __('settings.txt_drop_type_2');
		txt_drop_type[2] = __('settings.txt_drop_type_3');
		txt_drop_range[0] = __('settings.txt_drop_range_t1');
		txt_drop_range[1] = __('settings.txt_drop_range_t2');
		txt_drop_range[2] = __('settings.txt_drop_range_t3');
		txt_select = __('settings.txt_select');
		txt_plural_s = __('settings.txt_plural_s');
		txt_pure_red = __('settings.txt_pure_red');
		txt_pure_green = __('settings.txt_pure_green');
		txt_pure_blue = __('settings.txt_pure_blue');
		txt_pure_yellow = __('settings.txt_pure_yellow');
		txt_pure_magenta = __('settings.txt_pure_magenta');
		txt_pure_cyan = __('settings.txt_pure_cyan');
		txt_bright_white = __('settings.txt_bright_white');
		txt_no_color = __('settings.txt_no_color');

		txt_first_color = __('settings.txt_first_color');
		txt_second_color = __('settings.txt_second_color');
		txt_third_color = __('settings.txt_third_color');
		txt_flow_to = __('settings.txt_flow_to');
		txt_ring_color = __('settings.txt_ring_color');

		for(var i = 0; i < 13; i ++){
			txt_count[i] = __('settings.count' + i);
		}

		but_import_cancel.title = __('settings.txt_import_cancel');
		but_import_accept.title = __('settings.txt_import_accept');
		but_open_image.title = __('settings.txt_open_image');
		txt_wrong_image = __('settings.txt_wrong_image');
		but_scan_direction.title = __('settings.txt_scan_direction');

		var xDoc = '';
		xDoc = xDoc + '<option value="gen_0">' + __('settings.txt_generator_0') +'</option>';
		for(var i=1; i <= 18; i++){
			xDoc = xDoc + '<option value="gen_' + i + '">' + __('settings.txt_generator_' + i) +'</option>';
		}
		dropGenerator.innerHTML = xDoc;
								

		var help_index = [
			'but_copy_ani_A', 'but_copy_ani_B',
			'dropAnimation_A', 'dropAnimation_B', 'but_rename_ani',
			'inName', 'inFPS', 'inTFPS', 'inRPM',
			'butPlay', 'butPreview', 'inRepeat',
			'tableFrames', 'butTopColor',
			'ledMarker', 'colPreview', 'dropFillType', 'dropFillType1', 'dropFillType2', 'dropFillType3', 'dropFillType1ext', 'dropFillType2ext', 'dropFillType3ext', 'dropFillRange',
			'but_frame_clock', 'but_frame_counterclock', 'but_frame_push', 'but_frame_pull',
			'but_edit_fill', 'but_edit_flow', 'checkAllFrames',
			'but_edit_undo', 'but_edit_redo',
			'but_ani_open', 'but_ani_store', 'but_export_cancel', 'but_frame_add', 'but_frame_copy', 'but_ani_fill_flow', 'but_ani_fill_connect', 'but_ani_generator', 'but_image_import',
			'but_generator_close', 'dropGenerator', 'checkRandomColors', 'checkFullFlow', 
			'generatorCol1', 'generatorCol1_flow',
			'generatorCol2', 'generatorCol2_flow',
			'generatorCol3', 'generatorCol3_flow',
			'inGenFrame', 'inGenFrame_number', 'inGenFrame_number1',
			
			'sliderDimmer', 'sliderHue', 'sliderSaturation', 'sliderLightness', 'sliderZoom',
			'but_open_image', 'but_scan_direction', 'inFrames',
			'canvImage', 'importArea', 'canvImportedFrames',
			'but_import_cancel', 'but_import_accept'
		];
		for(var i = 0; i < help_index.length; i ++){
			helpID = 'settings.help_' + help_index[i];
			helpText[help_index[i]] = __('settings.help_' + help_index[i]);
		}
		helpText.Default = __('settings.intro');



		ledSelectPreview({r:0, b:0, g:0});

		Homey.get('topColor', function(err, tColor){
			if (tColor == undefined){
				tColor = 3;
			}
			topColor = tColor;
			drawTop();
			refreshFramesList();
		});

		// create color selection palette.
		// color selectors
		tempCode = '';
		for(var j=0; j< stepColBright*2+1 ; j++){
			for(var i=0; i<colBase.length; i++){
				tempCode += ('<div id="colSet' + (colBase.length * j + i) + '" style="position:absolute; left:0px; top:0px; width:13px; height:13px; cursor:pointer;" onclick="clickColorPalette(this);" title=""></div>');
			}
		}
		divColorPal.innerHTML = tempCode;

		var bWidth = 1, cWidth = 19, xWidth = (cWidth+bWidth*2);
		for(var j=0; j< stepColBright*2+1 ; j++){
			for(var i=0; i<colBase.length; i++){
				xColSet = document.getElementById('colSet' + (colBase.length * j + i));
				xColSet.style.width = cWidth + 'px';
				xColSet.style.height = cWidth + 'px';
				xColSet.style.left = (i * xWidth) + 'px';
				xColSet.style.top = (j* xWidth) + 'px';
				xColSet.style.borderWidth = bWidth + 'px';
				xColSet.style.borderColor = '#000000';
				xColSet.style.borderStyle = 'solid';
				xColSet.style.color = '#ffffff';
				xColSet.style.textAlign = 'center';
				var	strCol = colPal[colBase.length * j + i].r + ',' + colPal[colBase.length * j + i].g + ',' + colPal[colBase.length * j + i].b,
					vColor = getViewColor(colPal[colBase.length * j + i]),
					viewCol = vColor.r + ',' + vColor.g + ',' + vColor.b;

				xColSet.style.backgroundColor = 'rgba(' + viewCol + ',1)';
				switch(strCol){
				case '0,0,0'	: xColSet.innerHTML = 'X'; xColSet.style.color = '#ffffff'; xColSet.title = txt_select + ': ' + txt_no_color; break;
				case '255,0,0'	: xColSet.innerHTML = '*'; xColSet.style.color = '#ffffff'; xColSet.title = txt_select + ': ' + txt_pure_red; break;
				case '0,255,0'	: xColSet.innerHTML = '*'; xColSet.style.color = '#000000'; xColSet.title = txt_select + ': ' + txt_pure_green; break;
				case '0,0,255'	: xColSet.innerHTML = '*'; xColSet.style.color = '#ffffff'; xColSet.title = txt_select + ': ' + txt_pure_blue; break;
				case '255,255,0': xColSet.innerHTML = '*'; xColSet.style.color = '#000000'; xColSet.title = txt_select + ': ' + txt_pure_yellow; break;
				case '255,0,255': xColSet.innerHTML = '*'; xColSet.style.color = '#ffffff'; xColSet.title = txt_select + ': ' + txt_pure_magenta; break;
				case '0,255,255': xColSet.innerHTML = '*'; xColSet.style.color = '#000000'; xColSet.title = txt_select + ': ' + txt_pure_cyan; break;
				case '255,255,255': xColSet.innerHTML = ''; xColSet.style.color = '#000000'; xColSet.title = txt_select + ': ' + txt_bright_white; break;
				}
			}
		}
		divColorPal.style.width = (colBase.length * xWidth + 1) + 'px';
		divColorPal.style.height = ((stepColBright*2+1) * xWidth + 1) + 'px';
		divColorPal.style.left = (402 + editW2 - divColorPal.offsetWidth/2) + 'px';
		divColorPal.style.top = (35 + editW2 - divColorPal.offsetHeight/2) + 'px';
		divColorPal.style.visibility = 'hidden';

		openAnimationIndex();
		openAnimation();

		selectEdit({id:'dropFillType', value:'type_1'});

		var ctxImp = canvImportedFrames.getContext("2d");
		ctxImp.font = '20px sans-serif';
		ctxImp.lineWidth = '1px';
		ctxImp.fillStyle = '#800000';
		ctxImp.fillRect(19, 330, 2, 60);
		ctxImp.fillText(__('settings.txt_import_start'), 2, 320);

		fileListEmpty = openLeditor.files;
	}

	function getColorName(objRGB){
		var	colName = '',
			compCol = objRGB.r +','+ objRGB.g +','+ objRGB.b;

		switch(compCol){
			case '0,0,0': colName = txt_ed_apply_off; break;
			case '255,0,0': colName = txt_pure_red.substr(txt_pure_red.indexOf(' ') + 1); break;
			case '255,255,0': colName = txt_pure_yellow.substr(txt_pure_yellow.indexOf(' ') + 1); break;
			case '0,255,0': colName = txt_pure_green.substr(txt_pure_green.indexOf(' ') + 1); break;
			case '0,255,255': colName = txt_pure_cyan.substr(txt_pure_cyan.indexOf(' ') + 1); break;
			case '0,0,255': colName = txt_pure_blue.substr(txt_pure_blue.indexOf(' ') + 1); break;
			case '255,0,255': colName = txt_pure_magenta.substr(txt_pure_magenta.indexOf(' ') + 1); break;
			case '255,255,255': colName = txt_bright_white.substr(txt_bright_white.indexOf(' ') + 1); break;
		}
		return colName.substr(0,1).toUpperCase() + colName.substr(1).toLowerCase();;
	}


	// ******************** In-app help ********************
	function showHelp(obj, event){
		var	docHelp = document.getElementById('helpInfoArea'),
			id = obj.id;

		if(selectedGenerator >=0){
			var	genName = generatorParameters[selectedGenerator].generator.substr(8).toLowerCase(),
				genFPS = Number(generatorParameters[selectedGenerator].options.fps),
				genTFPS = Number(generatorParameters[selectedGenerator].options.tfps),
				genRPM = Number(generatorParameters[selectedGenerator].options.rpm),
				genRepeat = Number(generatorParameters[selectedGenerator].options.repeat),
				genColorN = Number(generatorParameters[selectedGenerator].options.colorN),
				genRandom = generatorParameters[selectedGenerator].options.random,
				genFrame = 0;

			if(generatorParameters[selectedGenerator].options.frames != undefined){
				genFrame = generatorParameters[selectedGenerator].options.frames;
			}
		}
		


		if(id.substr(0,9) == 'ledMarker'){
			id = 'ledMarker';
		}
		switch(id){
			case 'ledMarker':
				break;

			case'dropAnimation':
				switch(enableAniCopy){
					case false: id = id + '_A'; break;
					case true: id = id + '_B'; break;
				}
				break;

			case'but_copy_ani':
				switch(enableAniCopy){
					case false: id = id + '_A'; break;
					case true: id = id + '_B'; break;
				}
				break;
		}

		switch(event.type){
			case'mouseover':
				//docHelp.style.fontWeight = 'bold';
				docHelp.style.color = '#400000';
				if(helpText[id] == undefined){
					docHelp.innerHTML = 'Missing: helpText.' + id;
				} else {
					var txtHelp = helpText[id];
					switch(id){// additional text
						case'dropFillType':
							txtHelp = txtHelp + ' ' + helpText['dropFillType1'] + ' ' + helpText['dropFillType2'] + ' ' + helpText['dropFillType3'];
							break;

						case'dropFillRange':
							var xType = dropFillType.value.substr(5);
							txtHelp = txtHelp + ': ';
							if(xType == '3'){txtHelp = '';}
							txtHelp = txtHelp + helpText['dropFillType' + xType];
							break;

						case'colPreview':
							if(dropFillType.value == 'type_3'){
								docHelp.style.fontWeight = 'normal';
								docHelp.style.color = document.body.style.color;
								txtHelp = helpText['Default'];
							}
							break;

						case 'generatorCol1':
							if(genColorN == 1){
								txtHelp = txtHelp + ' ' + helpText['generatorCol1_flow'];
							}
							break;

						case 'generatorCol2':
							if(genColorN == 1){
								txtHelp = txtHelp + ' ' + helpText['generatorCol2_flow'];
							}
							break;

						case 'generatorCol3':
							break;

						case 'inGenFrame':
							switch(genName){

							case'satellite':
							case'lighthouse':
							case'sparkle':
								break;

							default:
								if(genFrame > 0){
									switch(genName){
									case'newtonian':
										var xHelp = helpText['inGenFrame_number1'];
										break;

									default:
										var xHelp = helpText['inGenFrame_number'];
									}
									xHelp = xHelp.replace('#1#', genFrame);
									xHelp = xHelp.replace('#2#', (Number(genFrame) * 2));
									xHelp = xHelp.replace('#3#', (Number(genFrame) * 6));
									txtHelp = txtHelp + ' ' + xHelp;
								}
							}
							break;
					}

					switch(id){
						case'dropFillType': case'dropFillRange':
							txtHelp = txtHelp.replace('#1#', txt_drop_type[0]);
							txtHelp = txtHelp.replace('#2#', txt_drop_type[1]);
							txtHelp = txtHelp.replace('#3#', txt_drop_type[2]);

							var xType = dropFillType.value.substr(5);
							if(id == 'dropFillRange'){txtHelp = txtHelp + ' ' + helpText['dropFillType' + xType + 'ext']}
							break;
					}

					docHelp.innerHTML = txtHelp;
				}
				break;

			case'mouseout':
				//docHelp.style.fontWeight = 'normal';
				docHelp.style.color = document.body.style.color;
				docHelp.innerHTML = helpText['Default'];
				break;
		}
	}




	// ******************** Save LEDitor data-image ********************
	var storeLeditorOn = false;

	function storeLeditor() {
		storeLeditorOn = true;
		var	ctxExport = canvImageExport.getContext("2d"),
			stepW = 1,
			imgInfo = [],
			idInfo = 'LEDitor',
			dataCol = [],
			dataPointer = 0;

		document.getElementById('imageExporter').style.visibility = 'visible';
		canvImageExport.width = 200;
		canvImageExport.height = 25;
		ctxExport.fillStyle = '#000000';
		ctxExport.fillRect(0, 0, canvImageExport.width, canvImageExport.height);
		for(var x = 0; x < ledFrames.length; x ++){
			for(var y = 0; y < 24; y ++){
				ctxExport.fillStyle = 'rgba(' + ledFrames[x][y].r + ',' + ledFrames[x][y].g + ',' + ledFrames[x][y].b + ',' + ' 1)';
				var yLed = y - 9; if(yLed < 0){yLed +=24;}
				ctxExport.fillRect(x * stepW, yLed + 1, stepW, 1);
			}
		}

		while(idInfo.length <15){idInfo += ' ';}
		for(var i = 0; i < idInfo.length; i++){
			imgInfo.push(idInfo.charCodeAt(i));
		};

		imgInfo.push(thisApp.versionMajor);
		imgInfo.push(thisApp.versionMinor);
		imgInfo.push(thisApp.versionRevision);
		imgInfo.push(ledFrames.length);
		imgInfo.push(inFPS.value);
		imgInfo.push(inTFPS.value);
		imgInfo.push(inRPM.value);

		var aniName = aniIndex[selectedAnimation].name;
		while(aniName.length <100){aniName += ' ';}
		for(var i = 0; i < aniName.length; i++){
			imgInfo.push(aniName.charCodeAt(i));
		};

		while(Math.floor(imgInfo.length / 3) *3 != imgInfo.length){
			imgInfo.push(0);
		}

		for(var i=0; i< imgInfo.length; i++){
			dataCol.push(imgInfo[i]);
			if(dataCol.length == 3){
				ctxExport.fillStyle = 'rgba(' + dataCol[0] + ',' + dataCol[1] + ',' + dataCol[2] + ',1)';
				ctxExport.fillRect(dataPointer * stepW, 0, stepW, 1);
				dataPointer ++;
				dataCol = [];
			}
		}

		var dataURL = canvImageExport.toDataURL();

		document.getElementById('imageExport').download = 'LEDitor - ' + aniIndex[selectedAnimation].name;
		document.getElementById('imageExport').href = dataURL;

		//document.getElementById('editor').style.visibility = 'hidden';
		refreshButtons(false);
	}

	function closeExport(obj){
		storeLeditorOn = false;
		document.getElementById('imageExporter').style.visibility = 'hidden';
		//document.getElementById('editor').style.visibility = 'visible';
		refreshButtons();
	}


	// ******************** Load saved LEDitor data-image ********************
	function loadLeditor(ev) {
		if(document.getElementById("openLeditor").files[0] == undefined){//canceled
			return;
		}

		var	f = document.getElementById("openLeditor").files[0],
			url = window.URL || window.webkitURL,
			src = url.createObjectURL(f),
			imgLeditor = new Image();

		imgLeditor.onload = function(){
			var dataImage = false;

			if(imgLeditor.width == 200 && imgLeditor.height == 25){
				var ctxInfo = canvImgAni.getContext('2d');
				ctxInfo.drawImage(imgLeditor, 0, 0);
				var	imgData = ctxInfo.getImageData(0,0,200,1),
					infoData = [],
					appId = '';

				for(var i = 0; i < imgData.data.length; i+=4){
					infoData.push(imgData.data[i]);
					infoData.push(imgData.data[i+1]);
					infoData.push(imgData.data[i+2]);
				}

				for(i = 0; i < 15; i++){
					appId += String.fromCharCode(infoData[i]);
				}
				appId = appId.trim();
				if(appId == 'LEDitor'){
					var	versionMajor = infoData[15],
						versionMinor = infoData[16],
						versionRevision = infoData[17],
						nFrames = infoData[18];

					imgData = ctxInfo.getImageData(0,1,200,24);
					ledFrames = [];
					for(var x = 0; x < nFrames; x ++){
						ledFrame = [];
						for(var y = 0; y < 24; y ++){
							var ledNr = y - 9; if(ledNr < 0){ledNr +=24;}
							var pixPos = ledNr * 800 + x * 4;
							var cR = imgData.data[pixPos];
							var cG = imgData.data[pixPos + 1];
							var cB = imgData.data[pixPos + 2];
							var xCol = {r:cR, g:cG, b:cB};
							ledFrame.push(xCol);
						}
						ledFrames.push(ledFrame);
					}
					dataImage = true;

					inFPS.value = 1;
					inTFPS.value = 60;
					inFPS.value = infoData[19];
					inTFPS.value = infoData[20];
					inRPM.value = infoData[21];

					var aniName = '';
					for(i = 0; i < 100; i ++){
						aniName += String.fromCharCode(infoData[22 + i]);
					}
					aniName = aniName.trim();
					aniIndex[selectedAnimation] = {name: aniName}
					storeAniIndex();
					openAnimationIndex();

					refreshFramesList();
					refreshLedSelectors();
					drawLedRing();
					drawAllFramePreviews();
					saveAnimation();

					refreshCounter();
					refreshCounter(ledFrames.length);
					actionUndo();
					showAnimationTime();

					closeImport({id:''});

				}
			}

			if(!dataImage){// not a valid data image
				alert('\n' + f.name + '\n\n' + txt_wrong_image);
			}
			openLeditor.files = fileListEmpty;
			return;
		}
		imgLeditor.src = src;
	}
	document.getElementById("openLeditor").addEventListener("change", loadLeditor, false);


	// ******************** Start Image import code ********************
	var 	imgImport = null,
		imgImportFile = null,
		imgImportSource = null,
		imgImportURL = null,
		imgImportData,
		scanAspect = 0, // 0 = Left-Right, 1 = Up-Down
		imgImportClick = {
			layerX:0,
			layerY:0,
			centerX:0,
			centerY:0
		},
		tableEditor = document.getElementById('editor'),
		blinkInterval = 0,
		prevSize = 396,
		previewL = 0, previewT = 0, previewW = prevSize, previewH = prevSize,
		imgSelectW = 0, imgSelectH = 0, imgSelectL = 0, imgSelectT = 0,
		imgSelectImportL = 0, imgSelectImportT = 0, imgSelectImportW = 0, imgSelectImportH = 0,
		importL = 0, importT = 0, importW = 0, importH = 0;

	canvImage.style.left = (2 + 840 - prevSize) + 'px';
	canvImage.style.top = 2 + 'px';
	canvImage.width = prevSize; canvImage.height = prevSize;
	var ctxImage = canvImage.getContext('2d');
	ctxImage.strokeRect(0, 0, canvImage.width, canvImage.height);


	function drawImport(ev) {
		if(document.getElementById("uploadimage").files[0] == undefined){//canceled
			f = imgImportFile;
			url = imgImportURL;
			src = imgImportSource;
			return;
		}

		var	f = document.getElementById("uploadimage").files[0],
			url = window.URL || window.webkitURL,
			src = url.createObjectURL(f);

		imgImport = new Image();
		imgImport.onload = function(){
			imgImportFile = f;
			imgImportURL = url;
			imgImportSource = src;

			sliderZoom.value = 0;
			imgImportClick = {
				layerX:0,
				layerY:0,
				centerX:Math.round(imgImport.width/2),
				centerY:Math.round(imgImport.height/2)
			}
			importL = 0; importT = 0; importW = 0; importH = 0;

			setupImportArea();
			url.revokeObjectURL(src);
			refreshButtons();
			refreshImageData();
			return;
		}
		imgImport.src = src;
	}

	document.getElementById("uploadimage").addEventListener("change", drawImport, false);


	function setupImportArea(){
		var	imgImportW = imgImport.width,
			imgImportH = imgImport.height,
			ctx = canvImport.getContext('2d'),
			ctx2 = canvImage.getContext('2d'),
			f = imgImportFile,
			url = imgImportURL,
			src = imgImportSource;


		refreshButtons();
		// setup preview
		var zoomFactor = 1 - sliderZoom.value;

		imgSelectW = Math.round(imgImportW * zoomFactor);
		imgSelectH = Math.round(imgImportH * zoomFactor);

		// adapt preview selection to zoom
		if(imgSelectW > imgSelectH){
			if(imgSelectH < imgImportH){
				imgSelectH = imgImportH;
			}
			if(imgSelectH > imgSelectW){imgSelectH = imgSelectW;}
		} else {
			if(imgSelectW < imgImportW){
				imgSelectW = imgImportW;
			}
			if(imgSelectW > imgSelectH){imgSelectW = imgSelectH;}
		}
		imgSelectL = Math.round(imgImportW / 2 - imgSelectW / 2);
		imgSelectT = Math.round(imgImportH / 2 - imgSelectH / 2);

		if(imgSelectW > imgSelectH){
			previewL = 0;
			previewW = prevSize;
			previewH = Math.round(prevSize / imgSelectW * imgSelectH);
			previewT = Math.round((prevSize - previewH) / 2);
		} else {
			previewT = 0;
			previewH = prevSize;
			previewW = Math.round(prevSize / imgSelectH * imgSelectW);
			previewL = Math.round((prevSize - previewW) / 2);
		}

		var	xCenter = imgImportClick.centerX,
			yCenter = imgImportClick.centerY;

		imgSelectL = Math.round(xCenter - imgSelectW / 2);
		if(imgSelectL < 0){imgSelectL = 0;}
		if(imgSelectL + imgSelectW > imgImportW){imgSelectL = imgImportW - imgSelectW;}

		imgSelectT = Math.round(yCenter - imgSelectH / 2);
		if(imgSelectT < 0){imgSelectT = 0;}
		if(imgSelectT + imgSelectH > imgImportH){imgSelectT = imgImportH - imgSelectH;}

		ctx2.fillStyle = '#ffffff';
		ctx2.strokeStyle = '#404040';
		ctx2.fillRect(0, 0, prevSize, prevSize);
		ctx2.strokeRect(0, 0, prevSize, prevSize);
		ctx2.drawImage(imgImport, imgSelectL, imgSelectT, imgSelectW, imgSelectH, previewL, previewT, previewW, previewH);


		switch(scanAspect){
			case 0: // l-r
				importL = 0;
				importW = previewW;
				importH = Math.round(importW * 0.12);

				canvImport.width = inFrames.value;
				canvImport.height = 24;
				break;

			case 1: // u-d
				importT = 0;
				importH = previewH;
				importW = Math.round(importH * 0.12);

				canvImport.width = 24;
				canvImport.height = inFrames.value;
				break;
		}

		// *** replace select area ***
		imgImportClick.layerX = Math.round((xCenter - imgSelectL) / (imgSelectW / previewW) + previewL);
		imgImportClick.layerY = Math.round((yCenter - imgSelectT) / (imgSelectH / previewH) + previewT);

		importArea.style.left = (canvImage.offsetLeft + previewL - 2) + 'px';
		importArea.style.top = (canvImage.offsetTop + previewT - 2) + 'px';
		importArea.style.width = importW + 'px';
		importArea.style.height = importH + 'px';

		canvImportV.width = importW;
		canvImportV.height = importH;
		canvImportV.style.width = importArea.style.width;
		canvImportV.style.height = importArea.style.height;

		// draw pixels
		importImageArea();

		switch(scanAspect){
			case 0: imgImportData = ctx.getImageData(0,0,inFrames.value,24); break;
			case 1: imgImportData = ctx.getImageData(0,0,24,inFrames.value); break;
		}

		// draw led matrix
		importImageToMatrix();
	}


	function changeScanAspect(){
		scanAspect ++; if(scanAspect == 2){scanAspect = 0;}
		var butScandir = document.getElementById("but_scan_direction");
		switch(scanAspect){
			case 0: bAspect = 'scan_right'; break;
			case 1: bAspect = 'scan_down'; break;
		}
		butScandir.innerHTML = '<img src="../assets/images/' + bAspect + '.png" height="30" width="30" style="float: center;">';
		setupImportArea();
		refreshImageData();
	}

	function importImageArea(){
		switch(scanAspect){
			case 0: // l-r
				imgSelectImportL = imgSelectL;
				imgSelectImportW = imgSelectW;
				imgSelectImportH = imgSelectW * 0.12;
				imgSelectImportT = imgSelectH / previewH * (importT - previewT) + imgSelectT;
				var	cnvW = inFrames.value,
					cnvH = 24;
				break;

			case 1: // u-d
				imgSelectImportT = imgSelectT;
				imgSelectImportH = imgSelectH;
				imgSelectImportW = imgSelectH * 0.12;
				imgSelectImportL = imgSelectW / previewW * (importL - previewL) + imgSelectL;
				var	cnvW = 24,
					cnvH = inFrames.value;
				break;
		}
		var ctx = document.getElementById('canvImport').getContext('2d');
		ctx.drawImage(imgImport, imgSelectImportL, imgSelectImportT, imgSelectImportW, imgSelectImportH, 0, 0, cnvW, cnvH);
	}

	function importImageToMatrix(){
		// copy imgImportData to matrix area & import area
		if(imgImport == null){return;}
		var	ctx3 = canvImportedFrames.getContext('2d'),
			ctxV = canvImportV.getContext('2d'),
			colorW = 15,
			colorH = 10,
			vSpace = 5,
			colorL = (canvImportedFrames.width - 24 * colorW) / 2;

		ctxV.fillStyle = '#000000';
		ctxV.fillRect(0,0,canvImportV.width, canvImportV.height);
		canvImportedFrames.height = inFrames.value * (colorH + vSpace);
		ctx3.fillStyle = '#000000';
		ctx3.fillRect(0, 0, canvImportedFrames.width, canvImportedFrames.height)

		switch(scanAspect){
			case 0: // l-r
				var	pixelSizeW = previewW / inFrames.value,
					pixelSizeH = previewW * 0.12 /24;

				for(var x = 0; x < inFrames.value; x++){
					for(var y = 0; y < 24; y++){
						var	pixelIndex = (y * inFrames.value + x) * 4,
							lCol = adjustColor({r:imgImportData.data[pixelIndex], g:imgImportData.data[pixelIndex + 1], b:imgImportData.data[pixelIndex + 2]}),
							vCol = getViewColor(lCol);

						ctxV.fillStyle='rgba(' + vCol.r + ', ' + vCol.g + ', ' + vCol.b + ',1)';
						ctxV.fillRect(Math.round(x * pixelSizeW), Math.round(y * pixelSizeH), Math.ceil(pixelSizeW), Math.ceil(pixelSizeH));

						if(vCol.r == 0 && vCol.g == 0 && vCol.b == 0){
							ctx3.fillStyle='#7f7f7f';
							ctx3.fillRect(colorL + (23 - y) * colorW + colorW/2, x * (colorH + vSpace) + colorH/2, 1, 1);
						} else {
							ctx3.fillStyle='rgba(' + vCol.r + ', ' + vCol.g + ', ' + vCol.b + ',1)';
							ctx3.fillRect(colorL + (23 - y) * colorW, x * (colorH + vSpace), colorW-1, colorH);
						}
					}
					ctx3.fillStyle='#7f7f7f';
					ctx3.fillRect(colorL + 11 * colorW + colorW/2 - 1, x * (colorH + vSpace) + colorH, 2, vSpace);
				}
				break;

			case 1: // u-d
				var	pixelSizeH = previewH / inFrames.value,
					pixelSizeW = previewH * 0.12 / 24;

				for(var x = 0; x < 24; x++){
					for(var y = 0; y < inFrames.value; y++){
						var	pixelIndex = (y * 24 + x) * 4,
							lCol = adjustColor({r:imgImportData.data[pixelIndex], g:imgImportData.data[pixelIndex + 1], b:imgImportData.data[pixelIndex + 2]}),
							vCol = getViewColor(lCol);

						ctxV.fillStyle='rgba(' + vCol.r + ', ' + vCol.g + ', ' + vCol.b + ',1)';
						ctxV.fillRect(Math.round(x * pixelSizeW), Math.round(y * pixelSizeH), Math.ceil(pixelSizeW), Math.ceil(pixelSizeH));

						if(vCol.r == 0 && vCol.g == 0 && vCol.b == 0){
							ctx3.fillStyle='#7f7f7f';
							ctx3.fillRect(colorL + x * colorW + colorW/2, y * (colorH + vSpace) + colorH/2, 1, 1);
						} else {
							ctx3.fillStyle='rgba(' + vCol.r + ', ' + vCol.g + ', ' + vCol.b + ',1)';
							ctx3.fillRect(colorL + x * colorW, y * (colorH + vSpace), colorW-1, colorH);
						}
						if(x == 0){
							ctx3.fillStyle='#7f7f7f';
							ctx3.fillRect(colorL + 11 * colorW + colorW/2 - 1, y * (colorH + vSpace) + colorH, 2, vSpace);
						}
					}
				}
				break;
		}
	}

	function importImageToFrames(){
		// copy imgImportData to frames
		switch(scanAspect){
			case 0: // l-r
				var frames = [];
				for(var x = 0; x < inFrames.value; x++){
					var frame = [];
					for(var y = 0; y < 24; y++){
						var	pixelIndex = (y * inFrames.value + x) * 4,
							lCol = adjustColor({r:imgImportData.data[pixelIndex], g:imgImportData.data[pixelIndex + 1], b:imgImportData.data[pixelIndex + 2]}),
							vCol = getViewColor(lCol),
							ledNr = y + 9;

						if(ledNr < 0){ledNr +=24;} else if(ledNr > 23){ledNr -=24;}
						frame[ledNr] = {r:vCol.r, g:vCol.g, b:vCol.b};
					}
					frames.push(frame);
				}
				break;

			case 1: // u-d
				var frames = [];
				for(var y = 0; y < inFrames.value; y++){
					var frame = [];
					for(var x = 0; x < 24; x++){
						var	pixelIndex = (y * 24 + x) * 4,
							lCol = adjustColor({r:imgImportData.data[pixelIndex], g:imgImportData.data[pixelIndex + 1], b:imgImportData.data[pixelIndex + 2]}),
							vCol = getViewColor(lCol),
							ledNr = 23 - x + 9;

						if(ledNr < 0){ledNr +=24;} else if(ledNr > 23){ledNr -=24;}
						frame[ledNr] = {r:vCol.r, g:vCol.g, b:vCol.b};
					}
					frames.push(frame);
				}
				break;
		}

		ledFrame = frame;
		ledFrames = frames.slice(0);
		inRPM.value = 0; inFPS.value = 10; inTFPS.value = 60;
		refreshFramesList();
		refreshLedSelectors();
		drawLedRing();
		drawAllFramePreviews();
		saveAnimation();
		refreshCounter();
		refreshCounter(ledFrames.length);
		actionUndo();
		showAnimationTime();
	}

	function adjustColor(col){// col = {r:, g:, b:}
		var	cR = col.r,
			cG = col.g,
			cB = col.b,
			brightVal = Number(sliderDimmer.value);

		if(brightVal < 0){
			cR = cR * (1 + brightVal);
			cG = cG * (1 + brightVal);
			cB = cB * (1 + brightVal);
		} else {
			cR = 255 - ((255-cR) * (1 - brightVal));
			cG = 255 - ((255-cG) * (1 - brightVal));
			cB = 255 - ((255-cB) * (1 - brightVal));
		}
		colHSL = rgbToHsl(cR, cG, cB);

		colHSL[0] += Number(sliderHue.value);
		colHSL[1] += Number(sliderSaturation.value);
		colHSL[2] += Number(sliderLightness.value);
		if(colHSL[0] > 1){colHSL[0] = colHSL[0] - 1;} else if(colHSL[0] < 0){colHSL[0] + 1;}
		if(colHSL[1] > 1){colHSL[1] = 1;} else if(colHSL[1] < 0){colHSL[1] = 0;}
		if(colHSL[2] > 1){colHSL[2] = 1;} else if(colHSL[2] < 0){colHSL[2] = 0;}

		col = hslToRgb(colHSL[0], colHSL[1], colHSL[2]);
		return {r:col.r, g:col.g, b:col.b};
	}

	function imageMouseDown(obj, objEvent){
		if(imgImport == null){return;}
		switch(obj.id){
		case 'canvImage':
			imgImportClick.layerX = objEvent.layerX;
			imgImportClick.layerY = objEvent.layerY;
			var	x = imgImportClick.layerX,
				y = imgImportClick.layerY;
			break;

		case 'importArea':
			imgImportClick.layerX = objEvent.layerX + importArea.offsetLeft - canvImage.offsetLeft + 2;
			imgImportClick.layerY = objEvent.layerY + importArea.offsetTop - canvImage.offsetTop + 2;
			var	x = imgImportClick.layerX,
				y = imgImportClick.layerY;
			break;
		}
		imgImportClick.centerX = Math.round((imgImportClick.layerX - previewL) * (imgSelectW / previewW) + imgSelectL);
		imgImportClick.centerY = Math.round((imgImportClick.layerY - previewT) * (imgSelectH / previewH) + imgSelectT);
		refreshImageData();
	}

	function refreshImageData(){
		var ctx = document.getElementById('canvImport').getContext('2d');
		switch(scanAspect){
			case 0:
				divImageFrames.scrollTop = (inFrames.value / previewW) * (imgImportClick.layerX - (prevSize - previewW) / 2) * 15 - divImageFrames.offsetHeight / 2;

				importT = (imgImportClick.layerY - Math.round(importH / 2));
				if(importT < previewT){
					importT = previewT;
				} else if(importT > previewT + previewH - importH){
					importT = previewT + previewH - importH;
				}
				importArea.style.top = (importT) + 'px';
				importImageArea();
				imgImportData = ctx.getImageData(0,0,inFrames.value,24);
				break;

			case 1:
				divImageFrames.scrollTop = (inFrames.value / previewH) * (imgImportClick.layerY - (prevSize - previewH) / 2) * 15 - divImageFrames.offsetHeight / 2;

				importL = (imgImportClick.layerX - Math.round(importW / 2));
				if(importL < previewL){
					importL = previewL;
				} else if(importL > previewL + previewW - importW){
					importL = previewL + previewW - importW;
				}
				importArea.style.left = (importL + canvImage.offsetLeft -2) + 'px';
				importImageArea();
				imgImportData = ctx.getImageData(0,0,24,inFrames.value);
				break;
		}
		canvImportV.style.width = importArea.style.width;
		canvImportV.style.height = importArea.style.height;
		importImageToMatrix();

	}

	function imageMouseMove(objEvent){
		if(imgImport == null){return;}
		switch(scanAspect){
			case 0: var sTop = inFrames.value / previewW * objEvent.layerX; break;
			case 1: var sTop = inFrames.value / previewH * objEvent.layerY; break;
		}
		divImageFrames.scrollTop = sTop * 15 - divImageFrames.offsetHeight / 2;
	}

	function sliderImportInput(obj){
		if(imgImport == null){obj.value = 0; return;}
		sliderImportActivate(obj);
	}

	function sliderImportWheel(obj, event){
		if(imgImport == null){obj.value = 0; return;}
		if(event.deltaY < 0){
			obj.stepUp(1);
		} else if(event.deltaY > 0){
			obj.stepDown(1);
		}
		sliderImportActivate(obj);
	}

	function sliderImportDouble(obj){
		if(imgImport == null){obj.value = 0; return;}
		obj.value = 0;
		sliderImportActivate(obj);
	}

	function sliderImportActivate(obj){
		switch(obj.id){
			case 'sliderDimmer':
				var xVal = Math.round(obj.value * 100);
				break;

			case 'sliderHue':
				var xVal = Math.round(obj.value * 360) + '&deg;';
				break;

			case 'sliderSaturation':
				var xVal = Math.round(obj.value * 100);
				break;

			case 'sliderLightness':
				var xVal = Math.round(obj.value * 200);
				break;

			case 'sliderZoom':
				var xVal = (Math.round((100 - obj.value * 100) * 100) / 100) + '%';
				break;
		}
		document.getElementById(obj.id + 'Val').innerHTML = xVal;
		if(obj.id == 'sliderZoom'){
			setupImportArea();
			refreshImageData();
		}
		importImageToMatrix();
	}

	function closeImport(obj){
		switch(obj.id){
			case 'but_import_accept':
				importImageToFrames();
				showAnimationTime();
				break;
		}
		document.getElementById('imageImporter').style.visibility = 'hidden';
		document.getElementById('editor').style.visibility = 'visible';
		clearInterval(blinkInterval);
	}
	// ******************** End Image import ********************


	var aniIndex = [];
	function openAnimationIndex(){

		// get stored animation index
		aniIndex = [];
		Homey.get('aniIndex', function(err, aIndex){
			if (aIndex == undefined){
				// create empty memory slots
				inFPS.value = 1; inTFPS.value = 60; inRPM.value = 0; ledFrames = [emptyFrame.slice(0)];
				var aIndex = [];
				for(var i=0; i<30; i++){
					aIndex.push({name: ('Animation ' + (i+1))});
					saveAnimation(i);
				}
				aniIndex = aIndex.slice(0);
				storeAniIndex();
			} else {
				aniIndex = aIndex.slice(0);
			}

			var xOptions = '';
			for(var i=0; i<30; i++){
				xOptions += '<option value="ani_' + i + '">' + (i+1) + ': ' + aniIndex[i].name + '</option>';
			}
			dropAnimation.innerHTML = xOptions;
			dropAnimation.selectedIndex = selectedAnimation;
		});
	}

	function storeAniIndex(){
		// store animation index
		Homey.set('aniIndex', aniIndex, function(err, aniIndex){
			if(err) return console.error('Could not set '+aniId, err);
		});
	}


	enableAniRename = false;
	function clickAniRename(setNewName){
		if(setNewName == undefined){setNewName = true;}

		enableAniRename = !enableAniRename;
		if(enableAniRename){
			butCopyAni.disabled = true;
			dropAnimation.disabled = true;
			butRenameAni.style.backgroundColor = '#e0ffe0';
			inName.style.visibility = 'visible';
			inName.value = aniIndex[selectedAnimation].name;
		} else {
			if(setNewName){
				aniIndex[selectedAnimation] = {name: inName.value.trim()};
				storeAniIndex();
			}
			openAnimationIndex();
			butCopyAni.disabled = false;
			dropAnimation.disabled = false;
			butRenameAni.style.backgroundColor = '#eeeeee';
			inName.style.visibility = 'hidden';
		}
	}

	function checkForKey(obj, objEvent){
		var keyC = objEvent.keyCode;
		switch(obj.id){
		case 'inName':
			if (enableAniRename && keyC == 13) { // ENTER key
				clickAniRename();
			}
			if (enableAniRename && keyC == 27) { // ESC key
				clickAniRename(false);
			}
			break;
		}
	}

	function changeAniName(obj){
		xName = obj.value;
		for(var i=0; i < xName.length; i++){
			var	checkCode = xName.charCodeAt(i),
				checkChar = xName.charAt(i);

			if(checkCode < 32 || checkCode > 126 || checkCode == 34 || checkCode == 39){// not allowed
				xName = xName.substr(0, i) + xName.substr(i+1);
				obj.value = xName;
			}
		}
	}

	// ************ Save / Open animation ************
	function saveAnimation(id){
		if(id == undefined){
			id = selectedAnimation;
		}
		if(id == ''){
			var xRepeat = inRepeat.value;
		} else {
			var xRepeat = 1;
		}
		var	aniId = 'animation' + id,
			aniDuration = xRepeat * Math.round(1000 * ledFrames.length / inFPS.value),
			xFPS = Number(inFPS.value), xTFPS = Number(inTFPS.value), xRPM = Number(inRPM.value),
			saveAni = {
				options: {
					fps	: xFPS, 	// animation frames per second
					tfps	: xTFPS, 	// view frames per second. every second will be interpolated xTFPS.value times
					rpm	: xRPM,		// ring rotations per minute
				},
				frames	: ledFrames,
				priority: 'INFORMATIVE',	// CRITICAL, FEEDBACK or INFORMATIVE
				duration: aniDuration		// duration in ms, or keep empty for infinite
			}

		Homey.set(aniId, saveAni, function(err, animation){
			if(err) return console.error('Could not set '+aniId, err);
		});
	}

	function openAnimation(id){
		infoLoad.style.visibility = 'visible';

		if(id == undefined){id = selectedAnimation;}
		var aniId = 'animation' + id;
		playFrame = 0;

		Homey.get(aniId, function(err, ani){
			if (ani == undefined){
				var	newFrame = [],
					newFrames = [];

				for(var i=0; i<24; i++){
					newFrame.push({r:0, g:0, b:0});
				}
				newFrames.push(newFrame);
				ani = {
					frames: newFrames,
					options: {
						fps: 1,
						tfps: 60,
						rpm: 0
					}
				}
			}

			ledFrames = ani.frames.slice(0);
			refreshCounter(); // reset
			refreshCounter(ledFrames.length);

			inFPS.value = ani.options.fps;
			inTFPS.value = ani.options.tfps;
			inRPM.value = ani.options.rpm;

			if (count_frames == 0) {addNewFrame();} // Always add at least one frame
			selectedFrame = 0;
			ledFrame = ledFrames[selectedFrame].slice(0);

			refreshFramesList();
			refreshLedSelectors();
			drawLedRing();
			drawAllFramePreviews();
			showAnimationTime();

			if(enableAniCopy){
				saveAnimation(selectedAnimation);
				dropAnimation.value = 'ani_'+selectedAnimation;
				clickAniCopy();
				actionUndo();
			} else {
				undoList = [];
				undoPointer = -1;
				actionUndo();
			}
			refreshButtons();
			infoLoad.style.visibility = 'hidden';
		});
	}

	function selectAnimation(obj){
		var id = Number(obj.value.substr(4));
		if(id != selectedAnimation){
			if(enableAniCopy){
				openAnimation(id);
			} else {
				saveAnimation(selectedAnimation);
				selectedAnimation = id;
				openAnimation();
			}
			butCopyAni.title = txt_ani_copy.replace('###', selectedAnimation+1);
		}
	}

	function showAnimationTime(){
		var	aniDuration = ledFrames.length / inFPS.value,
			repeatDuration = aniDuration * inRepeat.value,
			m = Math.floor(repeatDuration / 60).toString(),
			s = Math.round(repeatDuration - Math.floor(repeatDuration / 60) * 60).toString();

		if(m.length <2){m = '0' + m;}
		if(s.length <2){s = '0' + s;}
		document.getElementById('aniTime').innerHTML = ' = ' + aniDuration.toFixed(2) + ' sec.';
		document.getElementById('repeatTime').innerHTML = '= ' + m + ':' + s;
	}

	enableAniCopy = false;
	function clickAniCopy(){
		enableAniCopy = !enableAniCopy;
		if(enableAniCopy){
			butRenameAni.disabled = true;
			butCopyAni.style.backgroundColor = '#ffe0e0';
			dropAnimation.style.backgroundColor = '#ffe0e0';
		} else {
			butRenameAni.disabled = false;
			butCopyAni.style.backgroundColor = '#eeeeee';
			dropAnimation.style.backgroundColor = '#eeeeee';
		}
	}







	function getFrameListRow(idx, titRemove){
		var xCol = getTopColor();
		trLine = '<tr id="frameLine' + idx + '" style="background-color:' + xCol.b + '; color:' + xCol.t + '; border: 1px solid #707070;" onmouseover="showFrameControls(this);" onmouseout="hideFrameControls(this);" onClick="frameSelect(this);">';
		trLine += '<td style="width: 30px; text-align: center; font-size: 14px;">' + (idx+1) + '</td>';
		trLine += '<td style="width: 240px;"><canvas id="canvPre' + idx + '" width=240 height=30></canvas></td>';
		trLine += '<td style="width: 10px;"></td>';
		trLine += '<td style="width: 20px;">';
		if(idx > 0){
			trLine += '<button id="moveUp' + idx + '" style="visibility: hidden; width:20px; height:20px; padding: 0px 0px;" title="' + txtMoveUp + '" onmousedown="clickFrameMove(this);"><img src="../assets/images/frame_up.png" height="16" width="16" style="float: center;"></button>';
		}
		trLine += '</td>';

		trLine += '<td style="width: 20px;">';
		if(idx < ledFrames.length-1){
			trLine += '<button id="moveDown' + idx + '" style="visibility: hidden; width:20px; height:20px; padding: 0px 0px;" title="' + txtMoveDown + '" onmousedown="clickFrameMove(this);"><img src="../assets/images/frame_down.png" height="16" width="16" style="float: center;"></button>';
		}
		trLine += '</td>';

		trLine += '<td style="width: 20px;"></td>';
		trLine += '<td style="width: 20px;"><button id="rem' + idx + '" style="visibility: hidden; width:20px; height:20px; padding: 0px 0px;" title="' + titRemove + '" onmouseover="this.style.backgroundColor =\'#f44336\';" onmouseout="this.style.backgroundColor=\'#eeeeee\';" onclick="removeFrame(this);"><img src="../assets/images/frame_delete.png" height="16" width="16" style="float: center;"></button></td>';

		trLine += '<td></td>';
		trLine += '</tr>';
		return (trLine);
	}

	function showFrameControls(obj){
		if(!playMode){
			xId = Number(obj.id.substr(9));
			if(xId > 0){document.getElementById('moveUp' + xId).style.visibility = 'visible';}
			if(xId < ledFrames.length-1){document.getElementById('moveDown' + xId).style.visibility = 'visible';}
			document.getElementById('rem' + xId).style.visibility = 'visible';
		}
	}

	function hideFrameControls(obj){
		xId = Number(obj.id.substr(9));
		if(xId > 0){document.getElementById('moveUp' + xId).style.visibility = 'hidden';}
		if(xId < ledFrames.length-1){document.getElementById('moveDown' + xId).style.visibility = 'hidden';}
		document.getElementById('rem' + xId).style.visibility = 'hidden';
	}

	function clickFrameMove(obj){
		var	xId = obj.id,
			newFrames = [];

		if(xId.substr(0,6) == 'moveUp'){
			var xMove = -1;
			xId = Number(xId.substr(6));
		} else {
			var xMove = 1;
			xId = Number(xId.substr(8));
		}
		var tempFrame = ledFrames[xId + xMove].slice(0);
		ledFrames[xId + xMove] = ledFrames[xId].slice(0);
		ledFrames[xId] = tempFrame.slice(0);

		refreshFramesList();
		actionUndo();
		selectedFrame = xId + xMove;
		frameSelect({id:'frameLine'+selectedFrame});
		divFrameScroll.scrollTop += (document.getElementById('frameLine0').offsetHeight * xMove) ;
	}


	function clickFrameEdit(obj){
		switch(obj.id){
		case 'but_ani_open':
			but_generator_close.click();
			openLeditor.click();
			break;

		case 'but_ani_store':
			storeLeditor();
			break;

		case 'but_frame_add':
		case 'but_frame_copy':
			but_generator_close.click();
			switch(obj.id){
				case 'but_frame_add':
					var newFrame = emptyFrame.slice(0);
					ledFrames.splice(selectedFrame + 1, 0, newFrame);
					break;
				case 'but_frame_copy':
					var newFrame = ledFrames[selectedFrame].slice(0);
					ledFrames.splice(selectedFrame + 1, 0, newFrame);
					break;
			}
			refreshCounter(1);
			selectedFrame += 1;
			refreshFramesList();
			actionUndo();
			divFrameScroll.scrollTop += document.getElementById('frameLine0').offsetHeight ;
			break;

		case 'but_ani_fill_flow':
			but_generator_close.click();
			aniFill('flow');
			refreshFramesList();
			actionUndo();
			break;

		case 'but_ani_fill_connect':
			but_generator_close.click();
			aniFill('connect');
			refreshFramesList();
			actionUndo();
			break;

		case 'but_ani_generator':
			generatorOn = true;
			refreshButtons();

			for(var i=0; i< 3; i ++){
				var	cR = generatorColor[i][0],
					cG = generatorColor[i][1],
					cB = generatorColor[i][2];
				document.getElementById('generatorCol' +(i+1)).style.backgroundColor = 'rgba(' + generatorColor[i][0] + ',' + generatorColor[i][1] + ',' + generatorColor[i][2] + ',1)';
				document.getElementById('generatorCol' +(i+1)).innerHTML = getColorName({r:cR, g:cG, b:cB});
			}
			divEdit.style.visibility = 'hidden';
			generatePattern.style.visibility = 'visible';
			but_ani_generator.style.visibility = 'hidden';
			break;

		case 'but_generator_close':
			colorSelector = 0;
			generatorOn = false;
			refreshButtons();
			divEdit.style.visibility = 'visible';
			generatePattern.style.visibility = 'hidden';
			but_ani_generator.style.visibility = 'visible';
			break;

		case 'but_image_import':
			document.getElementById('imageImporter').style.visibility = 'visible';
			document.getElementById('editor').style.visibility = 'hidden';
			blinkInterval = setInterval(function(){
				var xT = Math.floor(new Date().getMilliseconds() / 500);
				switch(xT){
					case 0: importArea.style.borderColor = "#ffffff"; break;
					case 1: importArea.style.borderColor = "#000000"; break;
				}
			}, 500);
			break;

		case 'but_frame_clock':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					frameRotateClock(i);
				}
			} else {
				frameRotateClock(selectedFrame);
			}
			refreshFramesList();
			actionUndo();
			break;

		case 'but_frame_counterclock':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					frameRotateCounterclock(i);
				}
			} else {
				frameRotateCounterclock(selectedFrame);
			}
			refreshFramesList();
			actionUndo();
			break;

		case 'but_frame_push':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					framePush(i);
				}
			} else {
				framePush(selectedFrame);
			}
			refreshFramesList();
			actionUndo();
			break;

		case 'but_frame_pull':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					framePull(i);
				}
			} else {
				framePull(selectedFrame);
			}
			refreshFramesList();
			actionUndo();
			break;

		case 'but_edit_fill':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					frameFill(i);
				}
				drawAllFramePreviews();
			} else {
				frameFill(selectedFrame);
				drawFramePreview(selectedFrame);
			}

			actionUndo();
			refreshFramesList();
			refreshButtons();
			refreshLedSelectors();
			drawLedRing();
			break;

		case 'but_edit_flow':
			but_generator_close.click();
			if(checkAllFrames.checked){
				for(var i = 0; i < ledFrames.length; i++){
					frameFlow(i);
				}
				drawAllFramePreviews();
			} else {
				frameFlow(selectedFrame);
				drawFramePreview(selectedFrame);
			}
			actionUndo();
			refreshFramesList();
			refreshButtons();
			refreshLedSelectors();
			drawLedRing();
			break;

		case 'checkAllFrames':
			for(var i = 0; i < 8; i ++){
				xLine = document.getElementById('lineFrameAccess' + i);
				if(checkAllFrames.checked){
					var dArray = '2, 0';
				} else {
					var dArray = '1, 3';
				}
				xLine.setAttribute('stroke-dasharray', dArray);
			}
			break;
		}
	}


	function aniFill(fillType){
		var	frameStart = {id:-1},
			frameEnd = {id:-1};

		if(fillType == undefined){fillType = '';}

		for(var fr = 0; fr < ledFrames.length; fr ++){
			var ledVal = 0;
			for(var led = 0; led < 24; led ++){
				var	cR = Number(ledFrames[fr][led].r),
					cG = Number(ledFrames[fr][led].g),
					cB = Number(ledFrames[fr][led].b);

				ledVal += (cR + cG + cB);
			}

			// When all leds are off in this frame, find previous on-frame
			if(ledVal == 0 && frameStart.id == -1){
					var startId = fr - 1;
				if(startId < 0){startId += ledFrames.length;}
				while(startId != fr && frameStart.id == -1){
					ledVal = 0;
					for(led = 0; led < 24; led ++){
						cR = Number(ledFrames[startId][led].r);
						cG = Number(ledFrames[startId][led].g);
						cB = Number(ledFrames[startId][led].b);
						ledVal += (cR + cG + cB);
					}
					if(ledVal > 0){
						var frameData = ledFrames[startId].slice(0);
						frameStart = {id:startId, frame:frameData}
					}
					startId --;
					if(startId < 0){startId += ledFrames.length;}
				}

				// When start-frame found, find end-frame
				if(frameStart.id != -1){
					var endId = fr + 1;
					if(endId >= ledFrames.length){endId -= ledFrames.length;}
					while(endId != fr && frameEnd.id == -1){
						ledVal = 0;
						for(led = 0; led < 24; led ++){
							cR = Number(ledFrames[endId][led].r);
							cG = Number(ledFrames[endId][led].g);
							cB = Number(ledFrames[endId][led].b);
							ledVal += (cR + cG + cB);
						}
						if(ledVal > 0){
							var frameData = ledFrames[endId].slice(0);
							frameEnd = {id:endId, frame:frameData}
						}
						endId ++;
						if(endId >= ledFrames.length){endId -= ledFrames.length;}
					}
				}

				// When start and end are found, fill frames inbetween
				if(frameStart.id != -1 && frameEnd.id != -1){
					// how many steps to do?
					if(frameEnd.id > frameStart.id){
						var fStep = frameEnd.id - frameStart.id;
					} else {
						var fStep = ledFrames.length + frameEnd.id - frameStart.id;
					}

					var ctrl = [];

					switch(fillType){
					case'connect':
						// **** connect fill ****
						// collect control data for each led
						for(led = 0; led < 24; led ++){
							var	ctrlArray = [],
								col1 = ledFrames[frameStart.id][led];

							if(col1.r + col1.g + col1.b > 0){

								var id2 = [24, 24];
								for(var led2 = 0; led2 < 24; led2 ++){
									var ledNr = led + led2;
									if(ledNr > 23){ledNr -= 24;}
									var col2 = ledFrames[frameEnd.id][ledNr];
									if(col2.r + col2.g + col2.b > 0){
										id2[0] = ledNr;
										led2 = 24;
									}
								}
								for(var led2 = 0; led2 < 24; led2 ++){
									var ledNr = led - led2;
									if(ledNr < 0){ledNr += 24;}
									var col2 = ledFrames[frameEnd.id][ledNr];
									if(col2.r + col2.g + col2.b > 0){
										id2[1] = ledNr;
										led2 = 24;
									}
								}

								var movePos1 = id2[0] - led;
								if(movePos1 > 12){movePos1 = -24 + movePos1;}
								if(movePos1 < -12){movePos1 = 24 + movePos1;}

								var movePos2 = id2[1] - led;
								if(id2[1] != 24){
									var movePos2 = id2[1] - led;
									if(movePos2 > 12){movePos2 = -24 + movePos2;}
									if(movePos2 < -12){movePos2 = 24 + movePos2;}

									if(Math.abs(movePos2) < Math.abs(movePos1)){
										movePos1 = movePos2;
										id2[0] = id2[1];
									} else if(movePos2 !=0 && Math.abs(movePos2) == Math.abs(movePos1)){
										var	colStepR = (ledFrames[frameEnd.id][id2[1]].r - col1.r) / fStep,
											colStepG = (ledFrames[frameEnd.id][id2[1]].g - col1.g) / fStep,
											colStepB = (ledFrames[frameEnd.id][id2[1]].b - col1.b) / fStep,
											moveStep = movePos2 / fStep;
										ctrlArray.push({r:col1.r, g:col1.g, b:col1.b, stepR:colStepR, stepG:colStepG, stepB:colStepB, posL:led, posStep:moveStep});
									}
								}
								var	colStepR = (ledFrames[frameEnd.id][id2[0]].r - col1.r) / fStep,
									colStepG = (ledFrames[frameEnd.id][id2[0]].g - col1.g) / fStep,
									colStepB = (ledFrames[frameEnd.id][id2[0]].b - col1.b) / fStep,
									moveStep = movePos1 / fStep;
								ctrlArray.push({r:col1.r, g:col1.g, b:col1.b, stepR:colStepR, stepG:colStepG, stepB:colStepB, posL:led, posStep:moveStep});

							}
							ctrl[led] = ctrlArray.slice(0);
						}

						var frEdit = frameStart.id+1;
						while(frEdit != frameEnd.id){
							var frameNew = emptyFrame.slice(0);

							for(led = 0; led < 24; led ++){
								for(var i=0; i < ctrl[led].length; i++){
									ctrl[led][i].r += ctrl[led][i].stepR;
									ctrl[led][i].g += ctrl[led][i].stepG;
									ctrl[led][i].b += ctrl[led][i].stepB;
									ctrl[led][i].posL += ctrl[led][i].posStep;
									if(ctrl[led][i].posL > 23){ctrl[led][i].posL -= 24}
									if(ctrl[led][i].posL < 0){ctrl[led][i].posL += 24}

									var	ledNr = Math.round(ctrl[led][i].posL),
										ledLevel2 = ctrl[led][i].posL - Math.floor(ctrl[led][i].posL),
										ledLevel1 = 1 - ledLevel2;

									ledLevel1 = 1;
									if(ledNr > 23){ledNr -= 24}
									ledNr2 = ledNr +1; if(ledNr2 > 23){ledNr2 -= 24}
									var	cR = Math.round(ctrl[led][i].r * ledLevel1),
										cG = Math.round(ctrl[led][i].g * ledLevel1),
										cB = Math.round(ctrl[led][i].b * ledLevel1);

									frameNew[ledNr] = {r:cR, g:cG, b:cB};
								}
							}

							ledFrames[frEdit] = frameNew.slice(0);
							frEdit ++; if(frEdit == ledFrames.length){frEdit = 0;}
						}
						break;

					case'flow':
						// **** vertical fill ****
						// collect control data for each led
						for(led = 0; led < 24; led ++){
							var	col1 = ledFrames[frameStart.id][led],
								col2 = ledFrames[frameEnd.id][led],
								colStepR = (col2.r - col1.r) / fStep,
								colStepG = (col2.g - col1.g) / fStep,
								colStepB = (col2.b - col1.b) / fStep;

							ctrl[led] = {r:col1.r, g:col1.g, b:col1.b, stepR:colStepR, stepG:colStepG, stepB:colStepB}
						}

						var frEdit = frameStart.id+1;
						while(frEdit != frameEnd.id){
							var frameNew = [];
							for(led = 0; led < 24; led ++){
								ctrl[led].r += ctrl[led].stepR;
								ctrl[led].g += ctrl[led].stepG;
								ctrl[led].b += ctrl[led].stepB;
								frameNew.push({r:Math.round(ctrl[led].r), g:Math.round(ctrl[led].g), b:Math.round(ctrl[led].b)});
							}
							ledFrames[frEdit] = frameNew.slice(0);
							frEdit ++; if(frEdit == ledFrames.length){frEdit = 0;}
						}
						break;

					default:
						return;
					}


					// go on finding next hole
					fr = Number(frameEnd.id-1);
					frameStart = {id:-1};
					frameEnd = {id:-1};
				}
			}
		}
	}

	function frameFill(frameNr){
		var newFrame = ledFrames[frameNr].slice(0);

		var colFill = [0,0,0];
		for(var i=0; i<48; i++){
			colN = i; if(colN>23){colN -= 24;}
			var codeRGB = newFrame[colN].r + ',' + newFrame[colN].g + ',' + newFrame[colN].b;
			if(!(codeRGB == '0,0,0')){
				colFill = [Number(newFrame[colN].r), Number(newFrame[colN].g), Number(newFrame[colN].b)];
			} else {
				newFrame[colN] = {r:colFill[0], g:colFill[1], b:colFill[2]}
			}
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function frameFlow(frameNr){
		var newFrame = ledFrames[frameNr].slice(0);
		var	col1 = -1,
			col2 = -1;

		for(var i=0; i<=48; i++){
			var colN = i; while(colN>23){colN -= 24;}
			var codeRGB = newFrame[colN].r + ',' + newFrame[colN].g + ',' + newFrame[colN].b;
			if(!(codeRGB == '0,0,0')){
				if(col2 == -1){
					col1 = i;
				}

				if(col2 == -2){
					col2 = i;
					var	l1 = col1,
						l2 = col2;

					if(l1>23){l1 -= 24;}
					if(l2>23){l2 -= 24;}
					var	colR = Number(newFrame[l1].r),
						colG = Number(newFrame[l1].g),
						colB = Number(newFrame[l1].b),
						colStepR = (Number(newFrame[l2].r) - colR) / (col2-col1),
						colStepG = (Number(newFrame[l2].g) - colG) / (col2-col1),
						colStepB = (Number(newFrame[l2].b) - colB) / (col2-col1);

					for(var j = col1; j<= col2; j++){
						var xj = j; while(xj>23){xj -= 24;}
						newFrame[xj] = {r:Math.round(colR), g:Math.round(colG), b:Math.round(colB)}
						colR += colStepR;
						colG += colStepG;
						colB += colStepB;
					}
					col1 = col2; col2 = -1;
				}
			} else {
				if(col1 > -1){col2 = -2;}
			}
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function framePush(frameNr){
		var newFrame = [];
		for(var i = 0; i<24; i++){

			if(i == 9 || i == 21){
				newFrame[i] = ledFrames[frameNr][i];
			} else if (i>21 || i<9){
				var xIndex = i + 1;
				if(xIndex > 23){xIndex -= 24;}
				if(xIndex == 9){xIndex = 22;}
				newFrame[xIndex] = ledFrames[frameNr][i];

			} else if (i>9 && i<21){
				var xIndex = i - 1;
				if(xIndex == 9){xIndex = 20;}
				newFrame[xIndex] = ledFrames[frameNr][i];
			}
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function framePull(frameNr){
		var newFrame = [];
		for(var i = 0; i<24; i++){

			if(i == 9 || i == 21){
				newFrame[i] = ledFrames[frameNr][i];
			} else if (i>21 || i<9){
				var xIndex = i - 1;
				if(xIndex<0){xIndex += 24;}
				if(xIndex == 21){xIndex = 8;}
				newFrame[xIndex] = ledFrames[frameNr][i];

			} else if (i>9 && i<21){
				var xIndex = i + 1;
				if(xIndex == 21){xIndex = 10;}
				newFrame[xIndex] = ledFrames[frameNr][i];
			}
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function frameRotateClock(frameNr){
		var newFrame = [];
		for(var i = 0; i<24; i++){
			var xIndex = i + 1; if(xIndex>23){xIndex -= 24;}
			newFrame[xIndex] = ledFrames[frameNr][i];
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function frameRotateCounterclock(frameNr){
		var newFrame = [];
		for(var i = 0; i<24; i++){
			var xIndex = i - 1; if(xIndex<0){xIndex += 24;}
			newFrame[xIndex] = ledFrames[frameNr][i];
		}
		ledFrames[frameNr] = newFrame.slice(0);
	}

	function addNewFrame() {
		ledFrames.push(emptyFrame.slice(0));
		refreshCounter(1);
		selectedFrame = ledFrames.length-1;
		refreshFramesList();
	}

	function removeFrame(obj){
		var id = obj.id;
		selectedFrame = Number(id.substr(3));
		ledFrames.splice(selectedFrame, 1);
		refreshCounter(-1);
		if(ledFrames.length == 0){
			addNewFrame();
		} else {
			if(selectedFrame >= ledFrames.length){
				selectedFrame = ledFrames.length - 1;
			}
			refreshFramesList();
		}
		actionUndo();
	}

	function frameSelect(obj){
		if(document.getElementById(obj.id) == undefined){return;}
		var idx = obj.id;
		but_generator_close.click();
		selectedFrame = Number(idx.substr(9));
		activateSelect();
	}

	function activateSelect(){
		var xCol = getTopColor();
		if(selectedFrame >= ledFrames.length){
			selectedFrame = ledFrames.length - 1;
		}
		for(var i = 0; i < ledFrames.length; i++){
			var xElement = document.getElementById('frameLine' + i);
			if(i == selectedFrame){
				document.getElementById('frameLine' + i).style.backgroundColor = '#808080';
				document.getElementById('frameLine' + i).style.color = xCol.t;
			} else {
				document.getElementById('frameLine' + i).style.backgroundColor = xCol.b;
				document.getElementById('frameLine' + i).style.color = xCol.t;
			}
		}

		ledFrame = ledFrames[selectedFrame].slice(0);
		refreshLedSelectors();
		refreshFrameNr(selectedFrame + 1);
		drawLedRing();
		butAddFrame.title = txt_frame_add.replace('###', selectedFrame+1);
		butCopyFrame.title = txt_frame_copy.replace('###', selectedFrame+1);
		refreshButtons();
	}

	function refreshFramesList(){
		divFrameScroll.style.backgroundColor = getTopColor().b;
		var tempDoc = '';
		ledFrames.forEach(function(item, index){
			xFrame = ledFrames[index].slice(0);
			tempDoc = tempDoc + getFrameListRow(index, getTooltip('frame', index + 1));
		});
		tableFrames.innerHTML = tempDoc;
		drawAllFramePreviews();
		activateSelect();
	}

	function refreshFrameNr(nr){
		frameNumber.innerHTML = 'Frame: ' + nr;
	}


	function drawFramePreview(idx){
		if(ledFrames[idx] != undefined && selectedFrame>=0){
			var	canvPrev = document.getElementById('canvPre'+idx),
				ctxPrev = canvPrev.getContext("2d"),
				canvH = canvPrev.height,
				colW = canvPrev.width/24,
				xCol = getTopColor();

			ctxPrev.clearRect(0, 0, canvPrev.width, canvH);

			ledFrames[idx].forEach(function(item, index){
				var vColor = getViewColor(item);
				var colH = canvH/2;

				var xPos = 8-index;
				if(xPos < 0){xPos += 24;}
				ctxPrev.fillStyle = 'rgba(' + vColor.r + ',' + vColor.g + ',' + vColor.b + ',1)';
				ctxPrev.strokeStyle = xCol.t;
				ctxPrev.lineWidth = 0.5;
				switch(index){
				case 9:
					ctxPrev.strokeRect(0, canvH*0.85 , 0, canvH*0.2);
					ctxPrev.fillRect(-colW/2, canvH / 2 - colH / 2, colW, colH);
					ctxPrev.strokeStyle = "#808080";
					ctxPrev.strokeRect(-colW/2, canvH / 2 - colH / 2, colW, colH);
				default:
					if(Math.floor((index+3) / 6) * 6 == index+3){
						ctxPrev.strokeRect(xPos * colW + colW, canvH*0.85 , 1, canvH*0.2);
					} else {
						ctxPrev.strokeRect(xPos * colW + colW, canvH*0.9 , 0, canvH*0.1);
					}
					ctxPrev.fillRect(xPos * colW + colW/2, canvH / 2 - colH / 2, colW, colH);
					ctxPrev.strokeStyle = "#808080";
					ctxPrev.strokeRect(xPos * colW + colW/2, canvH / 2 - colH / 2, colW, colH);
				}
			});
		}
	}

	function drawAllFramePreviews(){
		for(var i = 0; i < ledFrames.length; i++){
			drawFramePreview(i);
		}
	}

	function getTooltip(txt, nr){
		return (txtRemove + ':\n' + txt + ' ' + nr);
	}

	function refreshCounter(stepVal){
	// frames counter.
	// <stepVal> = count_frames change.
	// <stepVal> = undefined --> reset: set count_frames = 0

		if(stepVal == undefined){
			count_frames = 0;
		} else{
			count_frames += stepVal;
		}
		refreshButtons();
		xDoc = document.getElementById("frameCount");
		var xCount = count_frames + ' frame';
		if(count_frames > 1){xCount += 's';}
		xDoc.innerHTML = xCount;
		showAnimationTime();
	}

	function drawLedRing(){
		ctxDraw = canvRing.getContext("2d");

		var	ringRadius = caseRadius * 1.05,
			ledSize = Math.PI * ringRadius / 24, // (Pi * r) / number of leds
			ledFactor = ledSize / ledW,
			alpha = 0;

		canvRing.style.filter = 'blur(' + ledSize*0.3 + 'px)';
		canvRing2.style.filter = 'blur(' + ledSize*0.3 + 'px)';

		for(var i=0; i<24; i++){
			var	cR = Number(ledFrame[i].r),
				cG = Number(ledFrame[i].g),
				cB = Number(ledFrame[i].b);

			if(cR>0 || cG>0 || cB>0){alpha ++;}
		}
		if(alpha > 0){alpha = 0.15/alpha;}

		ctxDraw.shadowBlur = 0;
		ctxDraw.clearRect(0, 0, editW, editW);

		// draw leds
		ctxDraw.globalCompositeOperation='lighter';
		for(var i=0; i<24; i++){
			var codeRGB = ledFrame[i].r + ',' + ledFrame[i].g + ',' + ledFrame[i].b;

			if(codeRGB != '0,0,0'){
				var cView = getViewColor(ledFrame[i]);

				cR = Number(cView.r);
				cG = Number(cView.g);
				cB = Number(cView.b);
				if(cR>=cG && cR>=cB){
					cMultiply = 255/cR;
					cBright = cR/255;
				} else if(cG>=cB){
					cMultiply = 255/cG;
					cBright = cG/255;
				} else {
					cMultiply = 255/cB;
					cBright = cB/255;
				}

				var brightness = (cR + cG + cB) / 255;
				if(brightness <= 1){
					brightness = brightness;
				} else {
					brightness = 1 - ((brightness -1) / 2);
				}
				brightness = brightness * 0.3;

				cR = Math.round(Number(cView.r) * cMultiply); if(cR > 255){cR = 255;}
				cG = Math.round(Number(cView.g) * cMultiply); if(cG > 255){cG = 255;}
				cB = Math.round(Number(cView.b) * cMultiply); if(cB > 255){cB = 255;}
				var	codeRGBview = cR + ',' + cG + ',' + cB,
					angle = (i+9) * 2 * Math.PI / 24,
					cos = Math.cos(angle),
					sin = Math.sin(angle),
					xPos = editW2 + ringRadius * cos,
					yPos = editW2 + ringRadius * sin,
					grd = ctxDraw.createRadialGradient(xPos, yPos, 0, xPos, yPos, ledW);

				grd.addColorStop(0 , 'rgba('+ codeRGBview + ',' + (0.7 + cBright * 0.3) + ')');
				grd.addColorStop(ledFactor * 0.5,'rgba('+ codeRGBview + ',' + (cBright) + ')');
				grd.addColorStop(ledFactor * 1.0,'rgba('+ codeRGBview + ',' + (cBright*0.9) + ')');
				grd.addColorStop(ledFactor * 1.2,'rgba('+ codeRGBview + ',' + alpha + ')');
				grd.addColorStop(1 , 'rgba('+ codeRGBview + ',' + alpha + ')');
				ctxDraw.fillStyle = grd;
				ctxDraw.beginPath();
				ctxDraw.arc(xPos, yPos, ledW+1, 0, 2 * Math.PI);
				ctxDraw.fill();

				// center brightness
				var grd = ctxDraw.createRadialGradient(xPos, yPos, 0, xPos, yPos, ledW);
				grd.addColorStop(0 , 'rgba(255, 255, 255,' + (brightness) + ')');
				grd.addColorStop(ledFactor * 0.5 , 'rgba('+ codeRGBview + ',' + (brightness * 0.7) + ')');
				grd.addColorStop(ledFactor * 1 , 'rgba('+ codeRGBview + ', 0)');
				grd.addColorStop(1 , 'rgba('+ codeRGBview + ', 0)');
				ctxDraw.fillStyle = grd;
				ctxDraw.beginPath();
				ctxDraw.arc(xPos, yPos, ledSize, 0, 2 * Math.PI);
				ctxDraw.fill();
			}
		}

		// ring radiation
		ctxDraw.globalCompositeOperation='destination-over';
		for(var i=0; i<24; i++){
			var codeRGB = ledFrame[i].r + ',' + ledFrame[i].g + ',' + ledFrame[i].b;

			if(codeRGB != '0,0,0'){
				var cView = getViewColor(ledFrame[i]);

				cR = Number(cView.r);
				cG = Number(cView.g);
				cB = Number(cView.b);
				if(cR>=cG && cR>=cB){
					cMultiply = 255/cR;
					cBright = cR/255;
				} else if(cG>=cB){
					cMultiply = 255/cG;
					cBright = cG/255;
				} else {
					cMultiply = 255/cB;
					cBright = cB/255;
				}

				cR = Math.round(Number(cView.r) * cMultiply); if(cR > 255){cR = 255;}
				cG = Math.round(Number(cView.g) * cMultiply); if(cG > 255){cG = 255;}
				cB = Math.round(Number(cView.b) * cMultiply); if(cB > 255){cB = 255;}
				var	codeRGBview = cR + ',' + cG + ',' + cB,
					angle = (i+9) * 2 * Math.PI / 24,
					cos = Math.cos(angle),
					sin = Math.sin(angle),
					xPos = editW2 + ringRadius * cos,
					yPos = editW2 + ringRadius * sin,
					grd = ctxDraw.createRadialGradient(xPos, yPos, 0, xPos, yPos, ledSize * 5);

				grd.addColorStop(0, 'rgba('+ codeRGBview + ',' + (cBright * 0.9) + ')');
				grd.addColorStop(1, 'rgba('+ codeRGBview + ',' + alpha + ')');

				ctxDraw.fillStyle = grd;
				ctxDraw.beginPath();
				ctxDraw.arc(xPos, yPos, ledW+1, 0, 2 * Math.PI);
				ctxDraw.fill();
			}
		}

		// background
		ctxDraw.globalCompositeOperation='destination-over';
		ctxDraw.fillStyle = '#000000';
		ctxDraw.fillRect(0, 0, editW, editW);
	}


	function drawTop(){
		var	xCol = getTopColor(),
			cR = parseInt(xCol.b.substr(1,2), 16),
			cG = parseInt(xCol.b.substr(3,2), 16),
			cB = parseInt(xCol.b.substr(5,2), 16);

		txtLedRing.style.color = xCol.t;
		frameNumber.style.color = xCol.t;

		ctxTop.clearRect(0,0,editW,editW);
		// draw case
		var grd = ctxTop.createRadialGradient(editW2, editW2, 0, editW2, editW2, caseRadius);
		grd.addColorStop(0 , 'rgba(255, 255, 255, 1)');
		grd.addColorStop(0.9, 'rgba(136, 136, 136, 1)');
		grd.addColorStop(1 , 'rgba(128, 128, 128, 0.8)');
		ctxTop.fillStyle = grd;
		ctxTop.beginPath();
		ctxTop.arc(editW2, editW2, caseRadius, 0, 2 * Math.PI);
		ctxTop.fill();

		// cut ring
		grd = ctxTop.createRadialGradient(editW2, editW2, 1, editW2, editW2, editW2);
		grd.addColorStop(0 , 'rgba(' + cR + ', ' + cG + ', ' + cB + ', 0)');
		grd.addColorStop(0.94 , 'rgba(' + cR + ', ' + cG + ', ' + cB + ', 0)');
		grd.addColorStop(0.943 , 'rgba(' + cR + ', ' + cG + ', ' + cB + ', 1)');
		grd.addColorStop(1 , 'rgba(' + cR + ', ' + cG + ', ' + cB + ', 1)');
		ctxTop.fillStyle = grd;
		ctxTop.fillRect(0,0,editW,editW);
	}

	function changeTopColor(){
		topColor ++;
		if(topColor > 3){topColor = 0;}
		Homey.set('topColor', topColor, function(err, topColor){
			if(err) return console.error('Could not set topColor');
		});
		drawTop();
		refreshFramesList();
	}

	function getTopColor(){
		switch(topColor){// colTop = 0...3 (black, 33% grey, 67% grey, white)
			case 0: var	bB = '#000000',
					bT = '#ffffff';
				break;

			case 1: var	bB = '#555555',
					bT = '#ffffff';
				break;

			case 2: var	bB = '#aaaaaa',
					bT = '#000000';
				break;

			default: var	bB = '#ffffff',
					bT = '#000000';
		}
		return {b:bB, t:bT};
	}


	var borderMarkerW = 2;
	function refreshLedSelectors(){
		for(var i=0; i<24; i++){

			var	angle = (i+9) * 2 * Math.PI / 24,
				cos = Math.cos(angle),
				sin = Math.sin(angle),
				rgbLED = ledFrame[i].r + ',' + ledFrame[i].g + ',' + ledFrame[i].b,
				rgbView = getViewColor(ledFrame[i]).r + ',' + getViewColor(ledFrame[i]).g + ',' + getViewColor(ledFrame[i]).b,
				rgbSelected = colPal[selectedColor].r+','+colPal[selectedColor].g+','+colPal[selectedColor].b;

			colX = document.getElementById('ledMarker'+i);
			xPos = editW2 + (caseRadius - ledEditW - 8) * cos;
			yPos = editW2 + (caseRadius - ledEditW - 8) * sin;
			colX.style.left = (xPos - ledEditW/2 - borderMarkerW) + 'px';
			colX.style.top = (yPos - ledEditW/2 - borderMarkerW) + 'px';
			colX.style.width = ledEditW + 'px';
			colX.style.height = ledEditW + 'px';
			colX.style.backgroundColor = 'rgba('+ rgbView + ', 1)';
			colX.style.textAlign = 'center';
			colX.style.margin = '0px 0px 0px 0px';
			colX.style.lineHeight = ledEditW + 'px';
			colX.style.verticalAlign = 'middle';
			colX.style.border = borderMarkerW + 'px solid rgba(127,127,127,0)';
			colNr = i+4; if(colNr>24){colNr -=24;}
			colX.innerHTML = colNr;

			if(rgbLED == '0,0,0'){
				colX.style.color = 'rgba(255,127,127, 1)';
			} else {
				xCol = contrastBlackOrWhite(ledFrame[i]);
				colX.style.color = 'rgba(' + xCol.r + ',' + xCol.g + ',' + xCol.b + ',1)';
			}

			if((rgbSelected) == '0,0,0'){
				colX.title = ''; //'Switch LED off';
			} else {
				colX.title = ''; //'Colorize';
			}
		}
	}

	function changeNumberSetting(obj){
		var 	xVal = Number(obj.value),
			vMin = Number(obj.min),
			vMax = Number(obj.max);

		if(xVal < vMin){xVal = vMin;} else if(xVal > vMax){xVal = vMax;}
		switch(obj.id){
			case'inFPS':
				if(xVal > inTFPS.value){xVal = inTFPS.value;}
				inFPS.value = xVal;

				showAnimationTime();
				prevFramePulse = 0;
				opacMs = 1 / (1000 / xVal);
				break;

			case'inTFPS':
				if(xVal < inFPS.value){
					xVal = inFPS.value;
				}
				inTFPS.value = xVal;
				break;

			case'inRPM':
				rotateMs = xVal * 360 / 60000;
				break;

			case'inRepeat':
				showAnimationTime();
				break;

			case'inFrames':
				obj.value = xVal;
				if(imgImport != null){
					setupImportArea();
					refreshImageData();
				}
				break;

			case'inGenFrame':
				obj.value = xVal;
				runGenerator(dropGenerator.value);
				actionUndo();
				break;
		}
	}


	// ************** PLAY WITH HOMEY **************
	var	playPrevMode = false,
		previewPlayTimer = null;

	function clickPrev(obj){
		playPrevMode = !playPrevMode;

		if(playPrevMode){	// play preview
			butPreview.innerHTML = '<img src="../assets/images/homey_working.png" height="30" width="30" style="float: center;">';
			var	tLoad = ledFrames.length * 15, // wait 15ms for each frame to upload.
				tDuration = Math.ceil(ledFrames.length / inFPS.value * 1000 * inRepeat.value);

			setTimeout(function(){// wait 0.5 sec for icon to change to 'working'.
				setTimeout(function(){
					butPreview.innerHTML = '<img src="../assets/images/homey_stop.png" height="30" width="30" style="float: center;">';

					previewPlayTimer = setTimeout(function(){// wait animation duration.
						clickPrev(butPreview);

					}, (tDuration));
				}, (tLoad));
				saveAnimation('');

			}, 500);

		} else {		// stop preview
			clearTimeout(previewPlayTimer);
			var	frames = [emptyFrame.slice(0)],
				saveAni = {// create animation of 1 empty frame
					options: {
						fps	: 30,
						tfps	: 60,
						rpm	: 0,
					},
					frames	: frames,
					priority: 'INFORMATIVE',
					duration: 10	// duration in ms
				}

			Homey.set('animation', saveAni, function(err, animation){
				if(err) return console.error('Could not set '+aniId, err);
				butPreview.innerHTML = '<img src="../assets/images/homey_play.png" height="30" width="30" style="float: center;">';
				butPreview.title = 'Missing title';
			});
		}
	}
	// ************** END PLAY WITH HOMEY **************


	// ************** SCREEN ANIMATION ENGINE **************
	var	frameID = 0,
		playFrame = 0,
		animationFilm = [],
		prevFramePulse = 0,
		opacMs = 1,
		opacStartTime = 0,
		rotateMs = 0,
		rotateStartTime = 0;


	function clickPlay(obj){
		playMode = !playMode;
		if(playMode){
			obj.innerHTML = '<img src="../assets/images/ani_working.png" height="30" width="30" style="float: center;">';
			var waitTime = 700;
			if(undoPointer > 1){
				saveAnimation(selectedAnimation);
				waitTime = 2000;
			}

			setTimeout(function(){
				obj.innerHTML = '<img src="../assets/images/ani_stop.png" height="30" width="30" style="float: center;">';
				rotateStartTime = new Date().getTime();
				createAnimationFilm();
				playFrame = 0;
				frameID = requestAnimationFrame(runAnimation);
			}, waitTime)
			divEdit.style.visibility = "hidden";
			generatePattern.style.visibility = "hidden";

			canvRing2.style.transitionTimingFunction = 'linear';
			canvRing2.style.transitionDuration = '0ms';
			refreshButtons(false);


		} else {
			cancelAnimationFrame(frameID);
			obj.innerHTML = '<img src="../assets/images/ani_play.png" height="30" width="30" style="float: center;">';
			if(generatorOn){
				generatePattern.style.visibility = "visible";
			} else {
				divEdit.style.visibility = "visible";
			}

			divRing.style.transform = 'rotate(0deg)';
			refreshButtons();
			canvRing.style.opacity = 1;
			canvRing2.style.opacity = 0;
			activateSelect();
		}
	}


	// requestAnimationFrame polyfill by Erik M?ller (Opera).
	// fixes from Paul Irish (Google) and Tino Zijdel (Tweakers.net).
	(function() {
		var	lastTime = 0,
			vendors = ['ms', 'moz', 'webkit', 'o'];

		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
				|| window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
			var	currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);

			lastTime = currTime + timeToCall;
			return id;
		};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}());


	function runAnimation(){
		setTimeout(function() {
			if(playMode){
				frameID = requestAnimationFrame(runAnimation);

				var	ms = new Date().getTime(),
					thisFramePulse = Math.round(ms / (1000 / inFPS.value)),
					framePulseDif = (thisFramePulse - prevFramePulse);

				// frame change
				if(framePulseDif > 0){
					if(framePulseDif >= ledFrames.length){
						playFrame = 0;
					} else{
						playFrame += framePulseDif;
						if(playFrame >= ledFrames.length){
							playFrame -= ledFrames.length;
						}
					}
					refreshFrameNr(playFrame + 1);
					prevFramePulse = thisFramePulse;
					opacStartTime = ms;
					updateAniFrame();
				}
				// canvas opacity change
				canvRing2.style.opacity = opacMs * (ms - opacStartTime);
				var xRotate = rotateMs * (ms - rotateStartTime);
				divRing.style.transform = 'rotate(' + xRotate + 'deg)';
			}
		}, 1000 / inTFPS.value);

	}

	function updateAniFrame(){
		opacMs = 1 / (1000 / inFPS.value);
		rotateMs = inRPM.value * 360 / 60000;
		// copy canvRing2 to canvRing
		var prevFrame = playFrame - 1;
		if(prevFrame < 0){prevFrame += ledFrames.length;}
		ctxRing.putImageData(animationFilm[prevFrame],0,0);

		// put new frame on canvRing2
		ctxRing2.putImageData(animationFilm[playFrame],0,0);
	}

	function createAnimationFilm(){
		animationFilm = [];
		for(var i = 0; i < ledFrames.length; i++){
			ledFrame = ledFrames[i];
			drawLedRing();
			animationFilm[i] = ctxRing.getImageData(0,0,400,400);
		}
	}
	// ************** END SCREEN ANIMATION ENGINE **************


	function clickColorPalette(obj){
		var	colorN = Number(obj.id.substr(6)), // colSet-id
			vColor = getViewColor(colPal[colorN]),
			viewCol = vColor.r + ',' + vColor.g + ',' + vColor.b;
		
		switch(colorSelector){
		case 0:
			selectedColor = colorN;
			refreshLedSelectors();
			ledSelectPreview(colPal[colorN]);
			break;

		case 1:
			if(Number(colPal[colorN].r) + Number(colPal[colorN].g) + Number(colPal[colorN].b) != 0){
				generatorColor[0][0] = colPal[colorN].r;
				generatorColor[0][1] = colPal[colorN].g;
				generatorColor[0][2] = colPal[colorN].b;
				ledSelectPreview(colPal[colorN]);
			}
			break;

		case 2: case 3:
			generatorColor[colorSelector-1][0] = colPal[colorN].r;
			generatorColor[colorSelector-1][1] = colPal[colorN].g;
			generatorColor[colorSelector-1][2] = colPal[colorN].b;
			ledSelectPreview(colPal[colorN]);
			break;
		}

		divColorPal.style.visibility = 'hidden';
	}

	function ledSelectPreview(ledCol, ledText){
		var	ctxCol = colPreview.getContext("2d");

		if(ledCol == ''){ledCol = colPal[selectedColor];}
		if(ledText == undefined){ledText = '';}

		if(dropFillType.value == 'type_3' && colorSelector == 0){
			setColPreviewFill('');
		} else {
			switch(colorSelector){
			case 0:
				setColPreviewFill(ledCol);
				break;

			case 1: case 2: case 3:
				setColPreviewFill(ledCol);
				break;
			}

			var compCol = ledCol.r +','+ ledCol.g +','+ ledCol.b;
			switch(compCol){
				case '0,0,0': ledText = txt_ed_apply_off; break;
				case '255,0,0': ledText = txt_pure_red.substr(txt_pure_red.indexOf(' ') + 1); break;
				case '255,255,0': ledText = txt_pure_yellow.substr(txt_pure_yellow.indexOf(' ') + 1); break;
				case '0,255,0': ledText = txt_pure_green.substr(txt_pure_green.indexOf(' ') + 1); break;
				case '0,255,255': ledText = txt_pure_cyan.substr(txt_pure_cyan.indexOf(' ') + 1); break;
				case '0,0,255': ledText = txt_pure_blue.substr(txt_pure_blue.indexOf(' ') + 1); break;
				case '255,0,255': ledText = txt_pure_magenta.substr(txt_pure_magenta.indexOf(' ') + 1); break;
				case '255,255,255': ledText = txt_bright_white.substr(txt_bright_white.indexOf(' ') + 1); break;
			}
		}
		setColPreviewText(ledText, ledCol);
	}

	function setColPreviewText(ledText, backColor){
		var xCol = contrastBlackOrWhite(backColor);
		ledText = ledText.substr(0,1).toUpperCase() + ledText.substr(1).toLowerCase();

		switch(colorSelector){
		case 0:
			var ctxCol = colPreview.getContext("2d");
			ctxCol.textAlign = 'center';
			ctxCol.textBaseline = 'middle';
			ctxCol.font = '14px helvetica-neue, sans-serif';
			ctxCol.fillStyle = 'rgba(' + xCol.r + ',' + xCol.g + ',' + xCol.b + ',1)';
			ctxCol.fillText(ledText, colPreview.width/2, colPreview.height/2);
			break;

		case 1: case 2: case 3:
			document.getElementById('generatorCol'+ colorSelector).style.color = 'rgba(' + xCol.r + ',' + xCol.g + ',' + xCol.b + ',1)';
			document.getElementById('generatorCol'+ colorSelector).innerHTML = ledText;
			break;
		}
	}

	function setColPreviewFill(col1, col2, nStep){
		// col1 = undefined, col2 = undefined	: selectedColor
		// col1 = '', col2 = undefined		: b/w gradient
		// col1 = rgbObj, col2 = undefined	: col1
		// col1 = rgbObj, col2 = rgbObj		: gradient col1 -> col2

		switch(colorSelector){
		case 0:
			var	ctxCol = colPreview.getContext("2d");
			if(nStep == 0){nStep = 1;}

			if(col1 == undefined && col2 == undefined){
				var xCol = getViewColor({r:colPal[selectedColor].r, g:colPal[selectedColor].g, b:colPal[selectedColor].b});
				ctxCol.fillStyle = 'rgba('+ xCol.r + ',' + xCol.g + ',' + xCol.b +',1)';

			} else if(col2 == undefined){
				if(col1 != ''){
					var xCol1 = getViewColor({r:col1.r, g:col1.g, b:col1.b});
					ctxCol.fillStyle = 'rgba('+ xCol1.r + ',' + xCol1.g + ',' + xCol1.b +',1)';
				} else {
					var grd=ctxCol.createLinearGradient(0, 0, colPreview.width, 0);
					grd.addColorStop(0, "#000000");
					grd.addColorStop(1, "#ffffff");
					ctxCol.fillStyle = grd;
				}

			} else {
				var	xCol1 = getViewColor({r:col1.r, g:col1.g, b:col1.b}),
					xCol2 = getViewColor({r:col2.r, g:col2.g, b:col2.b});

				if((xCol1.r + xCol1.g + xCol1.b > 0) && (xCol2.r + xCol2.g + xCol2.b > 0)){
					var	stepR = (col2.r - col1.r) / nStep,
							stepG = (col2.g - col1.g) / nStep,
						stepB = (col2.b - col1.b) / nStep;

					var	cR = col1.r,
						cG = col1.g,
						cB = col1.b,
						xGr = 0, stepGr = 1 / (nStep-1),
						grd = ctxCol.createLinearGradient(0, 0, colPreview.width, 0);

					cR += stepR; cG += stepG; cB += stepB; xGr += stepGr;
					var vCol = getViewColor({r:cR, g:cG, b:cB});

					grd.addColorStop(0 ,'rgba('+ Math.round(vCol.r) + ',' + Math.round(vCol.g) + ',' + Math.round(vCol.b) +',1)');

					while(Math.round(xGr*100)/100 < 1){
						vCol = getViewColor({r:cR, g:cG, b:cB});
						grd.addColorStop(Math.round(xGr*100)/100 ,'rgba('+ Math.round(vCol.r) + ',' + Math.round(vCol.g) + ',' + Math.round(vCol.b) +',1)');
						cR += stepR; cG += stepG; cB += stepB;
						vCol = getViewColor({r:cR, g:cG, b:cB});
						grd.addColorStop(Math.round(xGr*100)/100 ,'rgba('+ Math.round(vCol.r) + ',' + Math.round(vCol.g) + ',' + Math.round(vCol.b) +',1)');

						xGr += stepGr;
					}
					cR -= stepR; cG -= stepG; cB -= stepB;
					ctxCol.fillStyle = grd;
				} else {
				}
			}
			ctxCol.fillRect(0, 0, colPreview.width, colPreview.height);
			break;

		case 1: case 2: case 3:
			var xCol = getViewColor({r:col1.r, g:col1.g, b:col1.b});
			document.getElementById('generatorCol'+ colorSelector).style.backgroundColor = 'rgba(' + xCol.r + ',' + xCol.g + ',' + xCol.b + ',1)';
			runGenerator(dropGenerator.value);
			actionUndo();
			break;
		}
	}


	function selectEdit(obj){
		var xVal = obj.value;
		switch(obj.id){
		case 'dropFillType':
			if(xVal != valFillType){
				valFillType = xVal;
				switch(valFillType){
					case 'type_1':
						var dropRange = '';
						for(var i = 1; i < 25; i++){
							dropRange += '<option value="range_' + i + '">';
							if(i == 24){var xCount = txt_count[0];} else {var xCount = i;}

							dropRange += txt_drop_range[0].replace('###', xCount);
							if(i > 1 && i < 24){dropRange += txt_plural_s;}
							dropRange += '</option>';
						}
						document.getElementById('dropFillRange').innerHTML = dropRange;
						refreshButtons();
						ledSelectPreview('');
						break;

					case 'type_2':
						var dropRange = '';
						for(var i = 2; i < 13; i++){
							if(Math.floor(24 / i) * i == 24){
								var txtOption = txt_drop_range[1].replace('###', txt_count[i]);
								dropRange += '<option value="range_' + i + '">' + txtOption + '</option>';
							}
						}
						document.getElementById('dropFillRange').innerHTML = dropRange;
						refreshButtons();
						ledSelectPreview('');
						break;

					case 'type_3':
						var dropRange = '<option value="range_0">' + txt_drop_range[2] + '</option>';
						document.getElementById('dropFillRange').innerHTML = dropRange;
						refreshButtons();
						ledSelectPreview('');
						break;
				}
			}
			break;

		case 'dropFillRange':
			if(xVal != valFillRange){
				valFillRange = xVal;
			}
			break;

		case 'dropGenerator':
			if(xVal != valGenType){
				valGenType = xVal;
				runGenerator(xVal);
				actionUndo();
			}
			break;
		}
	}

	function showActiveLeds(obj){
		var xActive = false;
		blinkInterval = setInterval(function(){
			var xT = Math.floor(new Date().getMilliseconds() / 500);
			switch(xT){
				case 0: case 2:
					var bCol = "#ffffff";
					break;
				case 1: case 3:
					var bCol = "#000000";
					break;
			}
			for(var i=0; i<24; i++){
				var bStyle = document.getElementById('ledMarker'+i).style.borderStyle;
				if(bStyle != 'solid'){
					document.getElementById('ledMarker'+i).style.borderColor = bCol;
					xActive = true;
				}
			}
			if(xActive){
				lPointer.style.stroke = bCol;
				lPointer.style.visibility = 'visible';
			}
		}, 250);

		lPointer.setAttribute('x1', colPreview.offsetLeft + colPreview.offsetWidth/2);
		lPointer.setAttribute('y1', colPreview.offsetTop + colPreview.offsetHeight/2);
		lPointer.setAttribute('x2', obj.offsetLeft + obj.offsetWidth/2);
		lPointer.setAttribute('y2', obj.offsetTop + obj.offsetHeight/2);

		var id = Number(obj.id.substr(9));
		switch(dropFillType.value){
		case 'type_1':
			var rangeVal = Number(dropFillRange.value.substr(6));
			for(var i = 1; i <= rangeVal; i++){
				document.getElementById('ledMarker'+id).style.borderColor = '#ffffff';
				document.getElementById('ledMarker'+id).style.borderStyle = 'dotted';
				id ++; if(id > 23){id -= 24;}
			}
			break;

		case 'type_2':
			var	rangeVal = Number(dropFillRange.value.substr(6)),
				xStart = id;

			document.getElementById('ledMarker'+id).style.borderColor = '#ffffff';
			document.getElementById('ledMarker'+id).style.borderStyle = 'dotted';
			id += rangeVal; if(id > 23){id -= 24;}
			while(id != xStart){
				document.getElementById('ledMarker'+id).style.borderColor = '#ffffff';
				document.getElementById('ledMarker'+id).style.borderStyle = 'dotted';
				id += rangeVal; if(id > 23){id -= 24;}
			}
			break;

		case 'type_3':
			var	xLed = id,
				ledData = [{led:id, r:0, g:0, b:0}, {led:id, r:0, g:0, b:0}]; // = [0=first led, 1=second led]

			if(ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
				xLed --; if(xLed == -1){xLed = 23;}
				while(xLed != id && ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
					xLed --; if(xLed == -1){xLed = 23;}
				}

				if(xLed != id){
					ledData[0] = {led:xLed, r:ledFrame[xLed].r, g:ledFrame[xLed].g, b:ledFrame[xLed].b}
					xLed = id+1; if(xLed == 24){xLed = 0;}
					while(xLed != id && ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
						xLed ++; if(xLed == 24){xLed = 0;}
					}
					ledData[1] = {led:xLed, r:ledFrame[xLed].r, g:ledFrame[xLed].g, b:ledFrame[xLed].b}
				}

				if(ledData[0].led != id){
					var	lStart = ledData[0].led +1,
						lEnd = ledData[1].led -1;

					if(lStart == 24){lStart = 0;}
					if(lEnd == -1){lEnd = 23;}
					xLed = lStart;
					document.getElementById('ledMarker'+ xLed).style.borderColor = '#ffffff';
					document.getElementById('ledMarker'+ xLed).style.borderStyle = 'dotted';
					while(xLed != lEnd){
						xLed ++; if(xLed == 24){xLed = 0;}
						document.getElementById('ledMarker'+ xLed).style.borderColor = '#ffffff';
						document.getElementById('ledMarker'+ xLed).style.borderStyle = 'dotted';
					}
				}
			}
			var nStep = ledData[1].led - ledData[0].led;
			if(nStep <0){nStep += 24;}
			setColPreviewFill(ledData[0], ledData[1], nStep);
			break;
		}
	}

	function resetShowActive(){
		lPointer.style.visibility = 'hidden';
		clearInterval(blinkInterval);
		for(var i = 0; i < 24; i++){
			document.getElementById('ledMarker'+i).style.borderStyle = 'solid';
			document.getElementById('ledMarker'+i).style.borderStyle = 'solid';
			document.getElementById('ledMarker'+i).style.borderColor = 'rgba(127,127,127,0)';
		}
		if(dropFillType.value == 'type_3'){setColPreviewFill('');}
	}

	function clickLedMarker(obj){
		var id = Number(obj.id.substr(9));

		switch(dropFillType.value){
		case 'type_1':
			var rangeVal = Number(dropFillRange.value.substr(6));
			for(var i = 1; i <= rangeVal; i++){
				ledFrame[id] = colPal[selectedColor];
				id ++; if(id > 23){id -= 24;}
			}
			ledFrames[selectedFrame] = ledFrame.slice(0);
			actionUndo();
			break;

		case 'type_2':
			var	rangeVal = Number(dropFillRange.value.substr(6)),
				xStart = id;

			ledFrame[id] = colPal[selectedColor];
			id += rangeVal; if(id > 23){id -= 24;}
			while(id != xStart){
				ledFrame[id] = colPal[selectedColor];
				id += rangeVal; if(id > 23){id -= 24;}
			}
			ledFrames[selectedFrame] = ledFrame.slice(0);
			actionUndo();
			break;

		case 'type_3':
			var	xLed = id,
				ledData = [{led:id, r:0, g:0, b:0}, {led:id, r:0, g:0, b:0}]; // = [0=first led, 1=second led]

			if(ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
				xLed --; if(xLed == -1){xLed = 23;}

				while(xLed != id && ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
					xLed --; if(xLed == -1){xLed = 23;}
				}

				if(xLed != id){
					ledData[0] = {led:xLed, r:ledFrame[xLed].r, g:ledFrame[xLed].g, b:ledFrame[xLed].b}
					xLed = id+1; if(xLed == 24){xLed = 0;}
					while(xLed != id && ledFrame[xLed].r == 0 && ledFrame[xLed].g == 0 && ledFrame[xLed].b == 0){
						xLed ++; if(xLed == 24){xLed = 0;}
					}
					ledData[1] = {led:xLed, r:ledFrame[xLed].r, g:ledFrame[xLed].g, b:ledFrame[xLed].b}
				}

				if(ledData[0].led != id){
					var	lStart = ledData[0].led +1,
						lEnd = ledData[1].led -1;

					if(lStart == 24){lStart = 0;}
					if(lEnd == -1){lEnd = 23;}
					if(ledData[0].led< ledData[1].led){
						stepN = ledData[1].led - ledData[0].led;
					} else {
						stepN = ledData[1].led - ledData[0].led +24;
					}
					var	stepR = (ledData[1].r - ledData[0].r) / stepN,
						stepG = (ledData[1].g - ledData[0].g) / stepN,
						stepB = (ledData[1].b - ledData[0].b) / stepN;

					xLed = lStart;
					var	cR = ledData[0].r + stepR,
						cG = ledData[0].g + stepG,
						cB = ledData[0].b + stepB;

					ledFrame[xLed] = {r:Math.round(cR), g:Math.round(cG), b:Math.round(cB)}
					while(xLed != lEnd){
						xLed ++; if(xLed == 24){xLed = 0;}
						cR = cR + stepR;
						cG = cG + stepG;
						cB = cB + stepB;
						ledFrame[xLed] = {r:Math.round(cR), g:Math.round(cG), b:Math.round(cB)}
					}
				}
			}
			ledFrames[selectedFrame] = ledFrame.slice(0);
			actionUndo();
			break;
		}
		refreshLedSelectors();
		drawLedRing();
		drawFramePreview(selectedFrame);
		refreshButtons();
	}



	function clickEditButton(obj){
		switch(obj.id){
		case 'generatorCol1':
			colorSelector = 1;
			divColorPal.style.visibility = 'visible';
			break;

		case 'generatorCol2':
			colorSelector = 2;
			divColorPal.style.visibility = 'visible';
			break;

		case 'generatorCol3':
			colorSelector = 3;
			divColorPal.style.visibility = 'visible';
			break;

			
		case 'colPreview':
			colorSelector = 0;
			if(dropFillType.value != 'type_3'){
				divColorPal.style.visibility = 'visible';
			}
			break;

		case 'but_edit_fill':
			but_generator_close.click();
			var colFill = [0,0,0];
			for(var i=0; i<48; i++){
				colN = i; if(colN>23){colN -= 24;}
				var codeRGB = ledFrame[colN].r + ',' + ledFrame[colN].g + ',' + ledFrame[colN].b;
				if(!(codeRGB == '0,0,0')){
					colFill = [Number(ledFrame[colN].r), Number(ledFrame[colN].g), Number(ledFrame[colN].b)];
				} else {
					ledFrame[colN] = {r:colFill[0], g:colFill[1], b:colFill[2]}
				}
			}
			ledFrames[selectedFrame] = ledFrame.slice(0);
			actionUndo();
			break;

		case 'but_edit_flow':
			but_generator_close.click();
			var	col1 = -1,
				col2 = -1;

			for(var i=0; i<=48; i++){
				var colN = i; while(colN>23){colN -= 24;}
				var codeRGB = ledFrame[colN].r + ',' + ledFrame[colN].g + ',' + ledFrame[colN].b;
				if(!(codeRGB == '0,0,0')){
					if(col2 == -1){
						col1 = i;
					}

					if(col2 == -2){
						col2 = i;
						var	l1 = col1,
							l2 = col2;

						if(l1>23){l1 -= 24;}
						if(l2>23){l2 -= 24;}
						var	colR = Number(ledFrame[l1].r),
							colG = Number(ledFrame[l1].g),
							colB = Number(ledFrame[l1].b),
							colStepR = (Number(ledFrame[l2].r) - colR) / (col2-col1),
							colStepG = (Number(ledFrame[l2].g) - colG) / (col2-col1),
							colStepB = (Number(ledFrame[l2].b) - colB) / (col2-col1);

						for(var j = col1; j<= col2; j++){
							var xj = j; while(xj>23){xj -= 24;}
							ledFrame[xj] = {r:Math.round(colR), g:Math.round(colG), b:Math.round(colB)}
							colR += colStepR;
							colG += colStepG;
							colB += colStepB;
						}
						col1 = col2; col2 = -1;
					}
				} else {
					if(col1 > -1){col2 = -2;}
				}
			}
			ledFrames[selectedFrame] = ledFrame.slice(0);
			actionUndo();
			break;

		case 'but_edit_undo':
			actionUndo('undo');
			break;

		case 'but_edit_redo':
			actionUndo('redo');
			break;

		case 'checkRandomColors':
			checkFullFlow.checked = false;
			runGenerator(dropGenerator.value);
			actionUndo();
			break;

		case 'checkFullFlow':
			checkRandomColors.checked = false;
			runGenerator(dropGenerator.value);
			actionUndo();
			break;

		}
		refreshButtons();
		refreshLedSelectors();
		drawLedRing();
		drawFramePreview(selectedFrame);
	}



	function refreshButtons(butOn){
		if(butOn == undefined){butOn = true;}

		// check for active leds in frame
		var	ledOnCount = 0,
			ledColCount = 0,
			ledCol = null;

		for(var i=0; i<24; i++){
			var codeRGB = ledFrame[i].r + ',' + ledFrame[i].g + ',' + ledFrame[i].b;
			if(!(codeRGB == '0,0,0')){
				ledOnCount ++;
				if(codeRGB != ledCol){
					ledColCount ++;
					ledCol = codeRGB;
				}
			}
		}

		// check for inactive frames in animation
		var frameOffCount = 0;
		for(var i=0; i<ledFrames.length; i++){
			var colFrame = 0;
			for(var j=0; j < ledFrames[i].length; j++){
				var	cR = ledFrames[i][j].r,
					cG = ledFrames[i][j].g,
					cB = ledFrames[i][j].b;

				colFrame += (cR + cG + cB);
			}
			if(colFrame == 0){frameOffCount ++;}
		}

		butCopyAni.disabled = true;
		butRenameAni.disabled = true;
		dropAnimation.disabled = true;

		but_edit_fill.disabled = true;
		but_edit_flow.disabled = true;

		dropFillType.disabled = true;
		dropFillRange.disabled = true;

		butUndo.disabled = true;
		butRedo.disabled = true;

		but_ani_open.disabled = true;
		but_ani_store.disabled = true;
		but_image_import.disabled = true;
		but_ani_generator.disabled = true;
		but_generator_close.disabled = true;
		butAddFrame.disabled = true;
		butCopyFrame.disabled = true;
		but_ani_fill_flow.disabled = true;
		but_ani_fill_connect.disabled = true;

		butClock.disabled = true;
		butCounterClock.disabled = true;
		butPush.disabled = true;
		butPull.disabled = true;

		but_open_image.disabled = true;
		but_import_accept.disabled = true;
		but_import_cancel.disabled = true;
		but_scan_direction.disabled = true;

		if(butOn && !playMode && !storeLeditorOn) {
			if(storeLeditorOn){
				but_ani_generator.style.visibility = 'hidden';
			}else {
				if(!generatorOn){but_ani_generator.style.visibility = 'visible';}
			}
			but_ani_open.disabled = false;
			but_image_import.disabled = false;
			but_generator_close.disabled = false;
			if(ledOnCount > 0){
				butClock.disabled = false;
				butCounterClock.disabled = false;
				butPush.disabled = false;
				butPull.disabled = false;
				if(ledOnCount < 24){
					but_edit_fill.disabled = false;
					if(ledColCount > 1){
						but_edit_flow.disabled = false;
					}
				}
			}

			but_ani_store.disabled = false;
			but_ani_generator.disabled = false;
			if(count_frames < max_fields){
				butAddFrame.disabled = false;
				butCopyFrame.disabled = false;
			}
			if(frameOffCount > 0 && frameOffCount < ledFrames.length){
				but_ani_fill_flow.disabled = false;
				but_ani_fill_connect.disabled = false;
			}
			butCopyAni.disabled = false;
			butRenameAni.disabled = false;
			dropAnimation.disabled = false;

			but_open_image.disabled = false;
			but_import_cancel.disabled = false;
			if(imgImport != null){
				but_import_accept.disabled = false;
				but_scan_direction.disabled = false;
			}
			dropFillType.disabled = false;
			dropFillRange.disabled = false;


			if(undoPointer > 0){butUndo.disabled = false;}
			if(undoPointer < undoList.length-1){butRedo.disabled = false;}
		}
	}

	function actionUndo(action){
		if(action == undefined){action = 'store';}

		switch(action){
		case 'store':
			undoPointer ++;
			undoList[undoPointer] = ledFrames.slice(0);
			if(undoPointer < undoList.length - 1){
				undoList.splice(undoPointer+1, undoList.length - undoPointer-1);
			}
			break;

		case 'undo':
			if(undoPointer > 0){
				undoPointer --;
				ledFrames = undoList[undoPointer].slice(0);
				if(selectedFrame >= ledFrames.length){selectedFrame = ledFrames.length - 1;}
				ledFrame = ledFrames[selectedFrame].slice(0);
				refreshFramesList();
				refreshCounter();
				refreshCounter(ledFrames.length);
			}
			break;

		case 'redo':
			if(undoList.length > 0 && undoPointer < undoList.length-1){
				undoPointer ++;
				ledFrames = undoList[undoPointer].slice(0);
				if(selectedFrame >= ledFrames.length){selectedFrame = ledFrames.length - 1;}
				ledFrame = ledFrames[selectedFrame].slice(0);
				refreshFramesList();
				refreshCounter();
				refreshCounter(ledFrames.length);
			}
			break;
		}
		refreshButtons();
		saveAnimation();
	}
