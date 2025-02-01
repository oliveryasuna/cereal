import ByteBuffer from 'bytebuffer';
import {TYPES} from './types';
import Long from 'long';

class Encoder {

  // Methods
  //--------------------------------------------------

  public encode(value: unknown): ByteBuffer {
    const buffer: ByteBuffer = (new ByteBuffer());

    this.write(value, buffer);

    return buffer;
  }

  public write(value: unknown, buffer: ByteBuffer): void {
    const isLittleEndian: boolean = buffer.littleEndian;

    try {
      this._writeValue(value, buffer.LE());

      buffer.littleEndian = isLittleEndian;
    } catch(err: unknown) {
      buffer.littleEndian = isLittleEndian;

      throw err;
    }
  }

  protected _writeValue(value: unknown, buffer: ByteBuffer): void {
    if(value === null) {
      this._writeNull(buffer);

      return;
    }

    switch(typeof value) {
      case 'boolean':
        this._writeBoolean(value, buffer);

        break;
      case 'function':
        this._writeString(value.toString(), buffer);

        break;
      case 'undefined':
        this._writeNull(buffer);

        break;
      case 'number':
        if(Number.isInteger(value)) {
          this._writeInteger(value, buffer);
        } else {
          this._writeFloat(value, buffer);
        }

        break;
      case 'object':
        if(Array.isArray(value)) {
          this._writeArray(value, buffer);
        } else if(Long && (value instanceof Long)) {
          this._writeLong(value, buffer);
        } else if(value instanceof ByteBuffer) {
          this._writeBinary(value, buffer);
        } else {
          this._writeObject((value as Record<string, unknown>), buffer);
        }

        break;
      case 'string':
        this._writeString(value, buffer);

        break;
    }

    throw (new Error(`Invalid type: ${typeof value}`));
  }

  protected _writeArray(value: unknown[], buffer: ByteBuffer): void {
    if(value.length === 0) {
      buffer.writeUint8(TYPES.EMPTY_ARRAY);
    } else {
      buffer.writeUint8(TYPES.ARRAY);
      buffer.writeVarint32(value.length);

      for(let i = 0; i < value.length; i++) {
        this._writeValue(value[i], buffer);
      }
    }
  }

  protected _writeBinary(value: ByteBuffer, buffer: ByteBuffer): void {
    const valueBuffer: ByteBuffer = ByteBuffer.wrap(value);

    buffer.writeUint8(TYPES.BINARY);
    buffer.writeVarint32(value.remaining());
    buffer.append(valueBuffer);
  }

  protected _writeBoolean(value: boolean, buffer: ByteBuffer): void {
    buffer.writeUint8(value ? TYPES.TRUE : TYPES.FALSE);
  }

  protected _writeFloat(value: number, buffer: ByteBuffer): void {
    buffer.writeFloat32(value, 0);

    if(value === buffer.readFloat32(0)) {
      buffer.writeUint8(TYPES.FLOAT);
      buffer.writeFloat32(value);
    } else {
      buffer.writeUint8(TYPES.DOUBLE);
      buffer.writeFloat64(value);
    }
  }

  protected _writeInteger(value: number, buffer: ByteBuffer): void {
    const zigZagValue: number = ByteBuffer.zigZagEncode32(value);

    if(zigZagValue <= TYPES.MAX) {
      buffer.writeUint8(zigZagValue);
    } else {
      buffer.writeUint8(TYPES.INTEGER);
      buffer.writeVarint32ZigZag(value);
    }
  }

  protected _writeLong(value: Long, buffer: ByteBuffer): void {
    buffer.writeUint8(TYPES.LONG);
    buffer.writeVarint64ZigZag(value);
  }

  protected _writeNull(buffer: ByteBuffer): void {
    buffer.writeUint8(TYPES.NULL);
  }

  protected _writeObject(value: Record<string, unknown>, buffer: ByteBuffer): void {
    const keys: ((keyof (typeof value)) & string)[] = (Object.keys(value) as ((keyof (typeof value)) & string)[]);
    const definedValue: Record<string, unknown> = {};

    for(const key of keys) {
      if(typeof value[key!] === 'undefined') {
        continue;
      }

      definedValue[key] = value[key!];
    }

    const definedValueCount: number = Object.keys(definedValue).length;

    if(definedValueCount === 0) {
      buffer.writeUint8(TYPES.EMPTY_OBJECT);
    } else {
      buffer.writeUint8(TYPES.OBJECT);
      buffer.writeVarint32(definedValueCount);

      for(const key in definedValue) {
        buffer.writeUint8(TYPES.STRING);
        buffer.writeVString(key);

        this._writeValue(definedValue[key], buffer);
      }
    }
  }

  protected _writeString(value: string, buffer: ByteBuffer): void {
    if(value.length === 0) {
      buffer.writeUint8(TYPES.EMPTY_STRING);
    } else {
      buffer.writeUint8(TYPES.STRING);
      buffer.writeVString(value);
    }
  }

}

export {
  Encoder
};
