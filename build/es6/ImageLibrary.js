/**
 * JavaScript UInt64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
var ctypes;
(function (ctypes) {
    class UInt64 {
        constructor(low = 0, high = 0) {
            this.low = low;
            this.high = high;
        }
        value() {
            //this._value = (this.low | (this.high << 32));
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        }
    }
    ctypes.UInt64 = UInt64;
})(ctypes || (ctypes = {}));
/**
 * JavaScript Int64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
var ctypes;
(function (ctypes) {
    class Int64 {
        constructor(low, high) {
            this.low = low;
            this.high = high;
        }
        value() {
            //this._value = (this.low | (this.high << 32));
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        }
    }
    ctypes.Int64 = Int64;
})(ctypes || (ctypes = {}));
///<reference path="./ctypes/ctypes.d.ts" />
/**
* JavaScript ByteArrayBase
* version : 0.2
* @author Nidin Vinayakan | nidinthb@gmail.com
*
* ActionScript3 ByteArrayBase implementation in JavaScript
* limitation : size of ByteArrayBase cannot be changed
*
*/
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        var UInt64 = ctypes.UInt64;
        var Int64 = ctypes.Int64;
        class ByteArrayBase {
            constructor(buffer, offset = 0, length = 0) {
                this.BUFFER_EXT_SIZE = 1024; //Buffer expansion size
                this.array = null;
                this.EOF_byte = -1;
                this.EOF_code_point = -1;
                if (buffer == undefined) {
                    buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                    this.write_position = 0;
                }
                else if (buffer == null) {
                    this.write_position = 0;
                }
                else {
                    this.write_position = length > 0 ? length : buffer.byteLength;
                }
                if (buffer) {
                    this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
                }
                this._position = 0;
                this.endian = ByteArrayBase.BIG_ENDIAN;
            }
            // getter setter
            get buffer() {
                return this.data.buffer;
            }
            set buffer(value) {
                this.data = new DataView(value);
            }
            get dataView() {
                return this.data;
            }
            set dataView(value) {
                this.data = value;
                this.write_position = value.byteLength;
            }
            get phyPosition() {
                return this._position + this.data.byteOffset;
            }
            get bufferOffset() {
                return this.data.byteOffset;
            }
            get position() {
                return this._position;
            }
            set position(value) {
                if (this._position < value) {
                    if (!this.validate(this._position - value)) {
                        return;
                    }
                }
                this._position = value;
                this.write_position = value > this.write_position ? value : this.write_position;
            }
            get length() {
                return this.write_position;
            }
            set length(value) {
                this.validateBuffer(value);
            }
            get bytesAvailable() {
                return this.data.byteLength - this._position;
            }
            //end
            clear() {
                this._position = 0;
            }
            getArray() {
                if (this.array == null) {
                    this.array = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
                }
                return this.array;
            }
            setArray(array) {
                this.array = array;
                this.setBuffer(array.buffer, array.byteOffset, array.byteLength);
            }
            setBuffer(buffer, offset = 0, length = 0) {
                if (buffer) {
                    this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
                    this.write_position = length > 0 ? length : buffer.byteLength;
                }
                else {
                    this.write_position = 0;
                }
                this._position = 0;
            }
            /**
             * Reads a Boolean value from the byte stream. A single byte is read,
             * and true is returned if the byte is nonzero,
             * false otherwise.
             * @return	Returns true if the byte is nonzero, false otherwise.
            */
            readBoolean() {
                if (!this.validate(ByteArrayBase.SIZE_OF_BOOLEAN))
                    return null;
                return this.data.getUint8(this.position++) != 0;
            }
            /**
             * Reads a signed byte from the byte stream.
             * The returned value is in the range -128 to 127.
             * @return	An integer between -128 and 127.
             */
            readByte() {
                if (!this.validate(ByteArrayBase.SIZE_OF_INT8))
                    return null;
                return this.data.getInt8(this.position++);
            }
            /**
             * Reads the number of data bytes, specified by the length parameter, from the byte stream.
             * The bytes are read into the ByteArrayBase object specified by the bytes parameter,
             * and the bytes are written into the destination ByteArrayBase starting at the _position specified by offset.
             * @param	bytes	The ByteArrayBase object to read data into.
             * @param	offset	The offset (_position) in bytes at which the read data should be written.
             * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
             */
            readBytes(_bytes = null, offset = 0, length = 0, createNewBuffer = false) {
                if (length == 0) {
                    length = this.bytesAvailable;
                }
                else if (!this.validate(length))
                    return null;
                if (createNewBuffer) {
                    _bytes = _bytes == null ? new ByteArrayBase(new ArrayBuffer(length)) : _bytes;
                    //This method is expensive
                    for (var i = 0; i < length; i++) {
                        _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
                    }
                }
                else {
                    //Offset argument ignored
                    _bytes = _bytes == null ? new ByteArrayBase(null) : _bytes;
                    _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
                    this.position += length;
                }
                return _bytes;
            }
            /**
             * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
             * @return	A double-precision (64-bit) floating-point number.
             */
            readDouble() {
                if (!this.validate(ByteArrayBase.SIZE_OF_FLOAT64))
                    return null;
                var value = this.data.getFloat64(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT64;
                return value;
            }
            /**
             * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
             * @return	A single-precision (32-bit) floating-point number.
             */
            readFloat() {
                if (!this.validate(ByteArrayBase.SIZE_OF_FLOAT32))
                    return null;
                var value = this.data.getFloat32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT32;
                return value;
            }
            /**
             * Reads a signed 32-bit integer from the byte stream.
             *
             *   The returned value is in the range -2147483648 to 2147483647.
             * @return	A 32-bit signed integer between -2147483648 and 2147483647.
             */
            readInt() {
                if (!this.validate(ByteArrayBase.SIZE_OF_INT32))
                    return null;
                var value = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT32;
                return value;
            }
            /**
             * Reads a signed 64-bit integer from the byte stream.
             *
             *   The returned value is in the range −(2^63) to 2^63 − 1
             * @return	A 64-bit signed integer between −(2^63) to 2^63 − 1
             */
            readInt64() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
                    return null;
                var low = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT32;
                var high = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT32;
                return new Int64(low, high);
            }
            /**
             * Reads a multibyte string of specified length from the byte stream using the
             * specified character set.
             * @param	length	The number of bytes from the byte stream to read.
             * @param	charSet	The string denoting the character set to use to interpret the bytes.
             *   Possible character set strings include "shift-jis", "cn-gb",
             *   "iso-8859-1", and others.
             *   For a complete list, see Supported Character Sets.
             *   Note: If the value for the charSet parameter
             *   is not recognized by the current system, the application uses the system's default
             *   code page as the character set. For example, a value for the charSet parameter,
             *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
             *   1 might work on your development system, but not on another system.
             *   On the other system, the application will use the system's default code page.
             * @return	UTF-8 encoded string.
             */
            readMultiByte(length, charSet) {
                if (!this.validate(length))
                    return null;
                return "";
            }
            /**
             * Reads a signed 16-bit integer from the byte stream.
             *
             *   The returned value is in the range -32768 to 32767.
             * @return	A 16-bit signed integer between -32768 and 32767.
             */
            readShort() {
                if (!this.validate(ByteArrayBase.SIZE_OF_INT16))
                    return null;
                var value = this.data.getInt16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT16;
                return value;
            }
            /**
             * Reads an unsigned byte from the byte stream.
             *
             *   The returned value is in the range 0 to 255.
             * @return	A 32-bit unsigned integer between 0 and 255.
             */
            readUnsignedByte() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT8))
                    return null;
                return this.data.getUint8(this.position++);
            }
            /**
             * Reads an unsigned 32-bit integer from the byte stream.
             *
             *   The returned value is in the range 0 to 4294967295.
             * @return	A 32-bit unsigned integer between 0 and 4294967295.
             */
            readUnsignedInt() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
                    return null;
                var value = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT32;
                return value;
            }
            /**
             * Reads a variable sized unsigned integer (VX -> 16-bit or 32-bit) from the byte stream.
             *
             *   A VX is written as a variable length 2- or 4-byte element. If the index value is less than 65,280 (0xFF00),
             *   then the index is written as an unsigned two-byte integer. Otherwise the index is written as an unsigned
             *   four byte integer with bits 24-31 set. When reading an index, if the first byte encountered is 255 (0xFF),
             *   then the four-byte form is being used and the first byte should be discarded or masked out.
             *
             *   The returned value is in the range  0 to 65279 or 0 to 2147483647.
             * @return	A VX 16-bit or 32-bit unsigned integer between 0 to 65279 or 0 and 2147483647.
             */
            readVariableSizedUnsignedInt() {
                var value;
                var c = this.readUnsignedByte();
                if (c != 0xFF) {
                    value = c << 8;
                    c = this.readUnsignedByte();
                    value |= c;
                }
                else {
                    c = this.readUnsignedByte();
                    value = c << 16;
                    c = this.readUnsignedByte();
                    value |= c << 8;
                    c = this.readUnsignedByte();
                    value |= c;
                }
                return value;
            }
            /**
             * Fast read for WebGL since only Uint16 numbers are expected
             */
            readU16VX() {
                return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
            }
            /**
             * Reads an unsigned 64-bit integer from the byte stream.
             *
             *   The returned value is in the range 0 to 2^64 − 1.
             * @return	A 64-bit unsigned integer between 0 and 2^64 − 1
             */
            readUnsignedInt64() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
                    return null;
                var low = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT32;
                var high = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT32;
                return new UInt64(low, high);
            }
            /**
             * Reads an unsigned 16-bit integer from the byte stream.
             *
             *   The returned value is in the range 0 to 65535.
             * @return	A 16-bit unsigned integer between 0 and 65535.
             */
            readUnsignedShort() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT16))
                    return null;
                var value = this.data.getUint16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT16;
                return value;
            }
            /**
             * Reads a UTF-8 string from the byte stream.  The string
             * is assumed to be prefixed with an unsigned short indicating
             * the length in bytes.
             * @return	UTF-8 encoded  string.
             */
            readUTF() {
                if (!this.validate(ByteArrayBase.SIZE_OF_UINT16))
                    return null;
                var length = this.data.getUint16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT16;
                if (length > 0) {
                    return this.readUTFBytes(length);
                }
                else {
                    return "";
                }
            }
            /**
             * Reads a sequence of UTF-8 bytes specified by the length
             * parameter from the byte stream and returns a string.
             * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
             * @return	A string composed of the UTF-8 bytes of the specified length.
             */
            readUTFBytes(length) {
                if (!this.validate(length))
                    return null;
                var _bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += length;
                /*var _bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    _bytes[i] = this.data.getUint8(this.position++);
                }*/
                return this.decodeUTF8(_bytes);
            }
            readStandardString(length) {
                if (!this.validate(length))
                    return null;
                var str = "";
                for (var i = 0; i < length; i++) {
                    str += String.fromCharCode(this.data.getUint8(this.position++));
                }
                return str;
            }
            readStringTillNull(keepEvenByte = true) {
                var str = "";
                var num = 0;
                while (this.bytesAvailable > 0) {
                    var _byte = this.data.getUint8(this.position++);
                    num++;
                    if (_byte != 0) {
                        str += String.fromCharCode(_byte);
                    }
                    else {
                        if (keepEvenByte && num % 2 != 0) {
                            this.position++;
                        }
                        break;
                    }
                }
                return str;
            }
            /**
             * Writes a Boolean value. A single byte is written according to the value parameter,
             * either 1 if true or 0 if false.
             * @param	value	A Boolean value determining which byte is written. If the parameter is true,
             *   the method writes a 1; if false, the method writes a 0.
             */
            writeBoolean(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_BOOLEAN);
                this.data.setUint8(this.position++, value ? 1 : 0);
            }
            /**
             * Writes a byte to the byte stream.
             * The low 8 bits of the
             * parameter are used. The high 24 bits are ignored.
             * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
             */
            writeByte(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_INT8);
                this.data.setInt8(this.position++, value);
            }
            writeUnsignedByte(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_UINT8);
                this.data.setUint8(this.position++, value);
            }
            /**
             * Writes a sequence of length bytes from the
             * specified byte array, bytes,
             * starting offset(zero-based index) bytes
             * into the byte stream.
             *
             *   If the length parameter is omitted, the default
             * length of 0 is used; the method writes the entire buffer starting at
             * offset.
             * If the offset parameter is also omitted, the entire buffer is
             * written. If offset or length
             * is out of range, they are clamped to the beginning and end
             * of the bytes array.
             * @param	bytes	The ByteArrayBase object.
             * @param	offset	A zero-based index indicating the _position into the array to begin writing.
             * @param	length	An unsigned integer indicating how far into the buffer to write.
             */
            writeBytes(_bytes, offset = 0, length = 0) {
                this.validateBuffer(length);
                var tmp_data = new DataView(_bytes.buffer);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setUint8(this.position++, tmp_data.getUint8(i));
                }
            }
            /**
             * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
             * @param	value	A double-precision (64-bit) floating-point number.
             */
            writeDouble(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_FLOAT64);
                this.data.setFloat64(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT64;
            }
            /**
             * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
             * @param	value	A single-precision (32-bit) floating-point number.
            */
            writeFloat(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_FLOAT32);
                this.data.setFloat32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT32;
            }
            /**
             * Writes a 32-bit signed integer to the byte stream.
             * @param	value	An integer to write to the byte stream.
            */
            writeInt(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_INT32);
                this.data.setInt32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT32;
            }
            /**
             * Writes a multibyte string to the byte stream using the specified character set.
             * @param	value	The string value to be written.
             * @param	charSet	The string denoting the character set to use. Possible character set strings
             *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
             *   For a complete list, see Supported Character Sets.
             */
            writeMultiByte(value, charSet) {
            }
            /**
             * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
             * The high 16 bits are ignored.
             * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
             */
            writeShort(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_INT16);
                this.data.setInt16(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT16;
            }
            writeUnsignedShort(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_UINT16);
                this.data.setUint16(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT16;
            }
            /**
             * Writes a 32-bit unsigned integer to the byte stream.
             * @param	value	An unsigned integer to write to the byte stream.
             */
            writeUnsignedInt(value) {
                this.validateBuffer(ByteArrayBase.SIZE_OF_UINT32);
                this.data.setUint32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT32;
            }
            /**
             * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
             * is written first, as a 16-bit integer, followed by the bytes representing the
             * characters of the string.
             * @param	value	The string value to be written.
             */
            writeUTF(value) {
                var utf8bytes = this.encodeUTF8(value);
                var length = utf8bytes.length;
                this.validateBuffer(ByteArrayBase.SIZE_OF_UINT16 + length);
                this.data.setUint16(this.position, length, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT16;
                this.writeUint8Array(utf8bytes);
            }
            /**
             * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
             * but writeUTFBytes() does not prefix the string with a 16-bit length word.
             * @param	value	The string value to be written.
             */
            writeUTFBytes(value) {
                this.writeUint8Array(this.encodeUTF8(value));
            }
            toString() {
                return "[ByteArrayBase] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
            }
            /****************************/
            /* EXTRA JAVASCRIPT APIs    */
            /****************************/
            /**
             * Writes a Uint8Array to the byte stream.
             * @param	value	The Uint8Array to be written.
             */
            writeUint8Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setUint8(this.position++, _bytes[i]);
                }
            }
            /**
             * Writes a Uint16Array to the byte stream.
             * @param	value	The Uint16Array to be written.
             */
            writeUint16Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setUint16(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_UINT16;
                }
            }
            /**
             * Writes a Uint32Array to the byte stream.
             * @param	value	The Uint32Array to be written.
             */
            writeUint32Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setUint32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_UINT32;
                }
            }
            /**
             * Writes a Int8Array to the byte stream.
             * @param	value	The Int8Array to be written.
             */
            writeInt8Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setInt8(this.position++, _bytes[i]);
                }
            }
            /**
             * Writes a Int16Array to the byte stream.
             * @param	value	The Int16Array to be written.
             */
            writeInt16Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setInt16(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_INT16;
                }
            }
            /**
             * Writes a Int32Array to the byte stream.
             * @param	value	The Int32Array to be written.
             */
            writeInt32Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setInt32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_INT32;
                }
            }
            /**
             * Writes a Float32Array to the byte stream.
             * @param	value	The Float32Array to be written.
             */
            writeFloat32Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setFloat32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_FLOAT32;
                }
            }
            /**
             * Writes a Float64Array to the byte stream.
             * @param	value	The Float64Array to be written.
             */
            writeFloat64Array(_bytes) {
                this.validateBuffer(this.position + _bytes.length);
                for (var i = 0; i < _bytes.length; i++) {
                    this.data.setFloat64(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
                    this.position += ByteArrayBase.SIZE_OF_FLOAT64;
                }
            }
            /**
             * Read a Uint8Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Uint8Array.
             */
            readUint8Array(length, createNewBuffer = true) {
                if (!this.validate(length))
                    return null;
                if (!createNewBuffer) {
                    var result = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += length;
                }
                else {
                    result = new Uint8Array(new ArrayBuffer(length));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getUint8(this.position);
                        this.position += ByteArrayBase.SIZE_OF_UINT8;
                    }
                }
                return result;
            }
            /**
             * Read a Uint16Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Uint16Array.
             */
            readUint16Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_UINT16;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    var result = new Uint16Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    result = new Uint16Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getUint16(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_UINT16;
                    }
                }
                return result;
            }
            /**
             * Read a Uint32Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Uint32Array.
             */
            readUint32Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_UINT32;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    var result = new Uint32Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    result = new Uint32Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getUint32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_UINT32;
                    }
                }
                return result;
            }
            /**
             * Read a Int8Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Int8Array.
             */
            readInt8Array(length, createNewBuffer = true) {
                if (!this.validate(length))
                    return null;
                if (!createNewBuffer) {
                    var result = new Int8Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += length;
                }
                else {
                    result = new Int8Array(new ArrayBuffer(length));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getInt8(this.position);
                        this.position += ByteArrayBase.SIZE_OF_INT8;
                    }
                }
                return result;
            }
            /**
             * Read a Int16Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Int16Array.
             */
            readInt16Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_INT16;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    var result = new Int16Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    result = new Int16Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getInt16(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_INT16;
                    }
                }
                return result;
            }
            /**
             * Read a Int32Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Int32Array.
             */
            readInt32Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_INT32;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    var result = new Int32Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    result = new Int32Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getInt32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_INT32;
                    }
                }
                return result;
            }
            /**
             * Read a Float32Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Float32Array.
             */
            readFloat32Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_FLOAT32;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    if (this.position % 4 == 0) {
                        var result = new Float32Array(this.buffer, this.position, length);
                        this.position += size;
                    }
                    else {
                        var tmp = new Uint8Array(new ArrayBuffer(size));
                        for (var i = 0; i < size; i++) {
                            tmp[i] = this.data.getUint8(this.position);
                            this.position += ByteArrayBase.SIZE_OF_UINT8;
                        }
                        result = new Float32Array(tmp.buffer);
                    }
                }
                else {
                    result = new Float32Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getFloat32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_FLOAT32;
                    }
                }
                return result;
            }
            /**
             * Read a Float64Array from the byte stream.
             * @param	length An unsigned short indicating the length of the Float64Array.
             */
            readFloat64Array(length, createNewBuffer = true) {
                var size = length * ByteArrayBase.SIZE_OF_FLOAT64;
                if (!this.validate(size))
                    return null;
                if (!createNewBuffer) {
                    var result = new Float64Array(this.buffer, this.position, length);
                    this.position += size;
                }
                else {
                    result = new Float64Array(new ArrayBuffer(size));
                    for (var i = 0; i < length; i++) {
                        result[i] = this.data.getFloat64(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                        this.position += ByteArrayBase.SIZE_OF_FLOAT64;
                    }
                }
                return result;
            }
            validate(len) {
                //len += this.data.byteOffset;
                if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                    return true;
                }
                else {
                    throw 'Error #2030: End of file was encountered.';
                }
            }
            /**********************/
            /*  PRIVATE METHODS   */
            /**********************/
            validateBuffer(len) {
                this.write_position = len > this.write_position ? len : this.write_position;
                if (this.data.byteLength < len) {
                    var tmp = new Uint8Array(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
                    tmp.set(new Uint8Array(this.data.buffer));
                    this.data.buffer = tmp.buffer;
                }
            }
            /**
             * UTF-8 Encoding/Decoding
             */
            encodeUTF8(str) {
                var pos = 0;
                var codePoints = this.stringToCodePoints(str);
                var outputBytes = [];
                while (codePoints.length > pos) {
                    var code_point = codePoints[pos++];
                    if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                        this.encoderError(code_point);
                    }
                    else if (this.inRange(code_point, 0x0000, 0x007f)) {
                        outputBytes.push(code_point);
                    }
                    else {
                        var count, offset;
                        if (this.inRange(code_point, 0x0080, 0x07FF)) {
                            count = 1;
                            offset = 0xC0;
                        }
                        else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                            count = 2;
                            offset = 0xE0;
                        }
                        else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                            count = 3;
                            offset = 0xF0;
                        }
                        outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                        while (count > 0) {
                            var temp = this.div(code_point, Math.pow(64, count - 1));
                            outputBytes.push(0x80 + (temp % 64));
                            count -= 1;
                        }
                    }
                }
                return new Uint8Array(outputBytes);
            }
            decodeUTF8(data) {
                var fatal = false;
                var pos = 0;
                var result = "";
                var code_point;
                var utf8_code_point = 0;
                var utf8_bytes_needed = 0;
                var utf8_bytes_seen = 0;
                var utf8_lower_boundary = 0;
                while (data.length > pos) {
                    var _byte = data[pos++];
                    if (_byte === this.EOF_byte) {
                        if (utf8_bytes_needed !== 0) {
                            code_point = this.decoderError(fatal);
                        }
                        else {
                            code_point = this.EOF_code_point;
                        }
                    }
                    else {
                        if (utf8_bytes_needed === 0) {
                            if (this.inRange(_byte, 0x00, 0x7F)) {
                                code_point = _byte;
                            }
                            else {
                                if (this.inRange(_byte, 0xC2, 0xDF)) {
                                    utf8_bytes_needed = 1;
                                    utf8_lower_boundary = 0x80;
                                    utf8_code_point = _byte - 0xC0;
                                }
                                else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                    utf8_bytes_needed = 2;
                                    utf8_lower_boundary = 0x800;
                                    utf8_code_point = _byte - 0xE0;
                                }
                                else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                    utf8_bytes_needed = 3;
                                    utf8_lower_boundary = 0x10000;
                                    utf8_code_point = _byte - 0xF0;
                                }
                                else {
                                    this.decoderError(fatal);
                                }
                                utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                                code_point = null;
                            }
                        }
                        else if (!this.inRange(_byte, 0x80, 0xBF)) {
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            pos--;
                            code_point = this.decoderError(fatal, _byte);
                        }
                        else {
                            utf8_bytes_seen += 1;
                            utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                            if (utf8_bytes_seen !== utf8_bytes_needed) {
                                code_point = null;
                            }
                            else {
                                var cp = utf8_code_point;
                                var lower_boundary = utf8_lower_boundary;
                                utf8_code_point = 0;
                                utf8_bytes_needed = 0;
                                utf8_bytes_seen = 0;
                                utf8_lower_boundary = 0;
                                if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                    code_point = cp;
                                }
                                else {
                                    code_point = this.decoderError(fatal, _byte);
                                }
                            }
                        }
                    }
                    //Decode string
                    if (code_point !== null && code_point !== this.EOF_code_point) {
                        if (code_point <= 0xFFFF) {
                            if (code_point > 0)
                                result += String.fromCharCode(code_point);
                        }
                        else {
                            code_point -= 0x10000;
                            result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                            result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                        }
                    }
                }
                return result;
            }
            encoderError(code_point) {
                throw 'EncodingError! The code point ' + code_point + ' could not be encoded.';
            }
            decoderError(fatal, opt_code_point) {
                if (fatal) {
                    throw 'DecodingError';
                }
                return opt_code_point || 0xFFFD;
            }
            inRange(a, min, max) {
                return min <= a && a <= max;
            }
            div(n, d) {
                return Math.floor(n / d);
            }
            stringToCodePoints(string) {
                /** @type {Array.<number>} */
                var cps = [];
                // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
                var i = 0, n = string.length;
                while (i < string.length) {
                    var c = string.charCodeAt(i);
                    if (!this.inRange(c, 0xD800, 0xDFFF)) {
                        cps.push(c);
                    }
                    else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                        cps.push(0xFFFD);
                    }
                    else {
                        if (i === n - 1) {
                            cps.push(0xFFFD);
                        }
                        else {
                            var d = string.charCodeAt(i + 1);
                            if (this.inRange(d, 0xDC00, 0xDFFF)) {
                                var a = c & 0x3FF;
                                var b = d & 0x3FF;
                                i += 1;
                                cps.push(0x10000 + (a << 10) + b);
                            }
                            else {
                                cps.push(0xFFFD);
                            }
                        }
                    }
                    i += 1;
                }
                return cps;
            }
        }
        ByteArrayBase.BIG_ENDIAN = "bigEndian";
        ByteArrayBase.LITTLE_ENDIAN = "littleEndian";
        ByteArrayBase.SIZE_OF_BOOLEAN = 1;
        ByteArrayBase.SIZE_OF_INT8 = 1;
        ByteArrayBase.SIZE_OF_INT16 = 2;
        ByteArrayBase.SIZE_OF_INT32 = 4;
        ByteArrayBase.SIZE_OF_INT64 = 8;
        ByteArrayBase.SIZE_OF_UINT8 = 1;
        ByteArrayBase.SIZE_OF_UINT16 = 2;
        ByteArrayBase.SIZE_OF_UINT32 = 4;
        ByteArrayBase.SIZE_OF_UINT64 = 8;
        ByteArrayBase.SIZE_OF_FLOAT32 = 4;
        ByteArrayBase.SIZE_OF_FLOAT64 = 8;
        utils.ByteArrayBase = ByteArrayBase;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        class MEMORY {
            static allocateUint8(len) {
                MEMORY.u8 = new Uint8Array(len);
            }
            static allocateUint16(len) {
                MEMORY.u16 = new Uint16Array(len);
            }
            static allocateUint32(len) {
                MEMORY.u32 = new Uint32Array(len);
            }
            static getUint8() {
                if (!MEMORY.u8) {
                    MEMORY.allocateUint8(10);
                }
                return MEMORY.u8Index++;
            }
            static getUint16() {
                if (!MEMORY.u16) {
                    MEMORY.allocateUint16(24);
                }
                return MEMORY.u16Index++;
            }
            static getUint32() {
                if (!MEMORY.u32) {
                    MEMORY.allocateUint32(10);
                }
                return MEMORY.u32Index++;
            }
        }
        MEMORY.u8Index = 0;
        MEMORY.u16Index = 0;
        MEMORY.u32Index = 0;
        utils.MEMORY = MEMORY;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        /**
         * LZMA Decoder
         * @author Nidin Vinayakan | nidinthb@gmail.com
         */
        var MEMORY = nid.utils.MEMORY;
        class LzmaDecoder {
            constructor() {
                this.posSlotDecoder = utils.BitTreeDecoder.constructArray(6, utils.LZMA.kNumLenToPosStates); //6
                this.alignDecoder = new utils.BitTreeDecoder(utils.LZMA.kNumAlignBits);
                this.posDecoders = new Uint16Array(1 + utils.LZMA.kNumFullDistances - utils.LZMA.kEndPosModelIndex);
                this.isMatch = new Uint16Array(utils.LZMA.kNumStates << utils.LZMA.kNumPosBitsMax);
                this.isRep = new Uint16Array(utils.LZMA.kNumStates);
                this.isRepG0 = new Uint16Array(utils.LZMA.kNumStates);
                this.isRepG1 = new Uint16Array(utils.LZMA.kNumStates);
                this.isRepG2 = new Uint16Array(utils.LZMA.kNumStates);
                this.isRep0Long = new Uint16Array(utils.LZMA.kNumStates << utils.LZMA.kNumPosBitsMax);
                this.lenDecoder = new utils.LenDecoder();
                this.repLenDecoder = new utils.LenDecoder();
                this.rangeDec = new utils.RangeDecoder();
                this.outWindow = new utils.OutWindow();
            }
            init() {
                this.loc1 = MEMORY.getUint32() | 0;
                this.loc2 = MEMORY.getUint32() | 0;
                this.matchBitI = MEMORY.getUint16() | 0;
                this.matchByteI = MEMORY.getUint16() | 0;
                this.bitI = MEMORY.getUint16() | 0;
                this.symbolI = MEMORY.getUint16() | 0;
                this.prevByteI = MEMORY.getUint16() | 0;
                this.litStateI = MEMORY.getUint16() | 0;
                this.initLiterals();
                this.initDist();
                utils.LZMA.INIT_PROBS(this.isMatch);
                utils.LZMA.INIT_PROBS(this.isRep);
                utils.LZMA.INIT_PROBS(this.isRepG0);
                utils.LZMA.INIT_PROBS(this.isRepG1);
                utils.LZMA.INIT_PROBS(this.isRepG2);
                utils.LZMA.INIT_PROBS(this.isRep0Long);
                this.lenDecoder.init();
                this.repLenDecoder.init();
            }
            create() {
                this.outWindow.create(this.dictSize);
                this.createLiterals();
            }
            //Private
            createLiterals() {
                this.litProbs = new Uint16Array(0x300 << (this.lc + this.lp));
            }
            initLiterals() {
                var num = 0x300 << (this.lc + this.lp); //UInt32
                for (var i = 0; i < num; i++) {
                    this.litProbs[i] = utils.LZMA.PROB_INIT_VAL;
                }
            }
            decodeLiteral(state, rep0) {
                MEMORY.u16[this.prevByteI] = 0; //unsigned byte
                if (!this.outWindow.isEmpty())
                    MEMORY.u16[this.prevByteI] = this.outWindow.getByte(1);
                MEMORY.u16[this.symbolI] = 1;
                MEMORY.u16[this.litStateI] = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (MEMORY.u16[this.prevByteI] >>> (8 - this.lc));
                var probsOffset = (0x300 * MEMORY.u16[this.litStateI]) | 0;
                if (state >= 7) {
                    MEMORY.u16[this.matchByteI] = this.outWindow.getByte(rep0 + 1);
                    do {
                        MEMORY.u16[this.matchBitI] = (MEMORY.u16[this.matchByteI] >>> 7) & 1;
                        MEMORY.u16[this.matchByteI] <<= 1;
                        MEMORY.u16[this.bitI] = this.rangeDec.decodeBit(this.litProbs, probsOffset + ((1 + MEMORY.u16[this.matchBitI]) << 8) + MEMORY.u16[this.symbolI]);
                        MEMORY.u16[this.symbolI] = (MEMORY.u16[this.symbolI] << 1) | MEMORY.u16[this.bitI];
                        if (MEMORY.u16[this.matchBitI] != MEMORY.u16[this.bitI])
                            break;
                    } while (MEMORY.u16[this.symbolI] < 0x100);
                }
                while (MEMORY.u16[this.symbolI] < 0x100) {
                    MEMORY.u16[this.symbolI] = (MEMORY.u16[this.symbolI] << 1) | this.rangeDec.decodeBit(this.litProbs, probsOffset + MEMORY.u16[this.symbolI]);
                }
                this.outWindow.putByte(MEMORY.u16[this.symbolI] - 0x100);
            }
            decodeDistance(len) {
                var lenState = len; //unsigned byte
                if (lenState > utils.LZMA.kNumLenToPosStates - 1)
                    lenState = utils.LZMA.kNumLenToPosStates - 1;
                var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec); //unsigned byte
                if (posSlot < 4)
                    return posSlot;
                var numDirectBits = ((posSlot >>> 1) - 1); //unsigned byte
                MEMORY.u32[this.loc1] = ((2 | (posSlot & 1)) << numDirectBits); //UInt32
                if (posSlot < utils.LZMA.kEndPosModelIndex) {
                    MEMORY.u32[this.loc1] += utils.LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, MEMORY.u32[this.loc1] - posSlot);
                }
                else {
                    MEMORY.u32[this.loc1] += this.rangeDec.decodeDirectBits(numDirectBits - utils.LZMA.kNumAlignBits) << utils.LZMA.kNumAlignBits;
                    MEMORY.u32[this.loc1] += this.alignDecoder.reverseDecode(this.rangeDec);
                }
                return MEMORY.u32[this.loc1];
            }
            initDist() {
                for (var i = 0; i < utils.LZMA.kNumLenToPosStates; i++) {
                    this.posSlotDecoder[i].init();
                }
                this.alignDecoder.init();
                utils.LZMA.INIT_PROBS(this.posDecoders);
            }
            decodeProperties(properties) {
                var prop = new Uint8Array(4);
                prop[0] = properties[0];
                if (prop[0] >= (9 * 5 * 5)) {
                    throw "Incorrect LZMA properties";
                }
                prop[1] = prop[0] % 9;
                prop[0] /= 9;
                prop[2] = prop[0] / 5;
                prop[3] = prop[0] % 5;
                this.lc = prop[1];
                this.pb = prop[2];
                this.lp = prop[3];
                this.dictSizeInProperties = 0;
                for (var i = 0; i < 4; i++) {
                    this.dictSizeInProperties |= properties[i + 1] << (8 * i);
                }
                this.dictSize = this.dictSizeInProperties;
                if (this.dictSize < utils.LZMA.LZMA_DIC_MIN) {
                    this.dictSize = utils.LZMA.LZMA_DIC_MIN;
                }
            }
            updateState_Literal(state) {
                if (state < 4)
                    return 0;
                else if (state < 10)
                    return state - 3;
                else
                    return state - 6;
            }
            updateState_ShortRep(state) { return state < 7 ? 9 : 11; }
            updateState_Rep(state) { return state < 7 ? 8 : 11; }
            updateState_Match(state) { return state < 7 ? 7 : 10; }
            decode(unpackSizeDefined, unpackSize) {
                this.init();
                this.rangeDec.init();
                if (unpackSizeDefined) {
                    this.outWindow.outStream = new Uint8Array(new ArrayBuffer(unpackSize));
                }
                var rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0; //UInt32
                var state = 0; //unsigned byte
                for (;;) {
                    if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory) {
                        if (this.rangeDec.isFinishedOK()) {
                            return utils.LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                        }
                    }
                    var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);
                    if (this.rangeDec.decodeBit(this.isMatch, (state << utils.LZMA.kNumPosBitsMax) + posState) == 0) {
                        if (unpackSizeDefined && unpackSize == 0) {
                            return utils.LZMA.LZMA_RES_ERROR;
                        }
                        this.decodeLiteral(state, rep0);
                        state = this.updateState_Literal(state);
                        unpackSize--;
                        continue;
                    }
                    var len;
                    if (this.rangeDec.decodeBit(this.isRep, state) != 0) {
                        if (unpackSizeDefined && unpackSize == 0) {
                            return utils.LZMA.LZMA_RES_ERROR;
                        }
                        if (this.outWindow.isEmpty()) {
                            return utils.LZMA.LZMA_RES_ERROR;
                        }
                        if (this.rangeDec.decodeBit(this.isRepG0, state) == 0) {
                            if (this.rangeDec.decodeBit(this.isRep0Long, (state << utils.LZMA.kNumPosBitsMax) + posState) == 0) {
                                state = this.updateState_ShortRep(state);
                                this.outWindow.putByte(this.outWindow.getByte(rep0 + 1));
                                unpackSize--;
                                continue;
                            }
                        }
                        else {
                            var dist;
                            if (this.rangeDec.decodeBit(this.isRepG1, state) == 0) {
                                dist = rep1;
                            }
                            else {
                                if (this.rangeDec.decodeBit(this.isRepG2, state) == 0) {
                                    dist = rep2;
                                }
                                else {
                                    dist = rep3;
                                    rep3 = rep2;
                                }
                                rep2 = rep1;
                            }
                            rep1 = rep0;
                            rep0 = dist;
                        }
                        len = this.repLenDecoder.decode(this.rangeDec, posState);
                        state = this.updateState_Rep(state);
                    }
                    else {
                        rep3 = rep2;
                        rep2 = rep1;
                        rep1 = rep0;
                        len = this.lenDecoder.decode(this.rangeDec, posState);
                        state = this.updateState_Match(state);
                        rep0 = this.decodeDistance(len);
                        if (rep0 == 0xFFFFFFFF) {
                            return this.rangeDec.isFinishedOK() ?
                                utils.LZMA.LZMA_RES_FINISHED_WITH_MARKER :
                                utils.LZMA.LZMA_RES_ERROR;
                        }
                        if (unpackSizeDefined && unpackSize == 0) {
                            return utils.LZMA.LZMA_RES_ERROR;
                        }
                        if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)) {
                            return utils.LZMA.LZMA_RES_ERROR;
                        }
                    }
                    len += utils.LZMA.kMatchMinLen;
                    var isError = false;
                    if (unpackSizeDefined && unpackSize < len) {
                        len = unpackSize;
                        isError = true;
                    }
                    this.outWindow.copyMatch(rep0 + 1, len);
                    unpackSize -= len;
                    if (isError) {
                        return utils.LZMA.LZMA_RES_ERROR;
                    }
                }
            }
        }
        utils.LzmaDecoder = LzmaDecoder;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        /**
         * LZMA Decoder
         * @author Nidin Vinayakan | nidinthb@gmail.com
         */
        class OutWindow {
            constructor() {
                this.out_pos = 0;
            }
            create(dictSize) {
                this.buf = new Uint8Array(dictSize);
                this.pos = 0;
                this.size = dictSize;
                this.isFull = false;
                this.totalPos = 0;
            }
            putByte(b) {
                this.totalPos++;
                this.buf[this.pos++] = b;
                if (this.pos == this.size) {
                    this.pos = 0;
                    this.isFull = true;
                }
                //this.outStream.writeUnsignedByte(b);
                this.outStream[this.out_pos++] = b;
            }
            getByte(dist) {
                return this.buf[dist <= this.pos ? this.pos - dist : this.size - dist + this.pos];
            }
            copyMatch(dist, len) {
                for (; len > 0; len--) {
                    this.putByte(this.getByte(dist));
                }
            }
            checkDistance(dist) {
                return dist <= this.pos || this.isFull;
            }
            isEmpty() {
                return this.pos == 0 && !this.isFull;
            }
        }
        utils.OutWindow = OutWindow;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        class RangeDecoder {
            constructor() {
                this.rangeI = 0;
                this.codeI = 1;
                this.loc1 = 2;
                this.loc2 = 3;
                this.in_pos = 13;
            }
            isFinishedOK() {
                return this.U32[this.codeI] == 0;
            }
            init() {
                this.U32 = new Uint32Array(4);
                this.U16 = new Uint16Array(4);
                this.corrupted = false;
                if (this.inStream[this.in_pos++] != 0) {
                    this.corrupted = true;
                }
                this.U32[this.rangeI] = 0xFFFFFFFF;
                this.U32[this.codeI] = 0;
                for (var i = 0; i < 4; i++) {
                    this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
                }
                if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                    this.corrupted = true;
                }
            }
            normalize() {
                if (this.U32[this.rangeI] < RangeDecoder.kTopValue) {
                    this.U32[this.rangeI] <<= 8;
                    this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
                }
            }
            decodeDirectBits(numBits) {
                this.U32[this.loc1] = 0; //UInt32
                do {
                    this.U32[this.rangeI] >>>= 1;
                    this.U32[this.codeI] -= this.U32[this.rangeI];
                    this.U32[this.loc2] = 0 - (this.U32[this.codeI] >>> 31);
                    this.U32[this.codeI] += this.U32[this.rangeI] & this.U32[this.loc2];
                    if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                        this.corrupted = true;
                    }
                    this.normalize();
                    this.U32[this.loc1] <<= 1;
                    this.U32[this.loc1] += this.U32[this.loc2] + 1;
                } while (--numBits);
                return this.U32[this.loc1];
            }
            decodeBit(prob, index) {
                this.U16[0] = prob[index];
                //bound
                this.U32[2] = (this.U32[0] >>> 11) * this.U16[0];
                //var symbol:number;
                if (this.U32[1] < this.U32[2]) {
                    this.U16[0] += ((1 << 11) - this.U16[0]) >>> 5;
                    this.U32[0] = this.U32[2];
                    this.U16[1] = 0;
                }
                else {
                    //v -= v >>> LZMA.kNumMoveBits;
                    this.U16[0] -= this.U16[0] >>> 5;
                    this.U32[1] -= this.U32[2];
                    this.U32[0] -= this.U32[2];
                    this.U16[1] = 1;
                }
                prob[index] = this.U16[0];
                //this.normalize();
                if (this.U32[0] < 16777216) {
                    this.U32[0] <<= 8;
                    this.U32[1] = (this.U32[1] << 8) | this.inStream[this.in_pos++];
                }
                return this.U16[1];
            }
        }
        RangeDecoder.kTopValue = (1 << 24);
        utils.RangeDecoder = RangeDecoder;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        /**
         * LZMA Decoder
         * @author Nidin Vinayakan | nidinthb@gmail.com
         */
        class BitTreeDecoder {
            constructor(numBits) {
                this.numBits = numBits;
                this.probs = new Uint16Array(1 << this.numBits);
            }
            init() {
                utils.LZMA.INIT_PROBS(this.probs);
            }
            decode(rc) {
                var m = 1; //Uint16
                for (var i = 0; i < this.numBits; i++)
                    m = (m << 1) + rc.decodeBit(this.probs, m);
                return m - (1 << this.numBits);
            }
            reverseDecode(rc) {
                return utils.LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
            }
            static constructArray(numBits, len) {
                var vec = [];
                for (var i = 0; i < len; i++) {
                    vec[i] = new BitTreeDecoder(numBits);
                }
                return vec;
            }
        }
        utils.BitTreeDecoder = BitTreeDecoder;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        /**
         * LZMA Decoder
         * @author Nidin Vinayakan | nidinthb@gmail.com
         */
        class LenDecoder {
            constructor() {
                this.lowCoder = utils.BitTreeDecoder.constructArray(3, 1 << utils.LZMA.kNumPosBitsMax);
                this.midCoder = utils.BitTreeDecoder.constructArray(3, 1 << utils.LZMA.kNumPosBitsMax);
                this.highCoder = new utils.BitTreeDecoder(8);
            }
            init() {
                this.choice = [utils.LZMA.PROB_INIT_VAL, utils.LZMA.PROB_INIT_VAL];
                this.highCoder.init();
                for (var i = 0; i < (1 << utils.LZMA.kNumPosBitsMax); i++) {
                    this.lowCoder[i].init();
                    this.midCoder[i].init();
                }
            }
            decode(rc, posState) {
                if (rc.decodeBit(this.choice, 0) == 0) {
                    return this.lowCoder[posState].decode(rc);
                }
                if (rc.decodeBit(this.choice, 1) == 0) {
                    return 8 + this.midCoder[posState].decode(rc);
                }
                return 16 + this.highCoder.decode(rc);
            }
        }
        utils.LenDecoder = LenDecoder;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        "use strict";
        /**
         * LZMA Decoder
         * @author Nidin Vinayakan | nidinthb@gmail.com
         *
         */
        class LZMA {
            constructor() {
                this.decoder = new utils.LzmaDecoder();
            }
            static INIT_PROBS(p) {
                for (var i = 0; i < p.length; i++) {
                    p[i] = this.PROB_INIT_VAL;
                }
            }
            static BitTreeReverseDecode(probs, numBits, rc, offset = 0) {
                var m = 1;
                var symbol = 0;
                for (var i = 0; i < numBits; i++) {
                    var bit = rc.decodeBit(probs, offset + m);
                    m <<= 1;
                    m += bit;
                    symbol |= (bit << i);
                }
                return symbol;
            }
            decode(data) {
                this.data = data;
                //var header:Uint8Array = data.readUint8Array(13);
                var header = new Uint8Array(13);
                var i; //int
                for (i = 0; i < 13; i++) {
                    header[i] = data[i];
                }
                this.decoder.decodeProperties(header);
                console.log("\nlc=" + this.decoder.lc + ", lp=" + this.decoder.lp + ", pb=" + this.decoder.pb);
                console.log("\nDictionary Size in properties = " + this.decoder.dictSizeInProperties);
                console.log("\nDictionary Size for decoding  = " + this.decoder.dictSize);
                //return this.ucdata;
                var unpackSize = 0; //UInt64
                var unpackSizeDefined = false;
                for (i = 0; i < 8; i++) {
                    var b = header[5 + i];
                    if (b != 0xFF) {
                        unpackSizeDefined = true;
                    }
                    unpackSize |= b << (8 * i);
                }
                this.decoder.markerIsMandatory = !unpackSizeDefined;
                console.log("\n");
                if (unpackSizeDefined) {
                    console.log("Uncompressed Size : " + unpackSize + " bytes");
                }
                else {
                    console.log("End marker is expected\n");
                }
                this.decoder.rangeDec.inStream = data;
                console.log("\n");
                this.decoder.create();
                // we support the streams that have uncompressed size and marker.
                var res = this.decoder.decode(unpackSizeDefined, unpackSize); //int
                console.log("Read    ", this.decoder.rangeDec.in_pos);
                console.log("Written ", this.decoder.outWindow.out_pos);
                if (res == LZMA.LZMA_RES_ERROR) {
                    throw "LZMA decoding error";
                }
                else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
                    console.log("Finished without end marker");
                }
                else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
                    if (unpackSizeDefined) {
                        if (this.decoder.outWindow.out_pos != unpackSize) {
                            throw "Finished with end marker before than specified size";
                        }
                        console.log("Warning: ");
                    }
                    console.log("Finished with end marker");
                }
                else {
                    throw "Internal Error";
                }
                console.log("\n");
                if (this.decoder.rangeDec.corrupted) {
                    console.log("\nWarning: LZMA stream is corrupted\n");
                }
                return this.decoder.outWindow.outStream;
            }
        }
        LZMA.LZMA_DIC_MIN = (1 << 12);
        LZMA.LZMA_RES_ERROR = 0;
        LZMA.LZMA_RES_FINISHED_WITH_MARKER = 1;
        LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
        LZMA.kNumBitModelTotalBits = 11;
        LZMA.kNumMoveBits = 5;
        LZMA.PROB_INIT_VAL = ((1 << LZMA.kNumBitModelTotalBits) / 2); //1024
        LZMA.kNumPosBitsMax = 4;
        LZMA.kNumStates = 12;
        LZMA.kNumLenToPosStates = 4;
        LZMA.kNumAlignBits = 4;
        LZMA.kStartPosModelIndex = 4;
        LZMA.kEndPosModelIndex = 14;
        LZMA.kNumFullDistances = (1 << (LZMA.kEndPosModelIndex >>> 1));
        LZMA.kMatchMinLen = 2;
        utils.LZMA = LZMA;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="lzma/LZMA.ts" />
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        class LZMAHelper {
            static init() {
                var command = 0;
                if (LZMAHelper.enableAsync) {
                    LZMAHelper.decoderAsync = new Worker('LZMAWorker.min.js');
                    LZMAHelper.decoderAsync.onmessage = function (e) {
                        if (command == 0) {
                            command = e.data;
                        }
                        else if (command == LZMAHelper.ENCODE) {
                            command = 0; //encode not implemented
                        }
                        else if (command == LZMAHelper.DECODE) {
                            command = 0;
                            LZMAHelper.callback(e.data);
                            LZMAHelper.callback = null;
                        }
                    };
                }
            }
            /**
             * TODO : Implement encoder
             * @param data
             * @returns {null}
             */
            static encode(data) {
                return null;
            }
            static decodeBuffer(data) {
                return LZMAHelper.decoder.decode(new Uint8Array(data)).buffer;
            }
            static decode(data) {
                return LZMAHelper.decoder.decode(data);
            }
            /**
             * TODO : Implement encoder
             * @param data
             * @param _callback
             */
            static encodeAsync(data, _callback) {
                if (LZMAHelper.enableAsync) {
                }
                else {
                    console.log('Error! Asynchronous encoding is disabled');
                }
            }
            static decodeAsync(data, _callback) {
                if (LZMAHelper.enableAsync) {
                    if (LZMAHelper.callback == null) {
                        LZMAHelper.callback = _callback;
                        LZMAHelper.decoderAsync.postMessage(LZMAHelper.DECODE);
                        LZMAHelper.decoderAsync.postMessage(data, [data]);
                    }
                    else {
                        console.log('Warning! Another LZMA decoding is running...');
                    }
                }
                else {
                    console.log('Error! Asynchronous decoding is disabled');
                }
            }
        }
        LZMAHelper.decoder = new utils.LZMA();
        LZMAHelper.enableAsync = false;
        LZMAHelper.ENCODE = 1;
        LZMAHelper.DECODE = 2;
        utils.LZMAHelper = LZMAHelper;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
