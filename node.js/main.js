const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
//const mime = require('mime'); //이미지 형식 알아보는 모듈

const app = http.createServer(function(request,response){
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        if(queryData.id === undefined){ //메인 화면
            fs.readdir('./data', function(error, fileList){
                let title = 'Welcome';
                let description = 'Hello, Node.js';
                let list = template.list(fileList);
                let html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else { //하위 글 중 하나를 클릭했을 때
            fs.readdir('./data', function(error, fileList){

                let filteredId = path.parse(queryData.id).base;

                fs.readFile(`data/${filteredId}`, 'utf8', function(err, data){
                    let text = JSON.parse(data);
                    let title = text.title;
                    let description = text.description;
                    let writer = text.writer;
                    let list = template.list(fileList);
                    let sanitizedTitle = sanitizeHtml(title);
                    let sanitizedDescription = sanitizeHtml(description);
                    let html = template.HTML(title, list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`,
                        writer
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){ //create 버튼 클릭한 뒤
        fs.readdir('./data', function(error, fileList){
            let title = 'WEB - create';
            let list = template.list(fileList);
            let html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><input type="text" name="writer" placeholder="writer"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '', ``);
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){ //새 파일 만들고 난 뒤
        let body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            let title = post.title;
            let writer = post.writer;
            let description = post.description;
            console.log(writer);
            let text = {
                "title": title,
                "writer": writer,
                "description": description
            }

            let data = JSON.stringify(text, null);
            fs.writeFile(`data/${title}`, data, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            })
        });
    } else if(pathname === '/update'){ //update 버튼 클릭한 뒤
        fs.readdir('./data', function(error, fileList){
            let filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, data){
                let text = JSON.parse(data);
                let title = text.title;
                let description = text.description;
                let writer = text.writer;
                let list = template.list(fileList);
                let html = template.HTML(title, list,
                    `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p><input type="text" name="writer" placeholder="writer" value="${writer}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`, ``
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process') {//글 업데이트 한 뒤
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            let id = post.id; //원래 글의 제목
            let title = post.title;
            let writer = post.writer;
            let description = post.description;
            let text = {
                "title": title,
                "writer": writer,
                "description": description
            }
            let updated_data = JSON.stringify(text, null);
            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${title}`, updated_data, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                })
            });
        })
    } else if(pathname === '/delete_process'){//글 삭제한 뒤
        let body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            let id = post.id;
            //let filteredId = path.parse(queryData.id).base;
            fs.unlink(`data/${id}`, function (error){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    } else {//잘못된 url 입력시
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);