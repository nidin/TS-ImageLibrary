////////////////////////////////////////////////////////////////////////////////
//
//  ADOBE SYSTEMS INCORPORATED
//  Copyright 2007 Adobe Systems Incorporated
//  All Rights Reserved.
//
//  NOTICE: Adobe permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

module nid.encoder
{

    import BitmapData = nid.display.BitmapData;
    import ByteArray = nid.utils.ByteArray;

    /**
     *  The JPEGEncoder class converts raw bitmap images into encoded
     *  images using Joint Photographic Experts Group (JPEG) compression.
     *
     *  For information about the JPEG algorithm, see the document
     *  http://www.opennet.ru/docs/formats/jpeg.txt by Cristi Cuturicu.
     *
     *  @langversion 3.0
     *  @playerversion Flash 9
     *  @playerversion AIR 1.1
     *  @productversion Flex 3
     */
    export class JPEGEncoder
    {

        private DENSITY_UNIT:number = 1;
        private xDENSITY:number = 1;
        private yDENSITY:number = 1;

        //--------------------------------------------------------------------------
        //
        //  Class constants
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         */
        static CONTENT_TYPE:string = "image/jpeg";

        //--------------------------------------------------------------------------
        //
        //  Constructor
        //
        //--------------------------------------------------------------------------

        /**
         *  Constructor.
         *
         *  @param quality A value between 0.0 and 100.0.
         *  The smaller the <code>quality</code> value,
         *  the smaller the file size of the resultant image.
         *  The value does not affect the encoding speed.
         *. Note that even though this value is a number between 0.0 and 100.0,
         *  it does not represent a percentage.
         *  The default value is 50.0.
         *
         *  @langversion 3.0
         *  @playerversion Flash 9
         *  @playerversion AIR 1.1
         *  @productversion Flex 3
         */
        constructor(quality:number = 50.0)
        {
            if (quality <= 0.0)
                quality = 1.0;

            if (quality > 100.0)
                quality = 100.0;

            var sf:number = 0;
            if (quality < 50.0)
                sf = <number>(5000 / quality);
            else
                sf = <number>(200 - quality * 2);

            // Create tables
            this.initHuffmanTbl();
            this.initCategoryNumber();
            this.initQuantTables(sf);
        }

        //--------------------------------------------------------------------------
        //
        //  Constants
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         */
        private std_dc_luminance_nrcodes:Array<number> =
        [ 0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0 ];

        /**
         *  @private
         */
        private std_dc_luminance_values:Array<number> =
        [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];

        /**
         *  @private
         */
        private std_dc_chrominance_nrcodes:Array<number> =
        [ 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ];

        /**
         *  @private
         */
        private std_dc_chrominance_values:Array<number> =
        [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];

        /**
         *  @private
         */
        private std_ac_luminance_nrcodes:Array<number> =
        [ 0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7D ];

        /**
         *  @private
         */
        private std_ac_luminance_values:Array<number> =
        [
            0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
            0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
            0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
            0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
            0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16,
            0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
            0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
            0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
            0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
            0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
            0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
            0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
            0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
            0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
            0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
            0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
            0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4,
            0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
            0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA,
            0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
            0xF9, 0xFA
        ];

        /**
         *  @private
         */
        private std_ac_chrominance_nrcodes:Array<number> =
        [ 0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77 ];

        /**
         *  @private
         */
        private std_ac_chrominance_values:Array<number> =
        [
            0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
            0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
            0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
            0xA1, 0xB1, 0xC1, 0x09, 0x23, 0x33, 0x52, 0xF0,
            0x15, 0x62, 0x72, 0xD1, 0x0A, 0x16, 0x24, 0x34,
            0xE1, 0x25, 0xF1, 0x17, 0x18, 0x19, 0x1A, 0x26,
            0x27, 0x28, 0x29, 0x2A, 0x35, 0x36, 0x37, 0x38,
            0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
            0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
            0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
            0x69, 0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
            0x79, 0x7A, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
            0x88, 0x89, 0x8A, 0x92, 0x93, 0x94, 0x95, 0x96,
            0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5,
            0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4,
            0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3,
            0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2,
            0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA,
            0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9,
            0xEA, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
            0xF9, 0xFA
        ];