nid.utils.LZMAHelper.init();
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        /**
         * JavaScript ByteArray
         * version : 0.2
         * @author Nidin Vinayakan | nidinthb@gmail.com
         */
        class CompressionAlgorithm {
        }
        CompressionAlgorithm.DEFLATE = "deflate";
        CompressionAlgorithm.LZMA = "lzma";
        CompressionAlgorithm.ZLIB = "zlib";
        utils.CompressionAlgorithm = CompressionAlgorithm;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
///<reference path="./ByteArrayBase.ts" />
///<reference path="./LZMAHelper.ts" />
/*///<reference path="./ZLIBHelper.ts" />*/
///<reference path="./CompressionAlgorithm.ts" />
/**
* JavaScript ByteArray
* version : 0.2
* @author Nidin Vinayakan | nidinthb@gmail.com
*
* ActionScript3 ByteArray implementation in JavaScript
* limitation : size of ByteArray cannot be changed
*
*/
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        class ByteArray extends utils.ByteArrayBase {
            constructor(buffer, offset = 0, length = 0) {
                super(buffer, offset, length);
            }
            compress(algorithm = utils.CompressionAlgorithm.LZMA) {
                throw "Compression error! " + algorithm + " not implemented";
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                }
                else {
                    throw "Compression error! " + algorithm + " not implemented";
                }
            }
            decompressBuffer(algorithm = utils.CompressionAlgorithm.LZMA) {
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                    try {
                        this.buffer = utils.LZMAHelper.decodeBuffer(this.buffer);
                    }
                    catch (e) {
                        throw "Uncompression error! " + algorithm + " not implemented";
                    }
                }
                else if (algorithm == utils.CompressionAlgorithm.ZLIB) {
                }
                else {
                    throw "Uncompression error! " + algorithm + " not implemented";
                }
            }
            decompress(algorithm = utils.CompressionAlgorithm.LZMA) {
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                    try {
                        this.array = utils.LZMAHelper.decode(this.array);
                    }
                    catch (e) {
                        throw "Uncompression error! " + algorithm + " not implemented";
                    }
                }
                else if (algorithm == utils.CompressionAlgorithm.ZLIB) {
                }
                else {
                    throw "Uncompression error! " + algorithm + " not implemented";
                }
            }
            compressAsync(algorithm, callback) {
                throw "Compression error! " + algorithm + " not implemented";
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                }
                else {
                    throw "Compression error! " + algorithm + " not implemented";
                }
            }
            decompressAsync(algorithm = utils.CompressionAlgorithm.LZMA, callback = null) {
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                    utils.LZMAHelper.decodeAsync(this.buffer, function (_data) {
                        this.buffer = _data;
                    });
                }
                else {
                    throw "Uncompression error! " + algorithm + " not implemented";
                }
            }
            deflate() { }
            inflate() { }
            /**
             * Reads the number of data bytes, specified by the length parameter, from the byte stream.
             * The bytes are read into the ByteArray object specified by the bytes parameter,
             * and the bytes are written into the destination ByteArrayBase starting at the _position specified by offset.
             * @param	bytes	The ByteArray object to read data into.
             * @param	offset	The offset (_position) in bytes at which the read data should be written.
             * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
             */
            readBytesAsByteArray(_bytes = null, offset = 0, length = 0, createNewBuffer = false) {
                if (length == 0) {
                    length = this.bytesAvailable;
                }
                else if (!this.validate(length))
                    return null;
                if (createNewBuffer) {
                    _bytes = _bytes == null ? new ByteArray(new ArrayBuffer(length)) : _bytes;
                    //This method is expensive
                    for (var i = 0; i < length; i++) {
                        _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
                    }
                }
                else {
                    //Offset argument ignored
                    _bytes = _bytes == null ? new ByteArray(null) : _bytes;
                    _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
                    this.position += length;
                }
                return _bytes;
            }
            /**
             * Reads an object from the byte array, encoded in AMF
             * serialized format.
             * @return	The deserialized object.
             */
            readObject() {
                //return this.readAmfObject();
                return null;
            }
            /**
             * Writes an object into the byte array in AMF
             * serialized format.
             * @param	object	The object to serialize.
             */
            writeObject(value) {
            }
        }
        ByteArray.BIG_ENDIAN = "bigEndian";
        ByteArray.LITTLE_ENDIAN = "littleEndian";
        utils.ByteArray = ByteArray;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
