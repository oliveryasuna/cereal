import ByteBuffer from 'bytebuffer';
import {TYPES} from './types';

class Decoder {

  // Methods
  //--------------------------------------------------

  protected _decodeValue(buffer: ByteBuffer): unknown {
    const type: number = buffer.readUint8();

    if(type <= TYPES.MAX) {
      return ByteBuffer.zigZagDecode32(type);
    }

    switch(type) {
      case TYPES.NULL:
        return null;
      case TYPES.TRUE:
        return true;
      case TYPES.FALSE:
        return false;
      case TYPES.EMPTY_OBJECT:
        return {};
      case TYPES.EMPTY_ARRAY:
        return [];
      case TYPES.EMPTY_STRING:
        return '';
      case TYPES.OBJECT:
        return this._decodeObject(buffer);
      case TYPES.ARRAY:
        return this._decodeArray(buffer);
      case TYPES.INTEGER:
        return this._decodeInteger(buffer);
      case TYPES.LONG:
        return this._decodeLong(buffer);
      case TYPES.FLOAT:
        return this._decodeFloat(buffer);
      case TYPES.DOUBLE:
        return this._decodeDouble(buffer);
      case TYPES.STRING:
        return this._decodeString(buffer);
      case TYPES.BINARY:
        return this._decodeBinary(buffer);
    }

    throw (new Error(`Invalid type: ${type}`));
  }

  protected _decodeArray(buffer: ByteBuffer): unknown[] {
    const length: number = buffer.readVarint32();
    const arr: unknown[] = [];

    for(let i = 0; i < length; i++) {
      arr.push(this._decodeValue(buffer));
    }

    return arr;
  }

  protected _decodeBinary(buffer: ByteBuffer): ByteBuffer {
    const length: number = buffer.readVarint32();
    const result: ByteBuffer = buffer.slice(buffer.offset, (buffer.offset + length));

    buffer.skip(length);

    return result;
  }

  protected _decodeDouble(buffer: ByteBuffer): number {
    return buffer.readFloat64();
  }

  protected _decodeFloat(buffer: ByteBuffer): number {
    return buffer.readFloat32();
  }

  protected _decodeInteger(buffer: ByteBuffer): number {
    return buffer.readVarint32ZigZag();
  }

  protected _decodeLong(buffer: ByteBuffer): Long {
    return buffer.readVarint64ZigZag();
  }

  protected _decodeObject(buffer: ByteBuffer): Record<string, unknown> {
    const length: number = buffer.readVarint32();
    const obj: Record<string, unknown> = {};

    for(let i = 0; i < length; i++) {
      const key: string = buffer.readVString();

      obj[key] = this._decodeValue(buffer);
    }

    return obj;
  }

  protected _decodeString(buffer: ByteBuffer): string {
    return buffer.readVString();
  }

}

export {
  Decoder
};