        /**
         *  @private
         */
        private ZigZag:Array<number> =
        [
            0,  1,  5,  6, 14, 15, 27, 28,
            2,  4,  7, 13, 16, 26, 29, 42,
            3,  8, 12, 17, 25, 30, 41, 43,
            9, 11, 18, 24, 31, 40, 44, 53,
            10, 19, 23, 32, 39, 45, 52, 54,
            20, 22, 33, 38, 46, 51, 55, 60,
            21, 34, 37, 47, 50, 56, 59, 61,
            35, 36, 48, 49, 57, 58, 62, 63
        ];

        //--------------------------------------------------------------------------
        //
        //  Variables
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         *  Initialized by initHuffmanTbl() in constructor.
         */
        private YDC_HT:Array<BitString>;

        /**
         *  @private
         *  Initialized by initHuffmanTbl() in constructor.
         */
        private UVDC_HT:Array<BitString>;

        /**
         *  @private
         *  Initialized by initHuffmanTbl() in constructor.
         */
        private YAC_HT:Array<BitString>;

        /**
         *  @private
         *  Initialized by initHuffmanTbl() in constructor.
         */
        private UVAC_HT:Array<BitString>;

        /**
         *  @private
         *  Initialized by initCategoryNumber() in constructor.
         */
        private category:Array<number> = new Array(65535);

        /**
         *  @private
         *  Initialized by initCategoryNumber() in constructor.
         */
        private bitcode:Array<BitString> = new Array(65535);

        /**
         *  @private
         *  Initialized by initQuantTables() in constructor.
         */
        private YTable:Array<number> = new Array(64);

        /**
         *  @private
         *  Initialized by initQuantTables() in constructor.
         */
        private UVTable:Array<number> = new Array(64);

        /**
         *  @private
         *  Initialized by initQuantTables() in constructor.
         */
        private fdtbl_Y:Array<number> = new Array(64);

        /**
         *  @private
         *  Initialized by initQuantTables() in constructor.
         */
        private fdtbl_UV:Array<number> = new Array(64);

        /**
         *  @private
         *  The output ByteArray containing the encoded image data.
         */
        private byteout:ByteArray;

        /**
         *  @private
         */
        private bytenew:number = 0;

        /**
         *  @private
         */
        private bytepos:number = 7;

        /**
         *  @private
         */
        private DU:Array<number> = new Array(64);

        /**
         *  @private
         */
        private YDU:Array<number> = new Array(64);

        /**
         *  @private
         */
        private UDU:Array<number> = new Array(64);

        /**
         *  @private
         */
        private VDU:Array<number> = new Array(64);

        //--------------------------------------------------------------------------
        //
        //  Properties
        //
        //--------------------------------------------------------------------------

        //----------------------------------
        //  contentType
        //----------------------------------

        /**
         *  The MIME type for the JPEG encoded image.
         *  The value is <code>"image/jpeg"</code>.
         *
         *  @langversion 3.0
         *  @playerversion Flash 9
         *  @playerversion AIR 1.1
         *  @productversion Flex 3
         */
        get contentType():string
        {
            return JPEGEncoder.CONTENT_TYPE;
        }

        //--------------------------------------------------------------------------
        //
        //  Methods
        //
        //--------------------------------------------------------------------------

        /**
         *  Converts the pixels of BitmapData object
         *  to a JPEG-encoded ByteArray object.
         *
         *  @param bitmapData The input BitmapData object.
         *
         *  @return Returns a ByteArray object containing JPEG-encoded image data.
         *
         *  @langversion 3.0
         *  @playerversion Flash 9
         *  @playerversion AIR 1.1
         *  @productversion Flex 3
         */
        public encode(bitmapData:BitmapData,dpi:number=0):ByteArray
        {
            return this.internalEncode(bitmapData, bitmapData.width, bitmapData.height, true
                /*bitmapData.transparent*/,dpi);
        }

