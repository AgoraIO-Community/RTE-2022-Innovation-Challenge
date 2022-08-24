import request, { requestHTML } from '@/utils/request';

export interface RES {
  code: number;
  message: string;
  data: any;
}

export async function getPapers(apiUrl: string, token: string) {
  return request({
    url: `${apiUrl}`,
    method: 'POST',
  });
}

export async function changePapers(apiUrl: string, token: string) {
  return request({
    url: `${apiUrl}`,
    method: 'POST',
  });
}

export default {};
