let file = './one8.json'
const fs = require('fs')
let data = require(file)
// let data = require('./colorDataP5.json')
// function getXInData(data, split_number) {
//   let keys = Object.keys(data)
//   let result = []
//   for(let i =0;i < keys.length;i++) {
//     if(i % split_number ==0) {
//       result.push(data[keys[i]])
//     }
//   }
//   return result
// }
// fs.writeFileSync('./one8.json', JSON.stringify(getXInData(data, 8)))

//  server
const Koa = require('koa');
var Router = require('koa-router');
const bodyParser = require('koa-bodyparser')

const app = new Koa();
app.use(bodyParser())

var router = new Router();
router.get('/koa/data', (ctx, next) => {
  console.log('get data')
  ctx.body = data
});

router.post('/koa/del', (ctx, next) => {
  let {r,g,b,a,uid} = ctx.request.body
  console.log('del ',uid)
  for(let i = 0; i< data.length; i++) {
    let item = data[i]
    if(item.uid == uid && item.r == r && item.g == g && item.b == b) {
      data.splice(i,1)
    }
  }
  let removed = fs.readFileSync('./removed')
  removed += uid + '\n'
  fs.writeFileSync('./removed',removed)
  fs.writeFileSync(file, JSON.stringify(data))
  ctx.body = {msg: 'ok'}
})

app
  .use(router.routes())
  .use(router.allowedMethods());



app.listen(3000);