        /**
         *  Converts a ByteArray object containing raw pixels
         *  in 32-bit ARGB (Alpha, Red, Green, Blue) format
         *  to a new JPEG-encoded ByteArray object.
         *  The original ByteArray is left unchanged.
         *  Transparency is not supported; however you still must represent
         *  each pixel as four bytes in ARGB format.
         *
         *  @param byteArray The input ByteArray object containing raw pixels.
         *  This ByteArray should contain
         *  <code>4 * width * height</code> bytes.
         *  Each pixel is represented by 4 bytes, in the order ARGB.
         *  The first four bytes represent the top-left pixel of the image.
         *  The next four bytes represent the pixel to its right, etc.
         *  Each row follows the previous one without any padding.
         *
         *  @param width The width of the input image, in pixels.
         *
         *  @param height The height of the input image, in pixels.
         *
         *  @param transparent If <code>false</code>,
         *  alpha channel information is ignored.
         *
         *  @return Returns a ByteArray object containing JPEG-encoded image data.
         *
         *  @langversion 3.0
         *  @playerversion Flash 9
         *  @playerversion AIR 1.1
         *  @productversion Flex 3
         */
        public encodeByteArray(byteArray:ByteArray, width:number, height:number,
                                        transparent:Boolean = true,dpi:number=0):ByteArray
        {
            return this.internalEncode(byteArray, width, height, transparent,dpi);
        }

        //--------------------------------------------------------------------------
        //
        //  Methods: Initialization
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         *  Initializes the Huffman tables YDC_HT, UVDC_HT, YAC_HT, and UVAC_HT.
         */
        private initHuffmanTbl():void
        {
            this.YDC_HT = this.computeHuffmanTbl(this.std_dc_luminance_nrcodes,
                this.std_dc_luminance_values);

            this.UVDC_HT = this.computeHuffmanTbl(this.std_dc_chrominance_nrcodes,
                this.std_dc_chrominance_values);

            this.YAC_HT = this.computeHuffmanTbl(this.std_ac_luminance_nrcodes,
                this.std_ac_luminance_values);

            this.UVAC_HT = this.computeHuffmanTbl(this.std_ac_chrominance_nrcodes,
                this.std_ac_chrominance_values);
        }

        /**
         *  @private
         */
        private computeHuffmanTbl(nrcodes:Array<number>, std_table:Array<number>):Array<BitString>
        {
            var codevalue:number = 0;
            var pos_in_table:number = 0;

            var HT:Array<BitString> = [];

            for (var k:number = 1; k <= 16; k++)
            {
                for (var j:number = 1; j <= nrcodes[k]; j++)
                {
                    HT[std_table[pos_in_table]] = new BitString();
                    HT[std_table[pos_in_table]].val = codevalue;
                    HT[std_table[pos_in_table]].len = k;

                    pos_in_table++;
                    codevalue++;
                }

                codevalue *= 2;
            }

            return HT;
        }

        /**
         *  @private
         *  Initializes the category and bitcode arrays.
         */
        private initCategoryNumber():void
        {
            var nr:number;

            var nrlower:number = 1;
            var nrupper:number = 2;

            for (var cat:number = 1; cat <= 15; cat++)
            {
                // Positive numbers
                for (nr = nrlower; nr < nrupper; nr++)
                {
                    this.category[32767 + nr] = cat;

                    this.bitcode[32767 + nr] = new BitString();
                    this.bitcode[32767 + nr].len = cat;
                    this.bitcode[32767 + nr].val = nr;
                }

                // Negative numbers
                for (nr = -(nrupper - 1); nr <= -nrlower; nr++)
                {
                    this.category[32767 + nr] = cat;

                    this.bitcode[32767 + nr] = new BitString();
                    this.bitcode[32767 + nr].len = cat;
                    this.bitcode[32767 + nr].val = nrupper - 1 + nr;
                }

                nrlower <<= 1;
                nrupper <<= 1;
            }
        }

