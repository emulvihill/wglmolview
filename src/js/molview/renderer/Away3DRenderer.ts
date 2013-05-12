module molview.renderer
{
import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import away3d.core.base.Object3D;
import away3d.core.math.Matrix3DUtils;
import away3d.core.math.Quaternion;
import away3d.core.render.Renderer;
import away3d.events.MouseEvent3D;
import away3d.lights.DirectionalLight3D;
import away3d.materials.ColorMaterial;
import away3d.materials.Material;
import away3d.materials.PhongColorMaterial;
import away3d.primitives.Cylinder;
import away3d.primitives.Sphere;

import com.Configuration;
import com.Constants;
import com.snazzyrobot.molview3d.events.SelectionEvent;
import com.snazzyrobot.molview3d.model.Atom;
import com.snazzyrobot.molview3d.model.Bond;
import com.snazzyrobot.molview3d.model.IRenderableObject;

import flash.display.Sprite;
import flash.events.Event;
import flash.geom.THREE.Vector3;
import flash.utils.Dictionary;

import mx.core.BitmapAsset;

export class Away3DRenderer extends Sprite implements IMolRenderer
{
	
    [Embed(source="../assets/greySphere.png")]
    private var greySphereBitmapClass:Class; 
    
    private var greySphereBitmap:BitmapAsset;
    
	private var view:View3D;
	
	private var moleculeContainer:ObjectContainer3D;
	
	private var light:DirectionalLight3D;
	
	private var viewToModel:Dictionary;
	
	private var modelToView:Dictionary;

	private var moleculeQ:Quaternion;

	private var newQ:Quaternion;
	
    private var lastX:number;
    
    private var lastY:number;
    	
    private var mouseDownX:number;
    
    private var mouseDownY:number;
	
	private var _mouseDownTravel:number;
	
	
	function init():void
	{
		// create a 3D-viewport
        view = new View3D({x:300, y:200, renderer:Renderer.BASIC});
        
        // bitmaps
        greySphereBitmap = new greySphereBitmapClass();
        
        // keep track of the current rotation of the molecule

        // add viewport to the stage
        addChild(view);
        moleculeContainer = new ObjectContainer3D({x:0, y:0, name:"moleculeContainer"});
        view.scene.addChild(moleculeContainer);

        light = new DirectionalLight3D({color:"white", x:0,y:1000,z:300}); 
        
        view.scene.addLight(light);
        
        // initialize dictionaries
        viewToModel = new Dictionary();
        modelToView = new Dictionary();
		
		// register mouse event handler
		moleculeContainer.addEventListener(MouseEvent3D.MOUSE_UP, onMoleculeContainerMouseUp);
		
		function onMoleculeContainerMouseUp(event:MouseEvent3D):void
		{		
			// inform app of the model object that got clicked					
			dispatchEvent(new SelectionEvent(SelectionEvent.SELECT, viewToModel[event.object.parent]));
		}
	}
	
	
	public get mouseDownTravel():number
	{
		return _mouseDownTravel;
	}
		
		
	public set mouseDownTravel(num:number):void
	{
		_mouseDownTravel = num;
	}
	
	
	function addRenderableObject(obj:IRenderableObject):void
	{
		var view_obj:ObjectContainer3D;
		
		if (obj is Atom)
		{
			view_obj = renderAtom(Atom(obj));
		}
		else if (obj is Bond)
		{
			view_obj = renderBond(Bond(obj));				    				    
		}

		moleculeContainer.addChild(view_obj);
		modelToView[obj] = view_obj;
		viewToModel[view_obj] = obj;
	}
	
	
	function select(obj:Object):void
	{
		var view_obj:ObjectContainer3D = modelToView[obj];
		
		if (!view_obj) throw new Error("cannot find view object for " + obj);
		
		if (obj is Atom) 
		{
	        var sel:Sphere = new Sphere( {name:Constants.SELECTION, material:new ColorMaterial("red",{alpha:0.25}), 
	            radius:obj.radius + 8, segmentsH:9, segmentsW:9} );
		    view_obj.addChild( sel );
		}
		else if (obj is Bond)
		{
		    var start:number = Atom(obj.atoms[0]).radius - 5;
		    var end:number = obj.length - Atom(obj.atoms[1]).radius + 5;
		    var len:number = end - start;
		    var selObj:Object3D = new Cylinder({radius:12, sides:6,
					       material:new ColorMaterial("red",{alpha:0.25}), 
					       yUp:false,
					       axis:new THREE.Vector3(0,0,len), z:start,
					       name:Constants.SELECTION, bothsides:true} );
					       
	        view_obj.addChild(selObj);	
		}
						
	}
	
	
	function deselect(obj:Object):void
	{
		var view_obj:ObjectContainer3D = modelToView[obj];
		
		if (!view_obj) throw new Error("cannot find view object for " + obj);

		if (view_obj.getChildByName(Constants.SELECTION)) view_obj.removeChildByName(Constants.SELECTION);			
	}	
	
		
	function deselectAll():void
	{
		for (var obj:Object in modelToView)
		{
			if (modelToView[obj].getChildByName(Constants.SELECTION))
			{
			    modelToView[obj].removeChildByName(Constants.SELECTION);
			}
		}
	}
	
	
	function setRenderQuality(quality:string):void
	{
		switch (quality)
		{
			case Constants.RENDERQUALITY_PREVIEW :
			
			break;
			
			case Constants.RENDERQUALITY_LOW :
			
			break;
			
			case Constants.RENDERQUALITY_NORMAL :
			
			break;
			
			case Constants.RENDERQUALITY_HIGH :
			
			break;				
			
		}
	}
	
	
	function setRenderMode(mode:string):void
	{
        var str:string;
		var view_obj:ObjectContainer3D;
		
		for (str in moleculeContainer.children)
		{		
		    view_obj = ObjectContainer3D(moleculeContainer.children[str]);					
		    if (view_obj.name == Constants.CONTAINER_BOND)
			{	
				var m:Array = getBondMetrics(Bond(viewToModel[view_obj]), mode);
				for (var i:number = 0; i < view_obj.children.length; i++)
				{
					var object:Object3D = view_obj.children[i];							
					object.z = m[0];
					object.transform.appendScale(1, 1, m[2]);  //?
				}
			}
		}

		switch (mode)
		{
			case Constants.RENDERMODE_BALL_AND_STICK :
				for (str in moleculeContainer.children)
				{
					view_obj = ObjectContainer3D(moleculeContainer.children[str]);
					if (view_obj.name == Constants.CONTAINER_ATOM)
					{
						view_obj.visible = true;
					    view_obj.children[0].transform.appendScale(1,1,1);
					} else 
					{
					  view_obj.visible = true;
					}
				}
			    break;
			case Constants.RENDERMODE_SPACE_FILL :
			
			    Configuration.getConfig().renderQuality = Constants.RENDERQUALITY_HIGH;
			    
				for (str in moleculeContainer.children)
				{
					view_obj = ObjectContainer3D(moleculeContainer.children[str]);
					if (view_obj.name == Constants.CONTAINER_ATOM)
					{
						view_obj.visible = true;
					    view_obj.children[0].transform.appendScale(3,3,3);  //?
					} else 
					{
					  view_obj.visible = false;
					}
				}
				break;
			case Constants.RENDERMODE_STICKS :
				for (str in moleculeContainer.children)
				{
					view_obj = ObjectContainer3D(moleculeContainer.children[str]);
					if (view_obj.name == Constants.CONTAINER_ATOM)
					{
						view_obj.visible = false;
					} 
					else
					{
					  view_obj.visible = true;
					}
				}
			    break;
		}
	

		render();
	}
	
	
	function animate(bool:Boolean):void
	{
		if (bool)
		{
		    mouseDownX = view.mouseX;
		    mouseDownY = view.mouseY;         
		    addEventListener(Event.ENTER_FRAME, loop3D);
		}
		else
		{
		    removeEventListener(Event.ENTER_FRAME, loop3D);
			moleculeQ = newQ;
		}
	}
	
	
	private loop3D(e:Event):void
	{
         //get rotation vector
         var v:THREE.Vector3 = new THREE.Vector3(0,0,1).crossProduct(new THREE.Vector3(mouseDownX-view.mouseX, mouseDownY-view.mouseY, 0));

         //get transform quaternion
         var q:Quaternion = new Quaternion();
         q.axis2quaternion(v.x, v.y, v.z, - Math.PI*Math.sqrt(Math.pow(mouseDownX-view.mouseX, 2) +
              Math.pow(mouseDownY-view.mouseY,2))/20000);
              
         if (moleculeQ == null) moleculeQ = q;              

         //get molecule quaternion
         newQ = new Quaternion();
         newQ.multiply(q, moleculeQ);
 
         //set globe transform matrix
         moleculeContainer.transform = Matrix3DUtils.quaternion2matrix(newQ);

 		 mouseDownTravel = Math.abs(view.mouseX - mouseDownX) + Math.abs(view.mouseY - mouseDownY);
		 		 
		 render();
	}	
	
	
	function render():void
	{
		view.camera.moveTo(0, 0, 3.0 * view.scene.boundingRadius / Configuration.getConfig().zoom);
		view.camera.lookAt(moleculeContainer.position);
		view.render();
    }    
    
    
	// RENDER FUNCTIONS
	private renderBond(bond:Bond):ObjectContainer3D
	{
		var quality:string = Configuration.getConfig().renderQuality;
		var mode:string = Configuration.getConfig().renderMode;
	
		var view_obj:ObjectContainer3D = new ObjectContainer3D();
				
		view_obj.name = Constants.CONTAINER_BOND;
		
		var bond_mat:Material;
		
		if (quality == Constants.RENDERQUALITY_HIGH)
		{
		    bond_mat = new PhongColorMaterial(bond.color);
		}
		else
		{
			bond_mat = new ColorMaterial(bond.color);
		}
						
		var tubes:Array = new Array();
		
	    var m:Array = getBondMetrics(bond, mode);
				
		switch (bond.type)
		{
			case 1:
				tubes.push( new Cylinder({material:bond_mat, radius:5, height:1, yUp:false}) );
			    break;
	    
 			case 2:
 			tubes.push( new Cylinder({material:bond_mat, radius:5, height:1, yUp:false}) );
 			tubes.push( new Cylinder({material:bond_mat, radius:5, height:1, yUp:false}) );
 			tubes[0].x = 6;
 			tubes[1].x = -6;		     					    
			    break;
			    
			case 3:
 			tubes.push( new Cylinder({material:bond_mat, radius:4, height:1, yUp:false}) );
 			tubes.push( new Cylinder({material:bond_mat, radius:4, height:1, yUp:false}) );
 			tubes.push( new Cylinder({material:bond_mat, radius:4, height:1, yUp:false}) );
 			tubes[0].x = 6;
 			tubes[0].y = -3.5
 			tubes[1].x = -6;
 			tubes[1].y = -3.5
 			tubes[2].y = 3.5;
 			break
 	    }
 			
	   
   	    for each (var tube:Object3D in tubes)
   	    {
   	        view_obj.addChild(tube);
   	    }
   	    view_obj.transform.appendScale(1,1,m[2]);
	    
	    var offset:THREE.Vector3 = Atom(bond.atoms[1]).loc.subtract(Atom(bond.atoms[0]).loc);
        offset.normalize(); //offset.normalize(m[0]);
	    //var loc:THREE.Vector3 = new THREE.Vector3();
	    //loc.scale(Atom(bond.atoms[0]).loc, 100);
        var loc:THREE.Vector3 = Atom(bond.atoms[0]).loc.clone();
        loc.scaleBy(100);
	    loc.add(offset);
	    
	    view_obj.moveTo(loc.x, loc.y, loc.z);
	    
	    loc = Atom(bond.atoms[1]).loc.clone();
	    loc.scaleBy(100);
	    view_obj.lookAt(loc);	
		
		return view_obj;	    		
	}
	

	private renderAtom(atom:Atom):ObjectContainer3D
	{
		var quality:string = Configuration.getConfig().renderQuality;
		
		var view_obj:ObjectContainer3D = new ObjectContainer3D({name:Constants.CONTAINER_ATOM});
				
		var mat:PhongColorMaterial = new PhongColorMaterial(atom.color);
		
		if (quality == Constants.RENDERQUALITY_HIGH || quality == Constants.RENDERQUALITY_NORMAL)
		{
		    view_obj.addChild(new Sphere({material:mat, radius:atom.radius, 
		        segmentsH:Math.floor(3+atom.radius/12), 
		        segmentsW:Math.floor(3+atom.radius/12)}));
		}
		else 
		{

            // TODO: Sprite2D has been replaced by Sprite3D (in 3.5, both still existed in order to maintain compatibility, but the development for 3.6 forced us to make a decision on removing the deprecated Sprite2D altogether). You can still create a sprite with a bitmapData object - the difference now is that you have to wrap bitmapData in a BitmapMaterial.
		   // view_obj.addChild( new Sprite2D(greySphereBitmap.bitmapData.clone()) );
		    //view_obj.boundingRadius;
		}

		var moveToLoc:THREE.Vector3 = atom.loc.clone();
		moveToLoc.scaleBy(100);
		view_obj.moveTo(moveToLoc.x, moveToLoc.y, moveToLoc.z);
		
		return view_obj;
	}
	
	/*
	* Measure the "empty space" at the ends of bonds, to make it look right with drawing between atoms
	* [length between atom0 & start of bond, length between end of bond & atom1, bond length as drawn]
	*/
	private getBondMetrics(bond:Bond, mode:string):Array
	{
		if (mode == Constants.RENDERMODE_STICKS)
		{
			return [0,bond.length,bond.length];
		}
		else
		{
			return [Atom(bond.atoms[0]).radius - 12,
			bond.length - Atom(bond.atoms[1]).radius + 12,
			bond.length - (Atom(bond.atoms[1]).radius + Atom(bond.atoms[0]).radius) + 24]
		}
	}
}
}