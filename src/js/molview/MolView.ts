module molview
{
    /// <reference path="../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="Constants.ts" />
    /// <reference path="Messages.ts" />
    /// <reference path="Utility.ts" />
    /// <reference path="model/Atom.ts" />
    /// <reference path="model/Molecule.ts" />
    /// <reference path="model/RenderableObject.ts" />
    /// <reference path="renderer/MockRenderer.ts" />


export class MolView
{
	private selections:model.Atom[];

	private molecule:molview.model.Molecule;

	private renderer:renderer.IMolRenderer;

	private display:HTMLTextAreaElement;

	private renderToolbar:HTMLDivElement;

	private selectionToolbar:HTMLDivElement;

    constructor(params?:Object)
	{
        Configuration.newConfig(params);

        // this is where selections are stored
        this.selections = [];

        // draw the on-screen displays
        this.drawBackground();
        this.drawToolbars();
        this.drawDisplay();

        // load the molecule from the init settings
        if (Configuration.getConfig().pdbUrl)
        {
            this.loadPDB(Configuration.getConfig().pdbUrl);
        } else if (Configuration.getConfig().pdbData) {
            this.renderPDBData();
        }
	}

	private onMouseWheel(event:MouseEvent):void
	{
		var oldZoom:number = Configuration.getConfig().zoom;
		Configuration.getConfig().zoom = oldZoom+event.wheelDelta/50.0;
        this.renderer.render();
	}


    private drawBackground():void
    {
        /*		var bg:Shape = new Shape();
         bg.name = "background";
         bg.graphics.beginFill(0x8888FF);
         bg.graphics.drawRect(-2000,-2000,4000,4000);
         addChild(bg);
         return bg;*/
    }


	private drawToolbars():void
	{
/*		renderToolbar = new MovieClip();
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
		selectionToolbar.addEventListener(MouseEvent.MOUSE_DOWN, handleSelectionToolbarMouseDown);*/
	}


	private drawDisplay():void
	{
/*		display = new TextField();
		display.name = "display";
		display.width = 150;
		display.x = 150;
		display.y = 0;
		display.selectable = false;
		display.wordWrap = true;
		display.text = "";
		addChild(display);*/
	}


    public loadPDB(pdbUrl:string):void
    {
	  if (!pdbUrl)
	  {
          console.warn("empty 3D molecule name");
	  }
        $.get(pdbUrl, (data:string) => {
            Configuration.getConfig().pdbData = data;
            this.renderPDBData();
            });
    }

    private renderPDBData():void
    {
        this.molecule = new molview.model.Molecule();
        this.renderer = new molview.renderer.MockRenderer();
        this.renderer.init();
/*	    addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown, false, 0, false);
	    addEventListener(MouseEvent.MOUSE_UP, handleMouseUp, false, 0, false);
		addEventListener(MouseEvent.MOUSE_WHEEL, onMouseWheel, false, 0, false);
        this.renderer.addEventListener(SelectionEvent.SELECT, handleSelect, false, 0, false); */

		this.molecule.parsePDB(Configuration.getConfig().pdbData);

		if (Configuration.getConfig().autoCenter === true) {
            this.molecule.center();
        }

        // load the initial view
        //if listP(pInitTransform) and pInitTransform.count=16 then pGroup.transform = newtransform(pInitTransform)

		// render the molecule as 3d items
		this.molecule.render(this.renderer);

	    // load initial render mode
        //this.renderer.setRenderMode(Configuration.getConfig().renderMode);

		// draw the molecule on screen
        this.renderer.render();
	}


	private handleSelect(obj:model.RenderableObject):void
	{
		if (Configuration.getConfig().selectable === false) return;

	//	if (this.renderer.mouseDownTravel > Constants.SELECTION_MAX_MOUSETRAVEL) return;  // do nothing when moved

		if (!(obj instanceof model.Atom)) return;

        var selAtom = <model.Atom>obj;

		var index:number = this.selections.indexOf(selAtom);

		if (index > -1)
		{
			// already selected so deselect	if possible
			if (index === 0)
			{
                //this.renderer.deselect(selAtom);
		        var connectingBonds:Array;
		        if (this.selections.length >= 2)
		        {
		            connectingBonds = this.molecule.getBonds(selAtom, this.selections[1]);
	                if (connectingBonds && connectingBonds.length > 0) renderer.deselect(connectingBonds[0]);
	            }
                this.selections.shift();
	        }
	        else if (index === this.selections.length-1)
			{
		        //this.renderer.deselect(selAtom);
		        if (this.selections.length >= 2)
		        {
		            connectingBonds = this.molecule.getBonds(selAtom, this.selections[this.selections.length-2]);
	                if (connectingBonds && connectingBonds.length>0) renderer.deselect(connectingBonds[0]);
		        }
                this.selections.pop();
	        }
            this.renderer.render();
	    	return;
		}

		if (Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_IDENTIFY && this.selections.length >= 1) this.clearSelections();

        if ((Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_DISTANCE && this.selections.length >= 2) ||
	       (Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_ROTATION && this.selections.length >= 3) ||
	       (Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_TORSION && this.selections.length >= 4))
	    {
	    	// too many selected
	   	    return;
	    }

		if (this.selections.length > 0 &&
		   (Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_ROTATION || Configuration.getConfig().selectionMode === Constants.SELECTIONMODE_TORSION))
	    {
			// check for neighborness before selecting
	    	var neighbors:Array = this.molecule.getNeighbors(selAtom);

	    	if (neighbors.indexOf(this.selections[0]) > -1)
	    	{
                //this.renderer.select(selAtom);
                //this.renderer.select(this.molecule.getBonds(selAtom, this.selections[0])[0]);
                this.selections.unshift(selAtom);
	    	}
	    	else if (neighbors.indexOf(this.selections[this.selections.length-1]) > -1)
	    	{
	            //this.renderer.select(selAtom);
	            //this.renderer.select(this.molecule.getBonds(selAtom, this.selections[this.selections.length-1])[0]);
                this.selections.push(selAtom);
	    	}
  	  	}
  	  	else
  	  	{
  	  		// no restrictions in other modes
            //this.renderer.select(selAtom);
            this.selections.push(selAtom);
  	  	}

        this.renderer.render();
   }


   private clearSelections():void
   {
       //this.renderer.deselectAll();
   	this.selections = [];
   }


	private handleMouseDown(event:MouseEvent):void
	{
        //this.renderer.mouseDownTravel = 0;
        //this.renderer.animate(true);
	}


	private handleMouseUp(event:MouseEvent):void
	{
		//this.renderer.animate(false);

		switch(Configuration.getConfig().selectionMode)
		{
			case Constants.SELECTIONMODE_IDENTIFY :
				this.displayIdentify();
				break;
			case Constants.SELECTIONMODE_DISTANCE :
                this.displayDistance();
				break;
			case Constants.SELECTIONMODE_ROTATION :
                this.displayRotation();
				break;
			case Constants.SELECTIONMODE_TORSION :
                this.displayTorsion();
				break;
		}
	}


	private handleRenderToolbarMouseDown(event:MouseEvent):void
	{
		if (event.clientX < this.renderToolbar.clientWidth*0.333)
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_STICKS;
			//this.renderer.setRenderMode(Constants.RENDERMODE_STICKS);
		}
		else if (event.clientX < this.renderToolbar.clientWidth*0.666)
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_BALL_AND_STICK;
			//this.renderer.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
		}
		else
		{
		    Configuration.getConfig().renderMode = Constants.RENDERMODE_SPACE_FILL;
			renderer.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
		}
		this.clearSelections();
	}


	private handleSelectionToolbarMouseDown(event:MouseEvent):void
	{
		if (event.clientX < this.selectionToolbar.clientWidth * 0.25)
		{
			Configuration.getConfig().selectionMode = Constants.SELECTIONMODE_IDENTIFY;
			this.updateDisplay(Messages.INSTRUCT_IDENTIFY);
		}
		else if (event.clientX < this.selectionToolbar.clientWidth * 0.5)
		{
			Configuration.getConfig().selectionMode = Constants.SELECTIONMODE_DISTANCE;
			this.updateDisplay(Messages.INSTRUCT_DISTANCE);
		}
		else if (event.clientX < this.selectionToolbar.clientWidth * 0.75)
		{
			Configuration.getConfig().selectionMode = Constants.SELECTIONMODE_ROTATION;
			this.updateDisplay(Messages.INSTRUCT_ROTATION);
		}
		else
		{
			Configuration.getConfig().selectionMode = Constants.SELECTIONMODE_TORSION;
			this.updateDisplay(Messages.INSTRUCT_TORSION);
		}
		this.clearSelections();
	}


	private displayIdentify():void
	{
        if (this.selections.length < 1)
		{
			this.updateDisplay(Messages.INSTRUCT_IDENTIFY);
	        return;
	    }
	    var a:model.Atom = this.selections[0];
		var text:string = a.name + " (" + a.element + ")"

		this.updateDisplay(text);
	}


	private displayDistance():void
	{
		if (this.selections.length < 2)
		{
			this.updateDisplay(Messages.INSTRUCT_DISTANCE);
	        return;
	    }
		var d:number = this.selections[0].loc.distanceTo(this.selections[1].loc);
		var text:string = d.toFixed(4) + " nm\n" + this.selections[0].element + " - " + this.selections[1].element;

		this.updateDisplay(text);
	}


	private displayRotation():void
	{
		if (this.selections.length < 3)
		{
			this.updateDisplay(Messages.INSTRUCT_ROTATION);
	        return;
	    }
		var v:THREE.Vector3 = this.selections[0].loc.sub(this.selections[1].loc);
		var w:THREE.Vector3 = this.selections[2].loc.sub(this.selections[1].loc);
		var ang:number = v.angleTo(w);

		if (!ang)
		{
	        this.updateDisplay("Invalid atoms selected. Please select a chain of 3 atoms.");
	        return;
	    }

		var text:string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
		this.selections[0].element + " - " + this.selections[1].element + " - " + this.selections[2].element;
		this.updateDisplay(text);
	}


	private displayTorsion():void
	{
		if (this.selections.length < 4)
		{
			this.updateDisplay(Messages.INSTRUCT_TORSION);
	        return;
	    }
		var u:THREE.Vector3 = this.selections[1].loc.sub(this.selections[0].loc);
		var v:THREE.Vector3 = this.selections[2].loc.sub(this.selections[1].loc);
		var w:THREE.Vector3 = this.selections[3].loc.sub(this.selections[2].loc);
		var uXv:THREE.Vector3 = u.cross(v);
		var vXw:THREE.Vector3 = v.cross(w);
		var ang:number = (uXv && vXw) ? uXv.angleTo(vXw) : null;
		if (ang === null)
		{
	        this.updateDisplay("Invalid atoms selected. Please select a chain of 4 atoms.");
	        return;
	    } 
	      
		var text:string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
		           this.selections[0].element + " - " + this.selections[1].element + " - " +
		           this.selections[2].element + " - " + this.selections[3].element;
		this.updateDisplay(text);
	}
	
	
	private updateDisplay(str:string):void
	{
		display.text = str;
		var format:HTMLTextAreaElement = new HTMLTextAreaElement();
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