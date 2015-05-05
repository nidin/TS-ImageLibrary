/**
 * @author Nidin Vinayakan
 */

declare function log(...a):void;
declare function info(...a):void;
declare function warn(...a):void;
declare function error(...a):void;
declare function saveLog():void;
declare var debugMode:boolean;
declare var logError:boolean;
declare var logWaring:boolean;
declare var logHistory:any;

this.log = function(a,force:boolean=false){
    logHistory += a+"\n";
    if(debugMode || force){
        console.log(a);
    }
};
this.info = function(a){
    logHistory += a+"\n";
    if(debugMode){
        console.log(a);
    }
};
this.warn = function(a){
    logHistory += a+"\n";
    if(logWaring){
        console.warn('warning:',a);
    }
};
this.error = function(a){
    logHistory += a+"\n";
    if(logError){
        console.error('error:',a);
    }
};
this.saveLog = function(){
    var blob = new Blob([logHistory],{type: 'application/octet-binary'});
    var url = URL.createObjectURL(blob);
    var save_link:any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = url;
    var event:any = document.createEvent("MouseEvents");
    event.initMouseEvent(
        "click", true, false, null, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
    );
    save_link.dispatchEvent(event);
};
debugMode = false;
logError = true;
logWaring = true;
logHistory = "";