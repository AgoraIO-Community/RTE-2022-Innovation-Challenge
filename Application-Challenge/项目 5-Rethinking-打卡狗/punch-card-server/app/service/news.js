'use strict';

const Service = require('egg').Service;

class NewsService extends Service {
    async list(page = 1) {
        const { serverUrl, pageSize } = this.config.news;
        const { data: idList } = await this.ctx.curl(
            `${serverUrl}/topstories.json`,
            {
                data: {
                    orderBy: '"$key"',
                    startAt: `"${pageSize * (page - 1)}"`,
                    endAt: `"${pageSize * page - 1}"`,
                },
                dataType: 'json',
            },
        );

        // parallel GET detail
        const newsList = await Promise.all(
            Object.keys(idList).map((key) => {
                const url = `${serverUrl}/item/${idList[key]}.json`;
                return this.ctx.curl(url, { dataType: 'json' });
            }),
        );

        return newsList.map((res) => res.data);

    }
    async getUserList() {
        //查询库里的user表
        let userList = await this.app.mysql.query(
            'select * from user'
        );
        return userList;
        // console.log(this.ctx.query);//获取路径后面的参数
        // this.ctx.body = {
        //     code: 200,
        //     masg: 'success',
        //     data: userList
        // };
    }
}

module.exports = NewsService;