/**
 * @author Nidin Vinayakan
 */
this.log = function (a, force = false) {
    logHistory += a + "\n";
    if (debugMode || force) {
        console.log(a);
    }
};
this.info = function (a) {
    logHistory += a + "\n";
    if (debugMode) {
        console.log(a);
    }
};
this.warn = function (a) {
    logHistory += a + "\n";
    if (logWaring) {
        console.warn('warning:', a);
    }
};
this.error = function (a) {
    logHistory += a + "\n";
    if (logError) {
        console.error('error:', a);
    }
};
this.saveLog = function () {
    var blob = new Blob([logHistory], { type: 'application/octet-binary' });
    var url = URL.createObjectURL(blob);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = url;
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, false, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
};
debugMode = false;
logError = true;
logWaring = true;
logHistory = "";
/**
 * @author Nidin Vinayakan
 */
var nid;
(function (nid) {
    function saveAs(data, name = "Unnamed") {
        var blob = new Blob([data], { type: 'application/octet-binary' });
        var url = URL.createObjectURL(blob);
        var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        save_link.href = url;
        save_link.download = name;
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    }
    nid.saveAs = saveAs;
})(nid || (nid = {}));
/**
 * JavaScript BitmapData
 * version : 1.0.0
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
var nid;
(function (nid) {
    var display;
    (function (display) {
        class BitmapData {
            constructor(imageData) {
                if (imageData == undefined) {
                    this.imageData = new ImageData();
                }
                else {
                    this.imageData = imageData;
                }
            }
            get transparent() {
                return true;
            }
            get data() {
                return this.imageData.data;
            }
            get height() {
                return this.imageData.height;
            }
            get width() {
                return this.imageData.width;
            }
            getPixel(x, y) {
                var pos = (x + y * this.width) * 4;
                var r = this.imageData.data[pos];
                var g = this.imageData.data[pos + 1];
                var b = this.imageData.data[pos + 2];
                var a = this.imageData.data[pos + 3];
                return r << 16 | g << 8 | b;
            }
            getPixel32(x, y) {
                var pos = (x + y * this.width) * 4;
                var r = this.imageData.data[pos];
                var g = this.imageData.data[pos + 1];
                var b = this.imageData.data[pos + 2];
                var a = this.imageData.data[pos + 3];
                return r << 24 | g << 16 | b << 8 | a;
            }
            setPixel32(x, y, value) {
                var pos = (x + y * this.width) * 4;
                var r = value >> 24;
                var g = value >> 16 & 0xFF;
                var b = value >> 8 & 0xFF;
                var a = value & 0xFF;
                this.imageData.data[pos] = r;
                this.imageData.data[pos + 1] = g;
                this.imageData.data[pos + 2] = b;
                this.imageData.data[pos + 3] = a;
            }
        }
        display.BitmapData = BitmapData;
    })(display = nid.display || (nid.display = {}));
})(nid || (nid = {}));
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
var nid;
(function (nid) {
    var encoder;
    (function (encoder) {
        var ByteArray = nid.utils.ByteArray;
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
        class JPEGEncoder {
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
            constructor(quality = 50.0) {
                this.DENSITY_UNIT = 1;
                this.xDENSITY = 1;
                this.yDENSITY = 1;
                //--------------------------------------------------------------------------
                //
                //  Constants
                //
                //--------------------------------------------------------------------------
                /**
                 *  @private
                 */
                this.std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
                /**
                 *  @private
                 */
                this.std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                /**
                 *  @private
                 */
                this.std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
                /**
                 *  @private
                 */
                this.std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                /**
                 *  @private
                 */
                this.std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7D];
                /**
                 *  @private
                 */
                this.std_ac_luminance_values = [
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
                this.std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
                /**
                 *  @private
                 */
                this.std_ac_chrominance_values = [
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
                this.ZigZag = [
                    0, 1, 5, 6, 14, 15, 27, 28,
                    2, 4, 7, 13, 16, 26, 29, 42,
                    3, 8, 12, 17, 25, 30, 41, 43,
                    9, 11, 18, 24, 31, 40, 44, 53,
                    10, 19, 23, 32, 39, 45, 52, 54,
                    20, 22, 33, 38, 46, 51, 55, 60,
                    21, 34, 37, 47, 50, 56, 59, 61,
                    35, 36, 48, 49, 57, 58, 62, 63
                ];
                /**
                 *  @private
                 *  Initialized by initCategoryNumber() in constructor.
                 */
                this.category = new Array(65535);
                /**
                 *  @private
                 *  Initialized by initCategoryNumber() in constructor.
                 */
                this.bitcode = new Array(65535);
                /**
                 *  @private
                 *  Initialized by initQuantTables() in constructor.
                 */
                this.YTable = new Array(64);
                /**
                 *  @private
                 *  Initialized by initQuantTables() in constructor.
                 */
                this.UVTable = new Array(64);
                /**
                 *  @private
                 *  Initialized by initQuantTables() in constructor.
                 */
                this.fdtbl_Y = new Array(64);
                /**
                 *  @private
                 *  Initialized by initQuantTables() in constructor.
                 */
                this.fdtbl_UV = new Array(64);
                /**
                 *  @private
                 */
                this.bytenew = 0;
                /**
                 *  @private
                 */
                this.bytepos = 7;
                /**
                 *  @private
                 */
                this.DU = new Array(64);
                /**
                 *  @private
                 */
                this.YDU = new Array(64);
                /**
                 *  @private
                 */
                this.UDU = new Array(64);
                /**
                 *  @private
                 */
                this.VDU = new Array(64);
                if (quality <= 0.0)
                    quality = 1.0;
                if (quality > 100.0)
                    quality = 100.0;
                var sf = 0;
                if (quality < 50.0)
                    sf = (5000 / quality);
                else
                    sf = (200 - quality * 2);
                // Create tables
                this.initHuffmanTbl();
                this.initCategoryNumber();
                this.initQuantTables(sf);
            }
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
            get contentType() {
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
            encode(bitmapData, dpi = 0) {
                return this.internalEncode(bitmapData, bitmapData.width, bitmapData.height, true, dpi);
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
            encodeByteArray(byteArray, width, height, transparent = true, dpi = 0) {
                return this.internalEncode(byteArray, width, height, transparent, dpi);
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
            initHuffmanTbl() {
                this.YDC_HT = this.computeHuffmanTbl(this.std_dc_luminance_nrcodes, this.std_dc_luminance_values);
                this.UVDC_HT = this.computeHuffmanTbl(this.std_dc_chrominance_nrcodes, this.std_dc_chrominance_values);
                this.YAC_HT = this.computeHuffmanTbl(this.std_ac_luminance_nrcodes, this.std_ac_luminance_values);
                this.UVAC_HT = this.computeHuffmanTbl(this.std_ac_chrominance_nrcodes, this.std_ac_chrominance_values);
            }
            /**
             *  @private
             */
            computeHuffmanTbl(nrcodes, std_table) {
                var codevalue = 0;
                var pos_in_table = 0;
                var HT = [];
                for (var k = 1; k <= 16; k++) {
                    for (var j = 1; j <= nrcodes[k]; j++) {
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
            initCategoryNumber() {
                var nr;
                var nrlower = 1;
                var nrupper = 2;
                for (var cat = 1; cat <= 15; cat++) {
                    // Positive numbers
                    for (nr = nrlower; nr < nrupper; nr++) {
                        this.category[32767 + nr] = cat;
                        this.bitcode[32767 + nr] = new BitString();
                        this.bitcode[32767 + nr].len = cat;
                        this.bitcode[32767 + nr].val = nr;
                    }
                    // Negative numbers
                    for (nr = -(nrupper - 1); nr <= -nrlower; nr++) {
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
            initQuantTables(sf) {
                var i = 0;
                var t;
                var YQT = [
                    16, 11, 10, 16, 24, 40, 51, 61,
                    12, 12, 14, 19, 26, 58, 60, 55,
                    14, 13, 16, 24, 40, 57, 69, 56,
                    14, 17, 22, 29, 51, 87, 80, 62,
                    18, 22, 37, 56, 68, 109, 103, 77,
                    24, 35, 55, 64, 81, 104, 113, 92,
                    49, 64, 78, 87, 103, 121, 120, 101,
                    72, 92, 95, 98, 112, 100, 103, 99
                ];
                for (i = 0; i < 64; i++) {
                    t = Math.floor((YQT[i] * sf + 50) / 100);
                    if (t < 1)
                        t = 1;
                    else if (t > 255)
                        t = 255;
                    this.YTable[this.ZigZag[i]] = t;
                }
                var UVQT = [
                    17, 18, 24, 47, 99, 99, 99, 99,
                    18, 21, 26, 66, 99, 99, 99, 99,
                    24, 26, 56, 99, 99, 99, 99, 99,
                    47, 66, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99,
                    99, 99, 99, 99, 99, 99, 99, 99
                ];
                for (i = 0; i < 64; i++) {
                    t = Math.floor((UVQT[i] * sf + 50) / 100);
                    if (t < 1)
                        t = 1;
                    else if (t > 255)
                        t = 255;
                    this.UVTable[this.ZigZag[i]] = t;
                }
                var aasf = [
                    1.0, 1.387039845, 1.306562965, 1.175875602,
                    1.0, 0.785694958, 0.541196100, 0.275899379
                ];
                i = 0;
                for (var row = 0; row < 8; row++) {
                    for (var col = 0; col < 8; col++) {
                        this.fdtbl_Y[i] =
                            (1.0 / (this.YTable[this.ZigZag[i]] * aasf[row] * aasf[col] * 8.0));
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
            internalEncode(source, width, height, transparent = true, dpi = 0) {
                // The source is either a BitmapData or a ByteArray.
                var sourceBitmapData = source;
                var sourceByteArray = source;
                // Initialize bit writer
                this.byteout = new ByteArray(new ArrayBuffer(width * height * 4));
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
                var DCY = 0;
                var DCU = 0;
                var DCV = 0;
                this.bytenew = 0;
                this.bytepos = 7;
                for (var ypos = 0; ypos < height; ypos += 8) {
                    for (var xpos = 0; xpos < width; xpos += 8) {
                        this.RGB2YUV(sourceBitmapData, sourceByteArray, xpos, ypos, width, height);
                        DCY = this.processDU(this.YDU, this.fdtbl_Y, DCY, this.YDC_HT, this.YAC_HT);
                        DCU = this.processDU(this.UDU, this.fdtbl_UV, DCU, this.UVDC_HT, this.UVAC_HT);
                        DCV = this.processDU(this.VDU, this.fdtbl_UV, DCV, this.UVDC_HT, this.UVAC_HT);
                    }
                }
                // Do the bit alignment of the EOI marker
                if (this.bytepos >= 0) {
                    var fillbits = new BitString();
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
            RGB2YUV(sourceBitmapData, sourceByteArray, xpos, ypos, width, height) {
                var k = 0; // index into 64-element block arrays
                for (var j = 0; j < 8; j++) {
                    var y = ypos + j;
                    if (y >= height)
                        y = height - 1;
                    for (var i = 0; i < 8; i++) {
                        var x = xpos + i;
                        if (x >= width)
                            x = width - 1;
                        var pixel; //uint;
                        if (sourceBitmapData) {
                            pixel = sourceBitmapData.getPixel32(x, y);
                        }
                        else {
                            sourceByteArray.position = 4 * (y * width + x);
                            pixel = sourceByteArray.readUnsignedInt();
                        }
                        var r = Number((pixel >> 16) & 0xFF);
                        var g = Number((pixel >> 8) & 0xFF);
                        var b = Number(pixel & 0xFF);
                        this.YDU[k] = 0.29900 * r + 0.58700 * g + 0.11400 * b - 128.0;
                        this.UDU[k] = -0.16874 * r - 0.33126 * g + 0.50000 * b;
                        this.VDU[k] = 0.50000 * r - 0.41869 * g - 0.08131 * b;
                        k++;
                    }
                }
            }
            /**
             *  @private
             */
            processDU(CDU, fdtbl, DC, HTDC, HTAC) {
                var EOB = HTAC[0x00];
                var M16zeroes = HTAC[0xF0];
                var i;
                var DU_DCT = this.fDCTQuant(CDU, fdtbl);
                // ZigZag reorder
                for (i = 0; i < 64; i++) {
                    this.DU[this.ZigZag[i]] = DU_DCT[i];
                }
                var Diff = this.DU[0] - DC;
                DC = this.DU[0];
                // Encode DC
                if (Diff == 0) {
                    this.writeBits(HTDC[0]); // Diff might be 0
                }
                else {
                    this.writeBits(HTDC[this.category[32767 + Diff]]);
                    this.writeBits(this.bitcode[32767 + Diff]);
                }
                // Encode ACs
                var end0pos = 63;
                for (; (end0pos > 0) && (this.DU[end0pos] == 0); end0pos--) {
                }
                ;
                // end0pos = first element in reverse order != 0
                if (end0pos == 0) {
                    this.writeBits(EOB);
                    return DC;
                }
                i = 1;
                while (i <= end0pos) {
                    var startpos = i;
                    for (; (this.DU[i] == 0) && (i <= end0pos); i++) {
                    }
                    var nrzeroes = i - startpos;
                    if (nrzeroes >= 16) {
                        for (var nrmarker = 1; nrmarker <= nrzeroes / 16; nrmarker++) {
                            this.writeBits(M16zeroes);
                        }
                        nrzeroes = (nrzeroes & 0xF);
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
            fDCTQuant(data, fdtbl) {
                // Pass 1: process rows.
                var dataOff = 0;
                var i;
                for (i = 0; i < 8; i++) {
                    var tmp0 = data[dataOff + 0] + data[dataOff + 7];
                    var tmp7 = data[dataOff + 0] - data[dataOff + 7];
                    var tmp1 = data[dataOff + 1] + data[dataOff + 6];
                    var tmp6 = data[dataOff + 1] - data[dataOff + 6];
                    var tmp2 = data[dataOff + 2] + data[dataOff + 5];
                    var tmp5 = data[dataOff + 2] - data[dataOff + 5];
                    var tmp3 = data[dataOff + 3] + data[dataOff + 4];
                    var tmp4 = data[dataOff + 3] - data[dataOff + 4];
                    // Even part
                    var tmp10 = tmp0 + tmp3; // phase 2
                    var tmp13 = tmp0 - tmp3;
                    var tmp11 = tmp1 + tmp2;
                    var tmp12 = tmp1 - tmp2;
                    data[dataOff + 0] = tmp10 + tmp11; // phase 3
                    data[dataOff + 4] = tmp10 - tmp11;
                    var z1 = (tmp12 + tmp13) * 0.707106781; // c4
                    data[dataOff + 2] = tmp13 + z1; // phase 5
                    data[dataOff + 6] = tmp13 - z1;
                    // Odd part
                    tmp10 = tmp4 + tmp5; // phase 2
                    tmp11 = tmp5 + tmp6;
                    tmp12 = tmp6 + tmp7;
                    // The rotator is modified from fig 4-8 to avoid extra negations.
                    var z5 = (tmp10 - tmp12) * 0.382683433; // c6
                    var z2 = 0.541196100 * tmp10 + z5; // c2 - c6
                    var z4 = 1.306562965 * tmp12 + z5; // c2 + c6
                    var z3 = tmp11 * 0.707106781; // c4
                    var z11 = tmp7 + z3; // phase 5
                    var z13 = tmp7 - z3;
                    data[dataOff + 5] = z13 + z2; // phase 6
                    data[dataOff + 3] = z13 - z2;
                    data[dataOff + 1] = z11 + z4;
                    data[dataOff + 7] = z11 - z4;
                    dataOff += 8; // advance pointer to next row
                }
                // Pass 2: process columns.
                dataOff = 0;
                for (i = 0; i < 8; i++) {
                    tmp0 = data[dataOff + 0] + data[dataOff + 56];
                    tmp7 = data[dataOff + 0] - data[dataOff + 56];
                    tmp1 = data[dataOff + 8] + data[dataOff + 48];
                    tmp6 = data[dataOff + 8] - data[dataOff + 48];
                    tmp2 = data[dataOff + 16] + data[dataOff + 40];
                    tmp5 = data[dataOff + 16] - data[dataOff + 40];
                    tmp3 = data[dataOff + 24] + data[dataOff + 32];
                    tmp4 = data[dataOff + 24] - data[dataOff + 32];
                    // Even par
                    tmp10 = tmp0 + tmp3; // phase 2
                    tmp13 = tmp0 - tmp3;
                    tmp11 = tmp1 + tmp2;
                    tmp12 = tmp1 - tmp2;
                    data[dataOff + 0] = tmp10 + tmp11; // phase 3
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
                    data[dataOff + 8] = z11 + z4;
                    data[dataOff + 56] = z11 - z4;
                    dataOff++; // advance pointer to next column
                }
                // Quantize/descale the coefficients
                for (i = 0; i < 64; i++) {
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
            writeBits(bs) {
                var value = bs.val;
                var posval = bs.len - 1;
                while (posval >= 0) {
                    if (value & (1 << posval)) {
                        this.bytenew |= (1 << this.bytepos); //uint
                    }
                    posval--;
                    this.bytepos--;
                    if (this.bytepos < 0) {
                        if (this.bytenew == 0xFF) {
                            this.writeByte(0xFF);
                            this.writeByte(0);
                        }
                        else {
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
            writeByte(value) {
                this.byteout.writeByte(value);
            }
            /**
             *  @private
             */
            writeWord(value) {
                this.writeByte((value >> 8) & 0xFF);
                this.writeByte(value & 0xFF);
            }
            /**
             *  @private
             */
            writeAPP0(dpi) {
                this.writeWord(0xFFE0); // marker
                this.writeWord(16); // length
                this.writeByte(0x4A); // J
                this.writeByte(0x46); // F
                this.writeByte(0x49); // I
                this.writeByte(0x46); // F
                this.writeByte(0); // = "JFIF",'\0'
                this.writeByte(1); // versionhi
                this.writeByte(1); // versionlo
                this.writeByte(dpi == 0 ? 0 : this.DENSITY_UNIT); // xyunits
                this.writeWord(dpi == 0 ? 1 : this.xDENSITY); // xdensity
                this.writeWord(dpi == 0 ? 1 : this.yDENSITY); // ydensity
                this.writeByte(0); // thumbnwidth
                this.writeByte(0); // thumbnheight
            }
            /**
             *  @private
             */
            writeDQT() {
                this.writeWord(0xFFDB); // marker
                this.writeWord(132); // length
                this.writeByte(0);
                var i;
                for (i = 0; i < 64; i++) {
                    this.writeByte(this.YTable[i]);
                }
                this.writeByte(1);
                for (i = 0; i < 64; i++) {
                    this.writeByte(this.UVTable[i]);
                }
            }
            /**
             *  @private
             */
            writeSOF0(width, height) {
                this.writeWord(0xFFC0); // marker
                this.writeWord(17); // length, truecolor YUV JPG
                this.writeByte(8); // precision
                this.writeWord(height);
                this.writeWord(width);
                this.writeByte(3); // nrofcomponents
                this.writeByte(1); // IdY
                this.writeByte(0x11); // HVY
                this.writeByte(0); // QTY
                this.writeByte(2); // IdU
                this.writeByte(0x11); // HVU
                this.writeByte(1); // QTU
                this.writeByte(3); // IdV
                this.writeByte(0x11); // HVV
                this.writeByte(1); // QTV
            }
            /**
             *  @private
             */
            writeDHT() {
                var i;
                this.writeWord(0xFFC4); // marker
                this.writeWord(0x01A2); // length
                this.writeByte(0); // HTYDCinfo
                for (i = 0; i < 16; i++) {
                    this.writeByte(this.std_dc_luminance_nrcodes[i + 1]);
                }
                for (i = 0; i <= 11; i++) {
                    this.writeByte(this.std_dc_luminance_values[i]);
                }
                this.writeByte(0x10); // HTYACinfo
                for (i = 0; i < 16; i++) {
                    this.writeByte(this.std_ac_luminance_nrcodes[i + 1]);
                }
                for (i = 0; i <= 161; i++) {
                    this.writeByte(this.std_ac_luminance_values[i]);
                }
                this.writeByte(1); // HTUDCinfo
                for (i = 0; i < 16; i++) {
                    this.writeByte(this.std_dc_chrominance_nrcodes[i + 1]);
                }
                for (i = 0; i <= 11; i++) {
                    this.writeByte(this.std_dc_chrominance_values[i]);
                }
                this.writeByte(0x11); // HTUACinfo
                for (i = 0; i < 16; i++) {
                    this.writeByte(this.std_ac_chrominance_nrcodes[i + 1]);
                }
                for (i = 0; i <= 161; i++) {
                    this.writeByte(this.std_ac_chrominance_values[i]);
                }
            }
            /**
             *  @private
             */
            writeSOS() {
                this.writeWord(0xFFDA); // marker
                this.writeWord(12); // length
                this.writeByte(3); // nrofcomponents
                this.writeByte(1); // IdY
                this.writeByte(0); // HTY
                this.writeByte(2); // IdU
                this.writeByte(0x11); // HTU
                this.writeByte(3); // IdV
                this.writeByte(0x11); // HTV
                this.writeByte(0); // Ss
                this.writeByte(0x3f); // Se
                this.writeByte(0); // Bf
            }
        }
        //--------------------------------------------------------------------------
        //
        //  Class constants
        //
        //--------------------------------------------------------------------------
        /**
         *  @private
         */
        JPEGEncoder.CONTENT_TYPE = "image/jpeg";
        encoder.JPEGEncoder = JPEGEncoder;
    })(encoder = nid.encoder || (nid.encoder = {}));
})(nid || (nid = {}));
class BitString {
    constructor() {
        /**
         *  @private
         */
        this.len = 0;
        /**
         *  @private
         */
        this.val = 0;
    }
    /**
     *  Constructor.
     *
     *  @langversion 3.0
     *  @playerversion Flash 9
     *  @playerversion AIR 1.1
     *  @productversion Flex 3
     */
    BitString() {
    }
}
var nid;
(function (nid) {
    var encoder;
    (function (encoder) {
        var ByteArray = nid.utils.ByteArray;
        class PNGEncoder {
            static get contentType() {
                return PNGEncoder.CONTENT_TYPE;
            }
            static encode(bitmapData, dpi = 0) {
                this.initializeCRCTable();
                return this.internalEncode(bitmapData, bitmapData.width, bitmapData.height, bitmapData.transparent, dpi);
            }
            static encodeByteArray(byteArray, width, height, transparent = true, dpi = 0) {
                this.initializeCRCTable();
                return this.internalEncode(byteArray, width, height, transparent, dpi);
            }
            static initializeCRCTable() {
                if (this.crcTable == null) {
                    this.crcTable = [];
                    for (var n = 0; n < 256; n++) {
                        var c = n;
                        for (var k = 0; k < 8; k++) {
                            if (c & 1)
                                c = ((0xedb88320) ^ (c >>> 1)); //uint
                            else
                                c = (c >>> 1); //uint
                        }
                        this.crcTable[n] = c;
                    }
                }
            }
            static internalEncode(source, width, height, transparent, dpi) {
                // The source is either a BitmapData or a ByteArray.
                var sourceBitmapData = source;
                var sourceByteArray = source;
                if (sourceByteArray)
                    sourceByteArray.position = 0;
                // Create output byte array
                var png = new ByteArray(new ArrayBuffer(width * height * 4));
                // Write PNG signature
                png.writeUnsignedInt(0x89504E47);
                png.writeUnsignedInt(0x0D0A1A0A);
                // Build IHDR chunk
                var IHDR = new ByteArray(new ArrayBuffer(13));
                IHDR.writeInt(width);
                IHDR.writeInt(height);
                IHDR.writeByte(8); // bit depth per channel
                IHDR.writeByte(6); // color type: RGBA
                IHDR.writeByte(0); // compression method
                IHDR.writeByte(0); // filter method
                IHDR.writeByte(0); // interlace method
                this.writeChunk(png, 0x49484452, IHDR);
                if (dpi > 0) {
                    var pHYs = new ByteArray(new ArrayBuffer(9));
                    dpi = dpi / 0.0254;
                    pHYs.writeUnsignedInt(dpi); //Pixels per unit, X axis
                    pHYs.writeUnsignedInt(dpi); //Pixels per unit, Y axis
                    pHYs.writeByte(1);
                    this.writeChunk(png, 0x70485973, pHYs);
                }
                //70 48 59 73 pHYs Physical pixel dimensions
                // Build IDAT chunk
                var IDAT = new ByteArray();
                for (var y = 0; y < height; y++) {
                    IDAT.writeByte(0); // no filter
                    var x;
                    var pixel;
                    if (!transparent) {
                        for (x = 0; x < width; x++) {
                            if (sourceBitmapData)
                                pixel = sourceBitmapData.getPixel(x, y);
                            else
                                pixel = sourceByteArray.readUnsignedInt();
                            IDAT.writeUnsignedInt((((pixel & 0xFFFFFF) << 8) | 0xFF)); //uint
                        }
                    }
                    else {
                        for (x = 0; x < width; x++) {
                            if (sourceBitmapData)
                                pixel = sourceBitmapData.getPixel32(x, y);
                            else
                                pixel = sourceByteArray.readUnsignedInt();
                            IDAT.writeUnsignedInt((((pixel & 0xFFFFFF) << 8) | (pixel >>> 24))); //uint
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
            static writeChunk(png, type, data) {
                // Write length of data.
                var len = 0;
                if (data)
                    len = data.length;
                png.writeUnsignedInt(len);
                // Write chunk type.
                var typePos = png.position;
                png.writeUnsignedInt(type);
                // Write data.
                if (data)
                    png.writeBytes(data);
                // Write CRC of chunk type and data.
                var crcPos = png.position;
                png.position = typePos;
                var crc = 0xFFFFFFFF;
                for (var i = typePos; i < crcPos; i++) {
                    crc = (this.crcTable[(crc ^ png.readUnsignedByte()) & (0xFF)] ^ (crc >>> 8)); //uint
                }
                crc = (crc ^ (0xFFFFFFFF)); //uint
                png.position = crcPos;
                png.writeUnsignedInt(crc);
            }
        }
        PNGEncoder.CONTENT_TYPE = "image/png";
        encoder.PNGEncoder = PNGEncoder;
    })(encoder = nid.encoder || (nid.encoder = {}));
})(nid || (nid = {}));
///<reference path="lib.d.ts" />
/**
 * JavaScript Image Library
 * version : 1.0.0
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
var nid;
(function (nid) {
    var ByteArray = nid.utils.ByteArray;
    var BitmapData = nid.display.BitmapData;
    var JPEGEncoder = nid.encoder.JPEGEncoder;
    var PNGEncoder = nid.encoder.PNGEncoder;
    class ImageLibrary {
        static encodePNG(bitmap, callback = null) {
            if (bitmap instanceof ImageData) {
                return PNGEncoder.encode(new BitmapData(bitmap), 72);
            }
            else if (bitmap instanceof BitmapData) {
                return PNGEncoder.encode(bitmap, 72);
            }
            else if (bitmap instanceof ByteArray) {
            }
            else {
                throw "[encodePNG] Error! unsupported data";
            }
            return null;
        }
        static encodeJPEG(bitmap, callback = null) {
            if (bitmap instanceof ImageData) {
                return this.jpegEncoder.encode(new BitmapData(bitmap), 72);
            }
            else if (bitmap instanceof BitmapData) {
                return this.jpegEncoder.encode(bitmap, 72);
            }
            else if (bitmap instanceof ByteArray) {
            }
            else {
                throw "[encodeJPEG] Error! unsupported data";
            }
            return null;
        }
    }
    ImageLibrary.jpegEncoder = new JPEGEncoder();
    nid.ImageLibrary = ImageLibrary;
})(nid || (nid = {}));
//# sourceMappingURL=ImageLibrary.js.map