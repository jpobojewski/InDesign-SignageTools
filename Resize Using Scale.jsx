var scriptTitle         = "Resize Using Scale ©2014 Thirst";
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
    var targetWidth = null;
	var targetHeight = null;    
    var targetDimension = 0; // 0 = width, 1 = height;
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
		alert("Please select one item to resize.");
	}

    // INIT DIALOG
	function getDialog(){
		var Dialog;
		with(Dialog = app.dialogs.add({name: scriptTitle})){
			with(dialogColumns.add()){
				with(dialogRows.add()){
					staticTexts.add({staticLabel:"Fill in the dimensions you want to scale", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});	
				}					
				with(dialogRows.add()){
					with(dialogColumns.add()){
						with(borderPanels.add()){
							  a = staticTexts.add({staticLabel:"Resize to", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 82});	
							  staticTexts.add({staticLabel:"W (in)", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});				
							  var mTargetWidth = measurementEditboxes.add({editUnits:MeasurementUnits.inches,  minWidth:100});
							  staticTexts.add({staticLabel:"H (in)", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});						  
							  var mTargetHeight = measurementEditboxes.add({editUnits:MeasurementUnits.inches,  minWidth:100});		

						}	
					}				

		  		}				
				with(dialogRows.add()){
					with(borderPanels.add()){
							  a = staticTexts.add({staticLabel:"Scale", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 82});	
							  staticTexts.add({staticLabel:"Unit", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN, minWidth: 31});				
							  var mScaleUnit  = measurementEditboxes.add({editValue: 72.0 * initialScaleUnit,  editUnits:MeasurementUnits.inches,  minWidth:100});
							  staticTexts.add({staticLabel:"Base", staticAlignment:StaticAlignmentOptions.LEFT_ALIGN});						  
							  var mScaleBase  = measurementEditboxes.add({editValue: 72.0 * 12.0, editUnits:MeasurementUnits.inches,  minWidth:100});		
					}				
				}			  				
			}
		}
		myResult = Dialog.show();
		if (myResult == true){	
			targetWidth     = mTargetWidth.editValue;
			targetHeight	= mTargetHeight.editValue;
			scaleUnit 		= mScaleUnit.editValue;
			scaleBase 		= mScaleBase.editValue;

			resizeItems();

			Dialog.destroy();
		}
		else{
			Dialog.destroy();
		}
	}
    
    // CALCULATE DIMENSIONS
    function resizeItems()
    {        
		app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
		app.activeDocument.viewPreferences.verticalMeasurementUnits   = MeasurementUnits.points;

		for (var i=0; i<_sel.length; i++){
			var obj    = _sel[i];
			var anchor = app.activeWindow.transformReferencePoint;			

			// calculate dimension in points
			var ratio = scaleUnit/scaleBase;		
			
			objW    = obj.geometricBounds[3] - obj.geometricBounds[1];
			objH    = obj.geometricBounds[2] - obj.geometricBounds[0];

			var pw = objW;
			var ph = objH;

			if (targetWidth != ""){
				pw = targetWidth * ratio;
			}

			if (targetHeight != ""){
				ph = targetHeight * ratio;
			}

			obj.resize(
				BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS, 
				app.activeWindow.transformReferencePoint, 
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[pw, ph]
			);
		}        
       
        // RESET
		app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.inches;
		app.activeDocument.viewPreferences.verticalMeasurementUnits   = MeasurementUnits.inches;      
		app.activeDocument.textPreferences.typographersQuotes 		  = true;
    }
}