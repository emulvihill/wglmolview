module molview
{
    /// <reference path="ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="Constants.ts" />
    /// <reference path="molview/model/Atom.ts" />
    /// <reference path="molview/model/Molecule.ts" />
    /// <reference path="molview/model/RenderableObject.ts" />
    /// <reference path="molview/renderer/Away3DRenderer.ts" />
    /// <reference path="ts/Signal.ts" />


public class MolView3D
{
    public signals:Object = {};

	private selections:Array;

	private molecule:molview.model.Molecule;

	private renderer:molview.renderer.Away3DRenderer;

	private display:HTMLTextAreaElement;

	private renderToolbar:HTMLDivElement;

	private selectionToolbar:HTMLDivElement;


	public MolView3D()
	{
        this.signals.addedToStage = new Signal();
        this.signals.addedToStage.add(this.onAddedToStage);
	}


	private onAddedToStage():void
	{
		// configure defaults
		var init:Object =
		{
			renderQuality:Constants.RENDERQUALITY_HIGH,
			renderMode:Constants.RENDERMODE_BALL_AND_STICK,
			selectionMode:Constants.SELECTIONMODE_IDENTIFY,
			atomRadiusMode:Constants.ATOM_RADIUS_REDUCED,
			atomRadiusScale:1.0,
			bondRadiusScale:1.0,
			selectable:true,
			maxFrames:99,
			zoom:1.0,
			autoCenter:true
		}

        parameters:Object = LoaderInfo(this.root.loaderInfo).parameters;
		if (parameters)
		{
			for (var i:string in parameters)
			{
				init[i] = parameters[i];
			}
		}
		Configuration.configure(init);

		// this is where selections are stored
		selections = [];

		// draw the on-screen displays
		drawBackground();
		drawToolbars();
		drawDisplay();

		// load the molecule from the init settings
		if (Configuration.getConfig().pdb is String)
		{
			loadPDB(Configuration.getConfig().pdb);
		}
	}


	private onMouseWheel(event:MouseEvent):void
	{
		var oldZoom:number = Configuration.getConfig().zoom;
		Configuration.setParameter("zoom", oldZoom+event.delta/50.0);
		renderer.render();

	}


	private drawToolbars():void
	{
		renderToolbar = new MovieClip();
		renderToolbar.name = "renderToolbar";
		renderToolbar.addChild(new renderModesBitmap());
		renderToolbar.useHandCursor = true;
		renderToolbar.mouseChildren = false;
		addChild(renderToolbar);
		renderToolbar.addEventListener(MouseEvent.MOUSE_DOWN, handleRenderToolbarMouseDown);

		selectionToolbar = new Sprite();
		selectionToolbar.name = "selectionToolbar";
		selectionToolbar.addChild(new selectionModesBitmap());
		selectionToolbar.useHandCursor = true;
		selectionToolbar.mouseChildren = false;
		selectionToolbar.x = 300;
		addChild(selectionToolbar);
		selectionToolbar.addEventListener(MouseEvent.MOUSE_DOWN, handleSelectionToolbarMouseDown);
	}


	private drawDisplay():void
	{
		display = new TextField();
		display.name = "display";
		display.width = 150;
		display.x = 150;
		display.y = 0;
		display.selectable = false;
		display.wordWrap = true;
		display.text = "";
		addChild(display);
	}


    public loadPDB(pdb_url:string):void
    {
	  // set hourglass cursor here

	  if (!pdb_url || pdb_url.length==0)
	  {
		  trace("empty 3D molecule name");
	  }

	  myURL:URLRequest = new URLRequest(pdb_url);
	  myLoader:URLLoader = new URLLoader(myURL);
	  myLoader.addEventListener(Event.COMPLETE, pdbLoaded);
    }


    private pdbLoaded(event:Event):void
    {
        molecule = new Molecule();
		renderer = new Away3DRenderer();
		addChild(renderer);
		renderer.init();
	    addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown, false, 0, false);
	    addEventListener(MouseEvent.MOUSE_UP, handleMouseUp, false, 0, false);
		addEventListener(MouseEvent.MOUSE_WHEEL, onMouseWheel, false, 0, false);
		renderer.addEventListener(SelectionEvent.SELECT, handleSelect, false, 0, false);

        loader:URLLoader = URLLoader(event.target);
		molecule.parsePDB(loader.data);
		if (Configuration.getConfig().autoCenter == true) molecule.center();

        // load the initial view
        //if listP(pInitTransform) and pInitTransform.count=16 then pGroup.transform = newtransform(pInitTransform)

		// render the molecule as 3d items
		molecule.render(renderer);

	    // load initial render mode
	    renderer.setRenderMode(Configuration.getConfig().renderMode);

		// draw the molecule on screen
		renderer.render();
	}


	private drawBackground():Shape
	{
		var bg:Shape = new Shape();
		bg.name = "background";
		bg.graphics.beginFill(0x8888FF);
		bg.graphics.drawRect(-2000,-2000,4000,4000);
		addChild(bg);
		return bg;
	}


	private handleSelect(event:SelectionEvent):void
	{
		if (Configuration.getConfig().selectable == false) return;

		if (Configuration.getConfig().externalTrigger == true) return;

		if (renderer.mouseDownTravel > Constants.SELECTION_MAX_MOUSETRAVEL) return;  // do nothing when moved

		if (!(event.selectedObject is Atom)) return;

		var selObj:RenderableObject = RenderableObject(event.selectedObject);
		var index:number = selections.indexOf(selObj);

		if (index > -1)
		{
			// already selected so deselect	if possible
			if (index == 0)
			{
		        renderer.deselect(selObj);
		        connectingBonds:Array;
		        if (selections.length >= 2)
		        {
		            connectingBonds = molecule.getBonds(Atom(selObj),Atom(selections[1]));
	                if (connectingBonds && connectingBonds.length>0) renderer.deselect(connectingBonds[0]);
	            }
		    	selections.shift();
	        }
	        else if (index == selections.length-1)
			{
		        renderer.deselect(selObj);
		        if (selections.length >= 2)
		        {
		            connectingBonds = molecule.getBonds(Atom(selObj),Atom(selections[selections.length-2]));
	                if (connectingBonds && connectingBonds.length>0) renderer.deselect(connectingBonds[0]);
		        }
		    	selections.pop();
	        }
	    	renderer.render();
	    	return;
		}

		if (Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_IDENTIFY && selections.length >= 1) clearSelections();

        if ((Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_DISTANCE && selections.length >= 2) ||
	       (Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_ROTATION && selections.length >= 3) ||
	       (Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_TORSION && selections.length >= 4))
	    {
	    	// too many selected
	   	    return;
	    }

		if (selections.length > 0 &&
		   (Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_ROTATION || Configuration.getConfig().selectionMode == Constants.SELECTIONMODE_TORSION))
	    {
			// check for neighborness before selecting
	    	var neighbors:Array = molecule.getNeighbors(selObj);

	    	if (neighbors.indexOf(selections[0]) > -1)
	    	{
	            renderer.select(selObj);
	            renderer.select(molecule.getBonds(Atom(selObj),Atom(selections[0]))[0]);
	            selections.unshift(selObj);
	    	}
	    	else if (neighbors.indexOf(selections[selections.length-1]) > -1)
	    	{
	            renderer.select(selObj);
	            renderer.select(molecule.getBonds(Atom(selObj),Atom(selections[selections.length-1]))[0]);
	            selections.push(selObj);
	    	}
  	  	}
  	  	else
  	  	{
  	  		// no restrictions in other modes
	        renderer.select(selObj);
	        selections.push(selObj);
  	  	}

	    renderer.render();
   }


   private clearSelections():void
   {
   	renderer.deselectAll();
   	selections = [];
   }


	private handleMouseDown(event:MouseEvent):void
	{
		renderer.mouseDownTravel = 0;
		renderer.animate(true);
	}


	private handleMouseUp(event:MouseEvent):void
	{
		renderer.animate(false);

		switch(Configuration.getConfig().selectionMode)
		{
			case Constants.SELECTIONMODE_IDENTIFY :
				displayIdentify();
				break;
			case Constants.SELECTIONMODE_DISTANCE :
				displayDistance();
				break;
			case Constants.SELECTIONMODE_ROTATION :
				displayRotation();
				break;
			case Constants.SELECTIONMODE_TORSION :
				displayTorsion();
				break;
		}
	}


	private handleRenderToolbarMouseDown(event:MouseEvent):void
	{
		if (event.localX < renderToolbar.width*0.333)
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_STICKS;
			renderer.setRenderMode(Constants.RENDERMODE_STICKS);
		}
		else if (event.localX < renderToolbar.width*0.666)
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_BALL_AND_STICK;
			renderer.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
		}
		else
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_SPACE_FILL;
			renderer.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
		}
		clearSelections();
	}


	private handleSelectionToolbarMouseDown(event:MouseEvent):void
	{
		if (event.localX < selectionToolbar.width * 0.25)
		{
			Configuration.getConfig().selectionMode = Constants.SELECTIONMODE_IDENTIFY;
			updateDisplay(Messages.INSTRUCT_IDENTIFY);
		}
		else if (event.localX < selectionToolbar.width * 0.5)
		{
			Configuration.setParameter("selectionMode", Constants.SELECTIONMODE_DISTANCE);
			updateDisplay(Messages.INSTRUCT_DISTANCE);
		}
		else if (event.localX < selectionToolbar.width * 0.75)
		{
			Configuration.setParameter("selectionMode", Constants.SELECTIONMODE_ROTATION);
			updateDisplay(Messages.INSTRUCT_ROTATION);
		}
		else
		{
			Configuration.setParameter("selectionMode", Constants.SELECTIONMODE_TORSION);
			updateDisplay(Messages.INSTRUCT_TORSION);
		}
		clearSelections();
	}


	private displayIdentify():void
	{
        if (selections.length < 1)
		{
			updateDisplay(Messages.INSTRUCT_IDENTIFY);
	        return;
	    }
	    a:Atom = Atom(selections[0]);
		var text:string = a.name + " (" + a.element + ")"

		updateDisplay(text);
	}


	private displayDistance():void
	{
		if (selections.length < 2)
		{
			updateDisplay(Messages.INSTRUCT_DISTANCE);
	        return;
	    }
		var d:number = THREE.Vector3.distance(Atom(selections[0]).loc, Atom(selections[1]).loc);
		var text:string = d.toFixed(4) + " nm\n" + Atom(selections[0]).element + " - " + Atom(selections[1]).element;

		updateDisplay(text);
	}


	private displayRotation():void
	{
		if (selections.length < 3)
		{
			updateDisplay(Messages.INSTRUCT_ROTATION);
	        return;
	    }
		var v:THREE.Vector3 = Atom(selections[0]).loc.subtract(Atom(selections[1]).loc);
		var w:THREE.Vector3 = Atom(selections[2]).loc.subtract(Atom(selections[1]).loc);
		var ang:number = THREE.Vector3.angleBetween(v, w);

		if (!ang)
		{
	        updateDisplay("Invalid atoms selected. Please select a chain of 3 atoms.");
	        return;
	    }

		var text:string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
		Atom(selections[0]).element + " - " + Atom(selections[1]).element + " - " + Atom(selections[2]).element;
		updateDisplay(text);
	}


	private displayTorsion():void
	{
		if (selections.length < 4)
		{
			updateDisplay(Messages.INSTRUCT_TORSION);
	        return;
	    }
		var u:THREE.Vector3 = Atom(selections[1]).loc.subtract(Atom(selections[0]).loc);
		var v:THREE.Vector3 = Atom(selections[2]).loc.subtract(Atom(selections[1]).loc);
		var w:THREE.Vector3 = Atom(selections[3]).loc.subtract(Atom(selections[2]).loc);
		var uXv:THREE.Vector3 = u.crossProduct(v);
		var vXw:THREE.Vector3 = v.crossProduct(w);
		var ang:number;
		if (uXv && vXw)
		{
		     ang = THREE.Vector3.angleBetween(uXv, vXw);
		}	
		if (!ang) 
		{
	        updateDisplay("Invalid atoms selected. Please select a chain of 4 atoms.");
	        return;
	    } 
	      
		var text:string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
		           Atom(selections[0]).element + " - " + Atom(selections[1]).element + " - " + 
		           Atom(selections[2]).element + " - " + Atom(selections[3]).element;
		updateDisplay(text);
	}
	
	
	private updateDisplay(str:string):void
	{
		display.text = str;
		var format:TextFormat = new TextFormat();
		format.font = "Arial";
		format.size = 11;
		format.bold = true;
		display.setTextFormat(format);
	}	


	private clearDisplays():void
	{
		display.text = "";
	}
	
}
}