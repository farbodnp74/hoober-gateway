// decompression.service.ts
import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib';

@Injectable()
export class DecompressionService {
  decompressData(data: string): any {
    const decompressedResult = zlib.gunzipSync(Buffer.from(data, 'base64')).toString();
    return JSON.parse(decompressedResult);
  }
}
