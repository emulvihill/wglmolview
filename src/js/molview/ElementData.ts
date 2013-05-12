module molview
{	
public class ElementData
{	
	private static atomData:Object;
	
	private static atomDataText:string = "1,Hydrogen,H,32,FFFFFF:2,Helium,He,31,FFC8C8:3,Lithium,Li,152,A52A2A:4,Beryllium,Be,112,FF1493:5,Boron,B,98,00FF00:6,Carbon,C,91,C8C8C8:7,Nitrogen,N,92,8F8FFF:8,Oxygen,O,73,F00000:9,Fluorine,F,72,C8A518:10,Neon,Ne,71,FF1493:11,Sodium,Na,186,0000FF:12,Magnesium,Mg,160,2A802A:13,Aluminum,Al,143,808090:14,Silicon,Si,132,C8A518:15,Phosphorus,P,128,FFA500:16,Sulfur,S,127,FFC832:17,Chlorine,Cl,99,00FF00:18,Argon,Ar,98,FF1493:19,Potassium,K,227,FF1493:20,Calcium,Ca,197,808090:21,Scandium,Sc,100,FF1493:22,Titanium,Ti,100,808090:23,Vanadium,V,100,FF1493:24,Chromium,Cr,100,808090:25,Manganese,Mn,100,808090:26,Iron,Fe,100,FFA500:27,Cobalt,Co,100,FF1493:28,Nickel,Ni,100,A52A2A:29,Copper,Cu,100,A52A2A:30,Zinc,Zn,100,A52A2A:31,Gallium,Ga,135,FF1493:32,Germanium,Ge,122,FF1493:33,Arsenic,As,120,FF1493:34,Selenium,Se,140,FF1493:35,Bromine,Br,114,A52A2A:36,Krypton,Kr,112,FF1493:37,Rubidium,Rb,248,FF1493:38,Strontium,Sr,215,FF1493:39,Yttrium,Y,100,FF1493:40,Zirconium,Zr,100,FF1493:41,Niobium,Nb,100,FF1493:42,Molybdenum,Mo,100,FF1493:43,Technetium,Tc,100,FF1493:44,Ruthenium,Ru,100,FF1493:45,Rhodium,Rh,100,FF1493:46,Palladium,Pd,100,FF1493:47,Silver,Ag,100,808090:48,Cadmium,Cd,100,FF1493:49,Indium,In,167,FF1493:50,Tin,Sn,162,FF1493:51,Antimony,Sb,140,FF1493:52,Tellurium,Te,142,FF1493:53,Iodine,I,133,8F8FFF:54,Xenon,Xe,131,FF1493:55,Cesium,Cs,265,FF1493:56,Barium,Ba,222,FFA500:79,Gold,Au,100,C8A518:80,Mercury,Hg,100,FF1493:81,Thallium,Tl,170,FF1493:82,Lead,Pb,146,FF1493:83,Bismuth,Bi,150,FF1493:84,Polonium,Po,168,FF1493:85,Astatine,At,140,FF1493:86,Radon,Rn,141,FF1493";
	
	public static public getData(e:string):Object
	{
		if (atomData ==  null)
		{
			initData();
		}

		return atomData[e];
	}
	
	private static function initData():void
	{
		//load data from text clip. example: 29,Copper,Cu,100,A52A2A
		atomData = new Object();
		var dataArr:Array = atomDataText.split(":");
		for (var i:number = 0; i < dataArr.length; i++)
		{
			var edata:Array = String(dataArr[i]).split(",");
			atomData [edata[2]] = {name : edata[1] , number : Number (edata[0]),
				radius : Number (edata[3]) , color : edata[4]};
		}
	}
}
}