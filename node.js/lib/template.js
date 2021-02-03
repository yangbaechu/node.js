module.exports = {
    HTML: function (title, list, body, control, writer){
        if (writer === ``){
            return `
  <!doctype html>
  <html>
  <head>
    <title>WEB 1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">W E B</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
        } else{
            return `
  <!doctype html>
  <html>
  <head>
    <title>WEB 1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">W E B</a></h1>
    ${list}
    ${control}
    <h4>글쓴이: ${writer}</h4>
    ${body}
  </body>
  </html>
  `;
        }

    }, list: function (filelist){
        var list = '<ul>';
        var i = 0;
        while(i < filelist.length){
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list+'</ul>';
        return list;
    }
}