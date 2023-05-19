import http from 'http';
import url from 'url';

export const config = {
    runtime: 'edge', // 指定函数的运行时
};

export default async (req, res) => {
    const { query, body, headers } = req;

    // 从路径中提取 path
    const { pathname } = url.parse(req.url);
    const path = pathname.substring(1); // 去除路径中的斜杠 "/"

    // 发起 HTTP 请求
    const requestOptions = {
        method: req.method,
        url: `https://${path}`,
        headers: {
            ...headers,
        },
        data: body, // 这里可以设置请求的数据（如果有）
    };

    try {
        await sendHttpRequest(requestOptions, res);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

function sendHttpRequest(options, res) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (response) => {
            res.statusCode = response.statusCode;
            res.setHeader('Content-Type', response.headers['content-type']);

            response.pipe(res);

            response.on('end', () => {
                resolve();
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.data) {
            req.write(options.data);
        }

        req.end();
    });
}
