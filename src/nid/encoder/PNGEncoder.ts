module nid.encoder
{

	import BitmapData = nid.display.BitmapData;
	import ByteArray = nid.utils.ByteArray;

	export class PNGEncoder
	{

		static CONTENT_TYPE:String = "image/png";

		static crcTable:Array<number>;

		static get contentType():String
		{
			return PNGEncoder.CONTENT_TYPE;
		}

		static encode(bitmapData:BitmapData,dpi:number=0):ByteArray
		{
			this.initializeCRCTable();
			return this.internalEncode(bitmapData, bitmapData.width, bitmapData.height,bitmapData.transparent, dpi);
		}

		static encodeByteArray(byteArray:ByteArray, width:number, height:number, transparent:Boolean = true,dpi:number=0):ByteArray
		{
			this.initializeCRCTable();
			return this.internalEncode(byteArray, width, height, transparent,dpi);
		}

		static initializeCRCTable():void
		{
			if (this.crcTable == null)
			{
				this.crcTable = [];
				for (var n:number = 0; n < 256; n++)
				{
					var c:number = n;
					for (var k:number = 0; k < 8; k++)
					{
						if (c & 1)
							c = ((0xedb88320) ^ (c >>> 1));//uint
						else
							c = (c >>> 1);//uint
					 }
					this.crcTable[n] = c;
				}
			}
		}

		static internalEncode(source:any, width:number, height:number, transparent:Boolean, dpi:number):ByteArray
		{
			// The source is either a BitmapData or a ByteArray.
			var sourceBitmapData:BitmapData = <BitmapData>source;
			var sourceByteArray:ByteArray = <ByteArray>source;
			
			if (sourceByteArray)
				sourceByteArray.position = 0;
			
			// Create output byte array
			var png:ByteArray = new ByteArray(new ArrayBuffer(width*height*4));

			// Write PNG signature
			png.writeUnsignedInt(0x89504E47);
			png.writeUnsignedInt(0x0D0A1A0A);

			// Build IHDR chunk
			var IHDR:ByteArray = new ByteArray(new ArrayBuffer(13));
			IHDR.writeInt(width);
			IHDR.writeInt(height);
			IHDR.writeByte(8); // bit depth per channel
			IHDR.writeByte(6); // color type: RGBA
			IHDR.writeByte(0); // compression method
			IHDR.writeByte(0); // filter method
			IHDR.writeByte(0); // interlace method
			this.writeChunk(png, 0x49484452, IHDR);
			if (dpi > 0)
			{
				var pHYs:ByteArray = new ByteArray(new ArrayBuffer(9));
				dpi = dpi / 0.0254;
				pHYs.writeUnsignedInt(dpi);//Pixels per unit, X axis
				pHYs.writeUnsignedInt(dpi);//Pixels per unit, Y axis
				pHYs.writeByte(1);
				this.writeChunk(png, 0x70485973, pHYs);
			}
			
			//70 48 59 73 pHYs Physical pixel dimensions
			
			// Build IDAT chunk
			var IDAT:ByteArray = new ByteArray();
			for (var y:number = 0; y < height; y++)
			{
				IDAT.writeByte(0); // no filter

				var x:number;
				var pixel:number;
				
				if (!transparent)
				{
					for (x = 0; x < width; x++)
					{
						if (sourceBitmapData)
							pixel = sourceBitmapData.getPixel(x, y);
						else
							pixel = sourceByteArray.readUnsignedInt();
						
						IDAT.writeUnsignedInt((((pixel & 0xFFFFFF) << 8) | 0xFF));//uint
					}
				}
				else
				{
					for (x = 0; x < width; x++)
					{
						if (sourceBitmapData)
							pixel = sourceBitmapData.getPixel32(x, y);
						else
							pixel = sourceByteArray.readUnsignedInt();
	 
						IDAT.writeUnsignedInt((((pixel & 0xFFFFFF) << 8) | (pixel >>> 24)));//uint
					}
				}
			}
			IDAT.compress();
			this.writeChunk(png, 0x49444154, IDAT);

			// Build IEND chunk
			this.writeChunk(png, 0x49454E44, null);

			// return PNG
			png.position = 0;
			return png;
		}

		static writeChunk(png:ByteArray, type:number, data:ByteArray):void
		{
			// Write length of data.
			var len:number = 0;
			if (data)
				len = data.length;
			png.writeUnsignedInt(len);
			
			// Write chunk type.
			var typePos:number = png.position;
			png.writeUnsignedInt(type);
			
			// Write data.
			if (data)
				png.writeBytes(data);

			// Write CRC of chunk type and data.
			var crcPos:number = png.position;
			png.position = typePos;
			var crc:number = 0xFFFFFFFF;
			for (var i:number = typePos; i < crcPos; i++)
			{
				crc = (this.crcTable[(crc ^ png.readUnsignedByte()) & (0xFF)] ^ (crc >>> 8));//uint
			}
			crc = (crc ^ (0xFFFFFFFF));//uint
			png.position = crcPos;
			png.writeUnsignedInt(crc);
		}
	}
}