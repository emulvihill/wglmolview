module molview
{
    /// <reference path="../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="Constants.ts" />
    /// <reference path="Messages.ts" />
    /// <reference path="Utility.ts" />
    /// <reference path="model/Atom.ts" />
    /// <reference path="model/Bond.ts" />
    /// <reference path="model/Molecule.ts" />
    /// <reference path="model/RenderableObject.ts" />
    /// <reference path="renderer/MockRenderer.ts" />
    /// <reference path="renderer/ThreeJsRenderer.ts" />

export class MolView
{
	private selections:model.Atom[];

	private molecule:molview.model.Molecule;

	private renderer:renderer.IMolRenderer;

    private domElement:JQuery;

    private infoElement:JQuery;

	private display:HTMLTextAreaElement;

	private renderToolbar:HTMLDivElement;

	private selectionToolbar:HTMLDivElement;

    private config:Configuration;

    constructor(params?:Object)
	{
        Configuration.newConfig(params);

        this.config = Configuration.getConfig();

        // this is where selections are stored
        this.selections = [];

        // load the molecule from the init settings
        if (this.config.pdbUrl)
        {
            this.loadPDB(this.config.pdbUrl);
        } else if (this.config.pdbData) {
            this.renderPDBData();
        }
	}

	private onMouseWheel(event:MouseEvent):void
	{
		var oldZoom:number = this.config.zoom;
		this.config.zoom = oldZoom+event.wheelDelta/50.0;
        this.renderer.render();
	}

    public loadPDB(pdbUrl:string):void
    {
	  if (!pdbUrl)
	  {
          console.warn("empty 3D molecule name");
	  }
        $.get(pdbUrl, (data:string) => {
            this.config.pdbData = data;
            this.renderPDBData();
            });
    }

    setRenderMode(mode:string):void {
        this.config.renderMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    setSelectionMode(mode:string):void {
        this.config.selectionMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    private renderPDBData():void
    {
        this.molecule = new molview.model.Molecule();
        this.renderer = new molview.renderer.ThreeJsRenderer();

        // get the DOM element to attach to
        // - assume we've got jQuery to hand
        this.domElement = $('#' + this.config.domElement);
        this.infoElement = $('#' + this.config.infoElement);
        this.renderer.init(this.domElement);
        this.domElement.click(null, (event)=>{this.handleSelect(event)});
        this.domElement.click(null, (event)=>{this.updateInfoDisplay(event)});

		this.molecule.parsePDB(this.config.pdbData);

		if (this.config.autoCenter === true) {
            this.molecule.center();
        }

		// render the molecule as 3d items
		this.molecule.render(this.renderer);

	    // load initial render mode
        //this.renderer.setRenderMode(this.config.renderMode);

		// draw the molecule on screen
        this.renderer.render();
	}


	private handleSelect(event:MouseEvent):void
	{
		if (this.config.selectable === false) return;

        var obj:model.RenderableObject = this.renderer.getSelectedObject(event);
		if (!(obj instanceof model.Atom)) return;

        var selAtom = <model.Atom>obj;

		var index:number = this.selections.indexOf(selAtom);

		if (index > -1)
		{
			// already selected so deselect	if possible
            var connectingBonds:model.Bond[];
			if (index === 0)
			{
                this.renderer.deselect(selAtom);
		        if (this.selections.length >= 2)
		        {
		            connectingBonds = this.molecule.getBonds(selAtom, this.selections[1]);
	                if (connectingBonds && connectingBonds.length > 0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
	            }
                this.selections.shift();
	        }
	        else if (index === this.selections.length-1)
			{
		        this.renderer.deselect(selAtom);
		        if (this.selections.length >= 2)
		        {
		            connectingBonds = this.molecule.getBonds(selAtom, this.selections[this.selections.length-2]);
	                if (connectingBonds && connectingBonds.length>0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
		        }
                this.selections.pop();
	        }
            this.renderer.render();
	    	return;
		}

		if (this.config.selectionMode === Constants.SELECTIONMODE_IDENTIFY && this.selections.length >= 1) this.clearSelections();

        if ((this.config.selectionMode === Constants.SELECTIONMODE_DISTANCE && this.selections.length >= 2) ||
	       (this.config.selectionMode === Constants.SELECTIONMODE_ROTATION && this.selections.length >= 3) ||
	       (this.config.selectionMode === Constants.SELECTIONMODE_TORSION && this.selections.length >= 4))
	    {
	    	// too many selected
	   	    return;
	    }

		if (this.selections.length > 0 &&
		   (this.config.selectionMode === Constants.SELECTIONMODE_ROTATION || this.config.selectionMode === Constants.SELECTIONMODE_TORSION))
	    {
			// check for neighborness before selecting
	    	var neighbors:Array = this.molecule.getNeighbors(selAtom);

	    	if (neighbors.indexOf(this.selections[0]) > -1)
	    	{
                this.renderer.select(selAtom);
                this.renderer.select(this.molecule.getBonds(selAtom, this.selections[0])[0]);
                this.selections.unshift(selAtom);
	    	}
	    	else if (neighbors.indexOf(this.selections[this.selections.length-1]) > -1)
	    	{
	            this.renderer.select(selAtom);
	            this.renderer.select(this.molecule.getBonds(selAtom, this.selections[this.selections.length-1])[0]);
                this.selections.push(selAtom);
	    	}
  	  	}
  	  	else
  	  	{
  	  		// no restrictions in other modes
            this.renderer.select(selAtom);
            this.selections.push(selAtom);
  	  	}

        this.renderer.render();
   }


   private clearSelections():void
   {
       this.renderer.deselectAll();
   	   this.selections = [];
   }


	private updateInfoDisplay(event:MouseEvent):void
	{
		switch(this.config.selectionMode)
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


	private displayIdentify():void
	{
        if (this.selections.length < 1)
		{
			this.updateDisplay(Messages.INSTRUCT_IDENTIFY);
	        return;
	    }
	    var a:model.Atom = this.selections[0];
		var text:string = a.name + " (" + a.element + ")";

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
		var v:THREE.Vector3 = new THREE.Vector3().subVectors(this.selections[0].loc, this.selections[1].loc);
		var w:THREE.Vector3 = new THREE.Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
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
		var u:THREE.Vector3 = new THREE.Vector3().subVectors(this.selections[1].loc, this.selections[0].loc);
		var v:THREE.Vector3 = new THREE.Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
		var w:THREE.Vector3 = new THREE.Vector3().subVectors(this.selections[3].loc, this.selections[2].loc);
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
        this.infoElement.text(str);
	}	


	private clearDisplays():void
	{
        //this.infoElement.text("");
	}
	
}
}