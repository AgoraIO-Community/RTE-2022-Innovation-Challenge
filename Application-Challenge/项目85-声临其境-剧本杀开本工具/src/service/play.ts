class Play {
  /**
   * 获取剧本内容
   * @param id 剧本ID
   * @returns 
   */
  getPlayInfo(id: number) {
    return {
      audios: [
        {
          name: "结尾音频",
          src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%BB%93%E5%B0%BE%E5%BD%A9%E8%9B%8B.mp3"
        },
        {
          name: "背景音乐1",
          src: "https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/28/f663cdcc-3367-4a15-8d2d-65fa4302c782/f663cdcc-3367-4a15-8d2d-65fa4302c782.mp3"
        },
        {
          name: "背景音乐2",
          src: "http://freetyst.nf.migu.cn/public/product5th/product35/2019/10/0916/2018%E5%B9%B412%E6%9C%8814%E6%97%A511%E7%82%B922%E5%88%86%E5%86%85%E5%AE%B9%E5%87%86%E5%85%A5%E7%A6%BE%E4%BF%A1%E9%A2%84%E7%95%99902%E9%A6%96/%E6%A0%87%E6%B8%85%E9%AB%98%E6%B8%85/MP3_128_16_Stero/69910478206.mp3?channelid=02&msisdn=f4dbbec4-ac43-42b9-995c-40c07d90911b&Tim=1660794550482&Key=8a180cdd79beb4f7"
        }
      ],
      videos: [
        {
          name: "视频1",
          src: ""
        }
      ],
      roles: [
        {
          id: 1,
          name: "DM",
          image: 'https://p0.meituan.net/roleplay/dda93d3f9d4c5268a421370abe49f2562621818825.png',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%BB%84%E7%BB%87%E8%80%85%E6%89%8B%E5%86%8C/%E7%BB%84%E7%BB%87%E8%80%85%E6%89%8B%E5%86%8C.PDF',
          choosed: false,
        },
        {
          id: 2,
          name: "袁本",
          image: 'https://p0.meituan.net/roleplay/f4198ca37f6af080d6bc0f3ddae1f872530181281.png',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E5%89%A7%E6%9C%AC/%E8%A2%81%E6%9C%AC.PDF',
          choosed: false,
        },
        {
          id: 3,
          name: "王小冉",
          image: 'https://p0.meituan.net/roleplay/500051c98d58c5ec3d5d0a4ccac8655e530668143.png',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E5%89%A7%E6%9C%AC/%E7%8E%8B%E5%B0%8F%E5%86%89.PDF',
          choosed: false,
        },
        {
          id: 4,
          name: "姚波",
          image: 'https://p0.meituan.net/roleplay/378c0eeb8f9c04fd9d4fb4e78896423a103715896.jpg',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E5%89%A7%E6%9C%AC/%E5%A7%9A%E6%B3%A2.PDF',
          choosed: false,
        },
        {
          id: 5,
          name: "陈烁",
          image: 'https://p0.meituan.net/roleplay/5459ea2d0fd3ee0b8a42a267e20cd561544014163.png',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E5%89%A7%E6%9C%AC/%E7%8E%8B%E5%B0%8F%E5%86%89.PDF',
          choosed: false,
        },
        {
          id: 6,
          name: "刘伯钊",
          image: 'https://p0.meituan.net/roleplay/8648220bf8862aa0a543ceb6174fb8cb516128541.png',
          play: 'https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E5%89%A7%E6%9C%AC/%E9%99%88%E6%A0%8E.PDF',
          choosed: false,
        },
      ],
      clues: [
        {
          name: "第一幕",
          data: [
            {
              name: "陈烁",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E9%99%88%E7%83%81%E4%B8%AA%E4%BA%BA%E7%BA%BF%E7%B4%A2.jpeg"
            },
            {
              name: "袁本",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E8%A2%81%E6%9C%AC%E4%B8%AA%E4%BA%BA%E7%BA%BF%E7%B4%A2.jpeg"
            },
            {
              name: "王小冉",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E7%8E%8B%E5%B0%8F%E5%86%89%E4%B8%AA%E4%BA%BA%E7%BA%BF%E7%B4%A2.jpeg"
            },
            {
              name: "姚波",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%A7%9A%E6%B3%A2%E4%B8%AA%E4%BA%BA%E7%BA%BF%E7%B4%A2.jpg"
            },
            {
              name: "刘伯钊",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%88%98%E4%BC%AF%E9%92%8A%E4%B8%AA%E4%BA%BA%E7%BA%BF%E7%B4%A2.png"
            }
          ]
        },
        {
          name: "第二幕",
          data: [
            {
              name: "公共线索",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A21.jpeg"
            },
            {
              name: "公共线索",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A22.jpeg"
            },
            {
              name: "大卡1",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A11.jpeg"
            },
            {
              name: "大卡2",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A12.jpeg"
            },
            {
              name: "大卡3",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A13.jpeg"
            },
            {
              name: "大卡4",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A14.jpeg"
            },
            {
              name: "大卡5",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A15.jpeg"
            },
            {
              name: "大卡3-深入",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A13%E6%B7%B1%E5%85%A5.jpeg"
            },
            {
              name: "大卡4-深入",
              src: "https://cwiki.cn/downloads/%E5%B9%B4%E8%BD%AE/%E7%94%B5%E5%AD%90%E7%89%88%E5%90%88%E5%B9%B6%E7%BA%BF%E7%B4%A2/%E5%85%AC%E5%85%B1%E7%BA%BF%E7%B4%A2-%E5%A4%A7%E5%8D%A14%E6%B7%B1%E5%85%A5.png"
            },
          ]
        },
      ]
    }
  }
}

export default new Play();