        /**
         *  @private
         *  Initializes YTable, UVTable, fdtbl_Y, and fdtbl_UV.
         */
        private initQuantTables(sf:number):void
        {
            var i:number = 0;
            var t:number;

            var YQT:Array<number> =
                [
                    16, 11, 10, 16,  24,  40,  51,  61,
                    12, 12, 14, 19,  26,  58,  60,  55,
                    14, 13, 16, 24,  40,  57,  69,  56,
                    14, 17, 22, 29,  51,  87,  80,  62,
                    18, 22, 37, 56,  68, 109, 103,  77,
                    24, 35, 55, 64,  81, 104, 113,  92,
                    49, 64, 78, 87, 103, 121, 120, 101,
                    72, 92, 95, 98, 112, 100, 103,  99
                ];

            for (i = 0; i < 64; i++)
            {
                t = Math.floor((YQT[i] * sf + 50)/100);
                if (t < 1)
                    t = 1;
                else if (t > 255)
                    t = 255;
                this.YTable[this.ZigZag[i]] = t;
            }

            var UVQT:Array<number> =
                [
                    17, 18, 24, 47, 99, 99, 99, 99,
                    18, 21, 26, 66, 99, 99, 99, 99,
                    24, 26, 56, 99, 99, 99, 99, 99,
                    47, 66, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99
                ];

            for (i = 0; i < 64; i++)
            {
                t = Math.floor((UVQT[i] * sf + 50) / 100);
                if (t < 1)
                    t = 1;
                else if (t > 255)
                    t = 255;
                this.UVTable[this.ZigZag[i]] = t;
            }

            var aasf:Array<number> =
                [
                    1.0, 1.387039845, 1.306562965, 1.175875602,
                    1.0, 0.785694958, 0.541196100, 0.275899379
                ];

            i = 0;
            for (var row:number = 0; row < 8; row++)
            {
                for (var col:number = 0; col < 8; col++)
                {
                    this.fdtbl_Y[i] =
                        (1.0 / (this.YTable [this.ZigZag[i]] * aasf[row] * aasf[col] * 8.0));

                    this.fdtbl_UV[i] =
                        (1.0 / (this.UVTable[this.ZigZag[i]] * aasf[row] * aasf[col] * 8.0));

                    i++;
                }
            }
        }

        //--------------------------------------------------------------------------
        //
        //  Methods: Core processing
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         */
        private internalEncode(source:Object, width:number, height:number,
                                        transparent:Boolean = true,dpi:number=0):ByteArray
        {
            // The source is either a BitmapData or a ByteArray.
            var sourceBitmapData:BitmapData = <BitmapData>source;
            var sourceByteArray:ByteArray = <ByteArray>source;

            // Initialize bit writer
            this.byteout = new ByteArray(new ArrayBuffer(width*height*4));
            this.bytenew = 0;
            this.bytepos = 7;

            this.xDENSITY = dpi;
            this.yDENSITY = dpi;

            // Add JPEG headers
            this.writeWord(0xFFD8); // SOI
            this.writeAPP0(dpi);
            this.writeDQT();
            this.writeSOF0(width, height);
            this.writeDHT();
            this.writeSOS();

            // Encode 8x8 macroblocks
            var DCY:number = 0;
            var DCU:number = 0;
            var DCV:number = 0;
            this.bytenew = 0;
            this.bytepos = 7;

            for (var ypos:number = 0; ypos < height; ypos += 8)
            {
                for (var xpos:number = 0; xpos < width; xpos += 8)
                {
                    this.RGB2YUV(sourceBitmapData, sourceByteArray, xpos, ypos, width, height);

                    DCY = this.processDU(this.YDU, this.fdtbl_Y, DCY, this.YDC_HT, this.YAC_HT);
                    DCU = this.processDU(this.UDU, this.fdtbl_UV, DCU, this.UVDC_HT, this.UVAC_HT);
                    DCV = this.processDU(this.VDU, this.fdtbl_UV, DCV, this.UVDC_HT, this.UVAC_HT);
                }
            }

            // Do the bit alignment of the EOI marker
            if (this.bytepos >= 0)
            {
                var fillbits:BitString = new BitString();
                fillbits.len = this.bytepos + 1;
                fillbits.val = (1 << (this.bytepos + 1)) - 1;
                this.writeBits(fillbits);
            }

            // Add EOI
            this.writeWord(0xFFD9);

            return this.byteout;
        }

