// Convert Dimensions.jsx

var scriptTitle         = "Convert Dimensions ©2014 Thirst";
var initialScaleUnit    = 1.0; // 1" = 1'
var inchIncrements 		= [
	{ "value":0.0625, "fraction":"1/16" },
	{ "value":0.125,  "fraction":"1/8" },
	{ "value":0.1875, "fraction":"3/16" },
	{ "value":0.25,   "fraction":"1/4" },
	{ "value":0.3125, "fraction":"5/16" },
	{ "value":0.375,  "fraction":"3/8" },
	{ "value":0.4375, "fraction":"7/16" },
	{ "value":0.5, 	  "fraction":"1/2" },
	{ "value":0.5625, "fraction":"9/16" },
	{ "value":0.625,  "fraction":"5/8" },
	{ "value":0.6875, "fraction":"11/16" },
	{ "value":0.75,   "fraction":"3/4" },
	{ "value":0.8125, "fraction":"13/16" },
	{ "value":0.875,  "fraction":"7/8" },
	{ "value":0.9375, "fraction":"15/16" }
];

////

app.doScript (main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.entireScript, scriptTitle);

function main()
{
    var _sel = app.selection;
    var scaleUnit = 0;
    var scaleBase = 0;
    var scaleDimension = 0; // 0 = width, 1 = height;
    var scaleFormat    = 0; // 0 = feet + inches, 1 = inches;
        
	var origHU = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
	var origVU = app.activeDocument.viewPreferences.verticalMeasurementUnits;    

	app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.inches;
	app.activeDocument.viewPreferences.verticalMeasurementUnits   = MeasurementUnits.inches;

	// turn off smart quotes
	app.activeDocument.textPreferences.typographersQuotes = false;

    // RUN
	if (_sel.length > 0){
		getDialog();
	} else {
		alert("Please select one item to calculate measurements.");
	}

    // INIT DIALOG
	function getDialog(){
		var Dialog;
		with(Dialog = app.dialogs.add({name: scriptTitle})){
			with(dialogColumns.add()){
				with(dialogRows.add()){
					with(borderPanels.add()){
							  a = staticTexts.add({staticLabel:"Scale", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 82});	
							  staticTexts.add({staticLabel:"Unit", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});				
							  var mScaleUnit  = measurementEditboxes.add({editValue: 72.0 * initialScaleUnit,  editUnits:MeasurementUnits.inches,  minWidth:100});
							  staticTexts.add({staticLabel:"Base", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});						  
							  var mScaleBase  = measurementEditboxes.add({editValue: 72.0 * 12.0, editUnits:MeasurementUnits.inches,  minWidth:100});		
					}
				}
				with(dialogRows.add()){
					with(dialogColumns.add()){
						with(borderPanels.add()){
							staticTexts.add({staticLabel:"Dimension", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 80});	
							var rGroup 			  = radiobuttonGroups.add();
				  			with(rGroup){
				  				radiobuttonControls.add({staticLabel:"Width",  checkedState:true, minWidth: 66});
				  				radiobuttonControls.add({staticLabel:"Height", checkedState:false});
				  			}
			  			}
			  		}
					with(dialogColumns.add()){
						with(borderPanels.add()){
							staticTexts.add({staticLabel:"Format", minWidth: 100, staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 80});	
							var dGroup 			  = radiobuttonGroups.add();
					  		with(dGroup){
					  			radiobuttonControls.add({staticLabel:"Feet & Inches",  checkedState:true, minWidth: 50});
					  			radiobuttonControls.add({staticLabel:"Inches", checkedState:false});
					  		}
				  		}
					}				  		
				}		
			}
		}
		myResult = Dialog.show();
		if (myResult == true){	
			scaleUnit 		= mScaleUnit.editValue;
			scaleBase 		= mScaleBase.editValue;
			scaleDimension	= rGroup.selectedButton;
			scaleFormat		= dGroup.selectedButton;

			calculateAndSetDimensions();

			Dialog.destroy();
		}
		else{
			Dialog.destroy();
		}
	}
    
    // CALCULATE DIMENSIONS
    function calculateAndSetDimensions()
    {        
		for (var i=0; i<_sel.length; i++){
			var obj    = _sel[i];
			
			objW    = obj.geometricBounds[3] - obj.geometricBounds[1];
			objH    = obj.geometricBounds[2] - obj.geometricBounds[0];

			// round to nearest thousandth cause InDesign sucks at rounding
			objW    = Math.ceil(objW*1000)/1000;
			objH    = Math.ceil(objH*1000)/1000;

			// set dimension to chase
			objD    = objW;
			if (scaleDimension == 1) objD = objH;

			// calculate dimension in inches
			var output = (objD * scaleBase)/scaleUnit;

			// convert from inches to feet
			if (scaleFormat == 0){
				var a = output/12;		// start by dividing by 12 
				var b = Math.floor(a); 	// whole number of feet 
				var c = a - b;			// remainder in feet (as a decimal)
				var d = c * 12;			// remainder in inches (as a decimal)
				var e = Math.floor(d);	// whole number of inches
				var f = d - e;			// remainder of decimal inches 

				// convert decimal to matching fraction
				if (f > 0.001){
					if (f < 0.94){
						f = findBestFractionValue(f);		
					} else {
						f = 0;
						if (e == 11){
							e = 0;
							b += 1;
						} else {
							e += 1;	
						}
					}
				} else {
					f = 0;
				}	

	        	// target text box
	        	var txtBox = obj.textFrames[0];	

	            // reset contents box
	            txtBox.contents = "";

	            // add feet if necessary
	            if (b != 0){
	            	txtBox.contents += b + "\' – "; 
	            }

	            // add whole inches if necessary
	            if (e != 0){
	            	txtBox.contents += e; 
	            } else {
	            	if (f == 0){
	            		txtBox.contents += e; 
	            	}
	            }           

	            // add inches
	            if (f != 0) {
	            	txtBox.contents += " " + f + "\""; 
	            } else {
	            	txtBox.contents += "\""; 
	            }

			// convert inches to fraction
        	} else {
        		var a = output%1;
        		var b = output - a; // whole inches
        		var c = findBestFractionValue(a); // remaining fraction

        		if (a < 0.001){
        			c = 0;	
        		}
        		if (a > 0.94){
        			c = 0;
        			b += 1;
        		}

	        	// target text box
	        	var txtBox = obj.textFrames[0];	

	            // reset contents box
	            txtBox.contents = "";

	            // add inches
	            if (c != 0) {
	            	txtBox.contents += b + " " + c + "\""; 
	            } else {
	            	txtBox.contents += b + "\""; 
	            }

			}
		}        
       
        // RESET
		app.activeDocument.viewPreferences.horizontalMeasurementUnits = origHU;
		app.activeDocument.viewPreferences.verticalMeasurementUnits   = origVU;      
		app.activeDocument.textPreferences.typographersQuotes 		  = true;
    }

    function findBestFractionValue(input)
    {
		var output = 0;

		// via http://stackoverflow.com/questions/1506554/how-to-round-a-decimal-to-the-nearest-fraction
    	var lower_bound = 1.0 / 16.0 * Math.floor(16.0 * input);
		var upper_bound = 1.0 / 16.0 * Math.floor(16.0 * input + 1.0);

		var retrieve = lower_bound;
		if (upper_bound - input < input - lower_bound){
			retrieve = upper_bound;
		};

		for (var i = 0; i < inchIncrements.length; i++){
			if (inchIncrements[i].value == retrieve) output = inchIncrements[i].fraction;
		}

		return output;
    }
}