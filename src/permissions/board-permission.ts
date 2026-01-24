import { Injectable, ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import { BoardRole } from 'src/common/board-role.enum';

@Injectable()
export class BoardPermissionClient {
  private boardServiceUrl = process.env.BOARD_SERVICE_URL!;
  private internalKey = process.env.INTERNAL_KEY!;

  async getRole(boardId: string, userId: string): Promise<BoardRole | 'NONE'> {
    try {
      const res = await axios.get(
        `${this.boardServiceUrl}/internal/boards/${boardId}/permission`,
        {
          params: { userId },
          headers: { 'x-internal-key': this.internalKey },
          timeout: 5000,
        },
      );

      return res.data?.role ?? 'NONE';
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 403 || status === 404) return 'NONE';

      console.error('Board permission call failed:', {
        url: `${this.boardServiceUrl}/internal/boards/${boardId}/permission`,
        status,
        data: err.response?.data,
        message: err.message,
      });

      throw err;
    }
  }

  async requireWrite(boardId: string, userId: string) {
    const role = await this.getRole(boardId, userId);
    if (role !== BoardRole.OWNER && role !== BoardRole.EDITOR) {
      throw new ForbiddenException(
        'No permission to modify tasks for this board',
      );
    }
    return role;
  }

  async requireRead(boardId: string, userId: string) {
    const role = await this.getRole(boardId, userId);
    if (role === 'NONE') {
      throw new ForbiddenException('No access to this board');
    }
    return role;
  }
}
