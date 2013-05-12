module molview
{

public class Configuration
{
	private static init:Object = {};
	
	public static configure(init:Object):void
	{
		Configuration.init = init;
	}	
		
	public static getConfig():Object
	{
		return init;
	}
	
	public static setParameter(param:string, val:Object):Boolean
	{
		if (init.hasOwnProperty(param))
		{
			init[param] = val;	
		}
		return init.hasOwnProperty(param);
	}
		
}
}