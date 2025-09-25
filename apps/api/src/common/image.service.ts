import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageSanitizerService {
  // ダミー: 実際のEXIF削除やウイルススキャンは外部ワーカーで実装予定
  async sanitize(buffer: Buffer): Promise<Buffer> {
    return buffer;
  }
}
