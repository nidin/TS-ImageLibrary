///<reference path="lib.d.ts" />
/**
 * JavaScript Image Library
 * version : 1.0.0
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
module nid{

    import ByteArray = nid.utils.ByteArray;
    import BitmapData = nid.display.BitmapData;
    import JPEGEncoder = nid.encoder.JPEGEncoder;
    import PNGEncoder = nid.encoder.PNGEncoder;

    export class ImageLibrary{

        static jpegEncoder:JPEGEncoder = new JPEGEncoder();

        static encodePNG(bitmap:ImageData|BitmapData|ByteArray,callback:Function=null):ByteArray{
            if(bitmap instanceof ImageData){
                return PNGEncoder.encode(new BitmapData(bitmap),72);
            }else if(bitmap instanceof BitmapData){
                return PNGEncoder.encode(bitmap,72);
            }else if(bitmap instanceof ByteArray){
                //return this.jpegEncoder.encodeByteArray(bitmap, width, height, 72);
            }else{
                throw "[encodePNG] Error! unsupported data";
            }

            return null;
        }
        static encodeJPEG(bitmap:ImageData|BitmapData|ByteArray,callback:Function=null):ByteArray{
            if(bitmap instanceof ImageData){
                return this.jpegEncoder.encode(new BitmapData(bitmap),72);
            }else if(bitmap instanceof BitmapData){
                return this.jpegEncoder.encode(bitmap,72);
            }else if(bitmap instanceof ByteArray){
                //return this.jpegEncoder.encodeByteArray(bitmap, width, height, 72);
            }else{
                throw "[encodeJPEG] Error! unsupported data";
            }

            return null;
        }

    }
}