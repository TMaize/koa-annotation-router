# koa-annotation-router

koa 注解风格路由

```js
import Router, { controller, mapping } from 'koa-annotation-router'
const app = new Koa()

@controller('/api/user')
class UserController {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @mapping('/ping')
  public static ping(ctx: Context) {
    ctx.response.body = `pong`
  }

  @mapping('/info', ['all'])
  public info(ctx: Context) {
    // can use this
    ctx.response.body = `hello ${this.name}`
  }
}

app.use(Router([new UserController('ming'), ...]))

app.listen(8080)

```