        /**
         *  @private
         */
        private RGB2YUV(sourceBitmapData:BitmapData,
                                 sourceByteArray:ByteArray,
                                 xpos:number, ypos:number,
                                 width:number, height:number):void
        {
            var k:number = 0; // index into 64-element block arrays

            for (var j:number = 0; j < 8; j++)
            {
                var y:number = ypos + j;
                if (y >= height)
                    y = height - 1;

                for (var i:number = 0; i < 8; i++)
                {
                    var x:number = xpos + i;
                    if (x >= width)
                        x = width - 1;

                    var pixel:number; //uint;
                    if (sourceBitmapData)
                    {
                        pixel = sourceBitmapData.getPixel32(x, y);
                    }
                    else
                    {
                        sourceByteArray.position = 4 * (y * width + x);
                        pixel = sourceByteArray.readUnsignedInt();
                    }

                    var r:number = Number((pixel >> 16) & 0xFF);
                    var g:number = Number((pixel >> 8) & 0xFF);
                    var b:number = Number(pixel & 0xFF);

                    this.YDU[k] =  0.29900 * r + 0.58700 * g + 0.11400 * b - 128.0;
                    this.UDU[k] = -0.16874 * r - 0.33126 * g + 0.50000 * b;
                    this.VDU[k] =  0.50000 * r - 0.41869 * g - 0.08131 * b;

                    k++;
                }
            }
        }

        /**
         *  @private
         */
        private processDU(CDU:Array<number>, fdtbl:Array<number>, DC:number,
                                   HTDC:Array<BitString>, HTAC:Array<BitString>):number
        {
            var EOB:BitString = HTAC[0x00];
            var M16zeroes:BitString = HTAC[0xF0];
            var i:number;

            var DU_DCT:Array<number> = this.fDCTQuant(CDU, fdtbl);

            // ZigZag reorder
            for (i = 0; i < 64; i++)
            {
                this.DU[this.ZigZag[i]] = DU_DCT[i];
            }

            var Diff:number = this.DU[0] - DC;
            DC = this.DU[0];

            // Encode DC
            if (Diff == 0)
            {
                this.writeBits(HTDC[0]); // Diff might be 0
            }
            else
            {
                this.writeBits(HTDC[this.category[32767 + Diff]]);
                this.writeBits(this.bitcode[32767 + Diff]);
            }

            // Encode ACs
            var end0pos:number = 63;
            for (; (end0pos > 0) && (this.DU[end0pos] == 0); end0pos--)
            {
            };

            // end0pos = first element in reverse order != 0
            if (end0pos == 0)
            {
                this.writeBits(EOB);
                return DC;
            }

            i = 1;
            while (i <= end0pos)
            {
                var startpos:number = i;
                for (; (this.DU[i] == 0) && (i <= end0pos); i++)
                {
                }
                var nrzeroes:number = i - startpos;

                if (nrzeroes >= 16)
                {
                    for (var nrmarker:number = 1; nrmarker <= nrzeroes / 16; nrmarker++)
                    {
                        this.writeBits(M16zeroes);
                    }
                    nrzeroes = <number>(nrzeroes & 0xF);
                }

                this.writeBits(HTAC[nrzeroes * 16 + this.category[32767 + this.DU[i]]]);
                this.writeBits(this.bitcode[32767 + this.DU[i]]);

                i++;
            }

            if (end0pos != 63)
                this.writeBits(EOB);

            return DC;
        }

