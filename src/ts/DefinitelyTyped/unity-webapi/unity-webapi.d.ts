// Type definitions for Ubuntu Unity Web API 1.0
// Project: https://launchpad.net/libunity-webapps
// Definitions by: John Vrbanac <john.vrbanac@linux.com> | https://github.com/jmvrbanac
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare class UnitySettings {
   public name:string;
   public iconUrl:string;
   public onInit:Function;
}

enum UnityPlaybackState {
   Playing,
   Paused
}

declare class UnityTrackMetadata {
   title:string;

   // Optionals
   album:string;
   artist:string;
   artLocation:string;
}

interface UnityMediaPlayer {
   setTrack(trackMetadata:UnityTrackMetadata);

   onPrevious(onPreviousCallback:Function);
   onNext(onNextCallback:Function);
   onPlayPause(onPlayPauseCallback:Function);

   getPlaybackstate(response:Function);
   setPlaybackstate(state:UnityPlaybackState);

   setCanGoNext(cangonext:Boolean);
   setCanGoPrev(cangoprev:Boolean);
   setCanPlay(canplay:Boolean);
   setCanPause(canpause:Boolean);
}	      

interface UnityNotification {
   showNotification (summary:string, body:string, iconUrl?:string);
} 

declare class UnityIndicatorProperties {
   public count:Number;
   public time:Date;
   public iconURI:string;
   public onIndicatorActivated:Function;
}

interface UnityMessagingIndicator {
   showIndicator(name:string, indicatorProperties:UnityIndicatorProperties);
   clearIndicator(name:string);
   clearIndicators();

   addAction(name:string, onActionInvoked:Function);
   removeAction(name:string);
   removeActions();
   onPresenceChanged(onPresenceChanged:Function);
   
   // This is suppose to be readonly, but i'm not sure how to do this
   // in a definition file.
   presence:string;
}

 interface UnityLauncher {
   setCount(count:number);
   clearCount();
	
   setProgress(progress:number);
   clearProgress();

   setUrgent(urgent:Boolean);

   addAction(name:string, onActionInvoked:Function);
   removeAction(name:string);
   removeActions();
} 

interface Unity {
	init(settings:UnitySettings);
	addAction(name:string, callback:Function);
	removeAction(actionName:string);
   	removeActions();

	Notification:UnityNotification;
	MediaPlayer:UnityMediaPlayer;
	MessagingIndicator:UnityMessagingIndicator;
	Launcher:UnityLauncher;
}

interface BrowserPublic {
	getUnityObject(version:number):Unity;
}

