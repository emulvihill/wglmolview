module molview.renderer
{
	export interface IRenderer
	{
		init():void;
        reset():void;
	    render():void;
	}
}