        /**
         *  @private
         */
        private fDCTQuant(data:Array<number>, fdtbl:Array<number>):Array<number>
        {
            // Pass 1: process rows.
            var dataOff:number = 0;
            var i:number;
            for (i = 0; i < 8; i++)
            {
                var tmp0:number = data[dataOff + 0] + data[dataOff + 7];
                var tmp7:number = data[dataOff + 0] - data[dataOff + 7];
                var tmp1:number = data[dataOff + 1] + data[dataOff + 6];
                var tmp6:number = data[dataOff + 1] - data[dataOff + 6];
                var tmp2:number = data[dataOff + 2] + data[dataOff + 5];
                var tmp5:number = data[dataOff + 2] - data[dataOff + 5];
                var tmp3:number = data[dataOff + 3] + data[dataOff + 4];
                var tmp4:number = data[dataOff + 3] - data[dataOff + 4];

                // Even part
                var tmp10:number = tmp0 + tmp3;	// phase 2
                var tmp13:number = tmp0 - tmp3;
                var tmp11:number = tmp1 + tmp2;
                var tmp12:number = tmp1 - tmp2;

                data[dataOff + 0] = tmp10 + tmp11; // phase 3
                data[dataOff + 4] = tmp10 - tmp11;

                var z1:number = (tmp12 + tmp13) * 0.707106781; // c4
                data[dataOff + 2] = tmp13 + z1; // phase 5
                data[dataOff + 6] = tmp13 - z1;

                // Odd part
                tmp10 = tmp4 + tmp5; // phase 2
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;

                // The rotator is modified from fig 4-8 to avoid extra negations.
                var z5:number = (tmp10 - tmp12) * 0.382683433; // c6
                var z2:number = 0.541196100 * tmp10 + z5; // c2 - c6
                var z4:number = 1.306562965 * tmp12 + z5; // c2 + c6
                var z3:number = tmp11 * 0.707106781; // c4

                var z11:number = tmp7 + z3; // phase 5
                var z13:number = tmp7 - z3;

                data[dataOff + 5] = z13 + z2; // phase 6
                data[dataOff + 3] = z13 - z2;
                data[dataOff + 1] = z11 + z4;
                data[dataOff + 7] = z11 - z4;

                dataOff += 8; // advance pointer to next row
            }

            // Pass 2: process columns.
            dataOff = 0;
            for (i = 0; i < 8; i++)
            {
                tmp0 = data[dataOff +  0] + data[dataOff + 56];
                tmp7 = data[dataOff +  0] - data[dataOff + 56];
                tmp1 = data[dataOff +  8] + data[dataOff + 48];
                tmp6 = data[dataOff +  8] - data[dataOff + 48];
                tmp2 = data[dataOff + 16] + data[dataOff + 40];
                tmp5 = data[dataOff + 16] - data[dataOff + 40];
                tmp3 = data[dataOff + 24] + data[dataOff + 32];
                tmp4 = data[dataOff + 24] - data[dataOff + 32];

                // Even par
                tmp10 = tmp0 + tmp3; // phase 2
                tmp13 = tmp0 - tmp3;
                tmp11 = tmp1 + tmp2;
                tmp12 = tmp1 - tmp2;

                data[dataOff +  0] = tmp10 + tmp11; // phase 3
                data[dataOff + 32] = tmp10 - tmp11;

                z1 = (tmp12 + tmp13) * 0.707106781; // c4
                data[dataOff + 16] = tmp13 + z1; // phase 5
                data[dataOff + 48] = tmp13 - z1;

                // Odd part
                tmp10 = tmp4 + tmp5; // phase 2
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;

                // The rotator is modified from fig 4-8 to avoid extra negations.
                z5 = (tmp10 - tmp12) * 0.382683433; // c6
                z2 = 0.541196100 * tmp10 + z5; // c2 - c6
                z4 = 1.306562965 * tmp12 + z5; // c2 + c6
                z3 = tmp11 * 0.707106781; // c4

                z11 = tmp7 + z3; // phase 5 */
                z13 = tmp7 - z3;

                data[dataOff + 40] = z13 + z2; // phase 6
                data[dataOff + 24] = z13 - z2;
                data[dataOff +  8] = z11 + z4;
                data[dataOff + 56] = z11 - z4;

                dataOff++; // advance pointer to next column
            }

            // Quantize/descale the coefficients
            for (i = 0; i < 64; i++)
            {
                // Apply the quantization and scaling factor
                // and round to nearest integer
                data[i] = Math.round((data[i] * fdtbl[i]));
            }

            return data;
        }

        //--------------------------------------------------------------------------
        //
        //  Methods: Output
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         */
        private writeBits(bs:BitString):void
        {
            var value:number = bs.val;
            var posval:number = bs.len - 1;
            while (posval >= 0)
            {
                if (value & (1 << posval) )//uint
                {
                    this.bytenew |= (1 << this.bytepos);//uint
                }
                posval--;
                this.bytepos--;
                if (this.bytepos < 0)
                {
                    if (this.bytenew == 0xFF)
                    {
                        this.writeByte(0xFF);
                        this.writeByte(0);
                    }
                    else
                    {
                        this.writeByte(this.bytenew);
                    }
                    this.bytepos = 7;
                    this.bytenew = 0;
                }
            }
        }

        /**
         *  @private
         */
        private writeByte(value:number):void
        {
            this.byteout.writeByte(value);
        }

        /**
         *  @private
         */
        private writeWord(value:number):void
        {
            this.writeByte((value >> 8) & 0xFF);
            this.writeByte(value & 0xFF);
        }

