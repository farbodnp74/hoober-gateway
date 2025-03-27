// compression.service.ts
import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib';

@Injectable()
export class CompressionService {
  compressData(data: any): string {
    const jsonInput = JSON.stringify(data);
    const compressedInput = zlib.gzipSync(jsonInput);
    return compressedInput.toString('base64');
  }
}
