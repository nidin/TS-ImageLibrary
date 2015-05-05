/**
 * @author Nidin Vinayakan
 */
module nid{
    export function saveAs(data:any,name:string="Unnamed"){
        var blob = new Blob([data],{type: 'application/octet-binary'});
        var url = URL.createObjectURL(blob);
        var save_link:any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        save_link.href = url;
        save_link.download = name;
        var event:any = document.createEvent("MouseEvents");
        event.initMouseEvent(
            "click", true, false, null, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        save_link.dispatchEvent(event);
    }
}