        /**
         *  @private
         */
        private writeAPP0(dpi:number):void
        {
            this.writeWord(0xFFE0);	// marker
            this.writeWord(16);		// length
            this.writeByte(0x4A);	// J
            this.writeByte(0x46);	// F
            this.writeByte(0x49);	// I
            this.writeByte(0x46);	// F
            this.writeByte(0);		// = "JFIF",'\0'
            this.writeByte(1);		// versionhi
            this.writeByte(1);		// versionlo
            this.writeByte(dpi==0?0:this.DENSITY_UNIT);		// xyunits
            this.writeWord(dpi==0?1:this.xDENSITY);		// xdensity
            this.writeWord(dpi==0?1:this.yDENSITY);		// ydensity
            this.writeByte(0);		// thumbnwidth
            this.writeByte(0);		// thumbnheight
        }

        /**
         *  @private
         */
        private writeDQT():void
        {
            this.writeWord(0xFFDB);	// marker
            this.writeWord(132);     // length
            this.writeByte(0);
            var i:number;

            for (i = 0; i < 64; i++)
            {
                this.writeByte(this.YTable[i]);
            }

            this.writeByte(1);

            for (i = 0; i < 64; i++)
            {
                this.writeByte(this.UVTable[i]);
            }
        }

        /**
         *  @private
         */
        private writeSOF0(width:number, height:number):void
        {
            this.writeWord(0xFFC0);	// marker
            this.writeWord(17);		// length, truecolor YUV JPG
            this.writeByte(8);		// precision
            this.writeWord(height);
            this.writeWord(width);
            this.writeByte(3);		// nrofcomponents
            this.writeByte(1);		// IdY
            this.writeByte(0x11);	// HVY
            this.writeByte(0);		// QTY
            this.writeByte(2);		// IdU
            this.writeByte(0x11);	// HVU
            this.writeByte(1);		// QTU
            this.writeByte(3);		// IdV
            this.writeByte(0x11);	// HVV
            this.writeByte(1);		// QTV
        }

        /**
         *  @private
         */
        private writeDHT():void
        {
            var i:number;

            this.writeWord(0xFFC4); // marker
            this.writeWord(0x01A2); // length

            this.writeByte(0); // HTYDCinfo
            for (i = 0; i < 16; i++)
            {
                this.writeByte(this.std_dc_luminance_nrcodes[i + 1]);
            }
            for (i = 0; i <= 11; i++)
            {
                this.writeByte(this.std_dc_luminance_values[i]);
            }

            this.writeByte(0x10); // HTYACinfo
            for (i = 0; i < 16; i++)
            {
                this.writeByte(this.std_ac_luminance_nrcodes[i + 1]);
            }
            for (i = 0; i <= 161; i++)
            {
                this.writeByte(this.std_ac_luminance_values[i]);
            }

            this.writeByte(1); // HTUDCinfo
            for (i = 0; i < 16; i++)
            {
                this.writeByte(this.std_dc_chrominance_nrcodes[i + 1]);
            }
            for (i = 0; i <= 11; i++)
            {
                this.writeByte(this.std_dc_chrominance_values[i]);
            }

            this.writeByte(0x11); // HTUACinfo
            for (i = 0; i < 16; i++)
            {
                this.writeByte(this.std_ac_chrominance_nrcodes[i + 1]);
            }
            for (i = 0; i <= 161; i++)
            {
                this.writeByte(this.std_ac_chrominance_values[i]);
            }
        }

        /**
         *  @private
         */
        private writeSOS():void
        {
            this.writeWord(0xFFDA);	// marker
            this.writeWord(12);		// length
            this.writeByte(3);		// nrofcomponents
            this.writeByte(1);		// IdY
            this.writeByte(0);		// HTY
            this.writeByte(2);		// IdU
            this.writeByte(0x11);	// HTU
            this.writeByte(3);		// IdV
            this.writeByte(0x11);	// HTV
            this.writeByte(0);		// Ss
            this.writeByte(0x3f);	// Se
            this.writeByte(0);		// Bf
        }
    }

}

class BitString
{
    /**
     *  Constructor.
     *
     *  @langversion 3.0
     *  @playerversion Flash 9
     *  @playerversion AIR 1.1
     *  @productversion Flex 3
     */
    public BitString()
    {

    }

    /**
     *  @private
     */
    public len:number = 0;

    /**
     *  @private
     */
    public val:number = 0;
}