/**
 * JavaScript BitmapData
 * version : 1.0.0
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
module nid.display{

    export class BitmapData{

        private imageData:ImageData;

        constructor(imageData){
            if(imageData == undefined){
                this.imageData = new ImageData();
            }else{
                this.imageData = imageData;
            }
        }
        get transparent():boolean{
            return true;
        }
        get data():number[]{
            return this.imageData.data;
        }
        get height(): number{
            return this.imageData.height;
        }
        get width(): number{
            return this.imageData.width;
        }
        public getPixel(x:number, y:number):number{
            var pos = (x + y * this.width) * 4;
            var r:number = this.imageData.data[pos];
            var g:number = this.imageData.data[pos+1];
            var b:number = this.imageData.data[pos+2];
            var a:number = this.imageData.data[pos+3];
            return r << 16 | g << 8 | b;
        }
        public getPixel32(x:number, y:number):number{
            var pos = (x + y * this.width) * 4;
            var r:number = this.imageData.data[pos];
            var g:number = this.imageData.data[pos+1];
            var b:number = this.imageData.data[pos+2];
            var a:number = this.imageData.data[pos+3];
            return r << 24 | g << 16 | b << 8 | a;
        }
        public setPixel32(x:number, y:number, value:number):void{
            var pos = (x + y * this.width) * 4;

            var r:number = value >> 24;
            var g:number = value >> 16 & 0xFF;
            var b:number = value >> 8 & 0xFF;
            var a:number = value & 0xFF;

            this.imageData.data[pos]   = r;
            this.imageData.data[pos+1] = g;
            this.imageData.data[pos+2] = b;
            this.imageData.data[pos+3] = a;
        }
    }
}