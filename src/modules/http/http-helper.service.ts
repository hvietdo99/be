import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { CommonGetDto } from '@modules/http/dto/common-get.dto';
import { CommonPostDto } from '@modules/http/dto/common-post.dto';

@Injectable()
export class HttpHelperService {
  async commonGet(dto: CommonGetDto): Promise<any> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const { data } = await axios.get(dto.url, {
        headers: dto.headers || defaultHeaders,
        params: dto.params,
      });

      return data;
    } catch (err) {
      console.log(err.response);
      throw err;
    }
  }

  async commonPost(dto: CommonPostDto): Promise<any> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const { data } = await axios.post(dto.url, dto.body, {
        headers: dto.headers || defaultHeaders,
      });

      return data;
    } catch (err) {
      console.log(err.response);
      throw err;
    }
  }
}
