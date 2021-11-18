# koa-annotation-router

拓展 [@koa/router](https://github.com/koajs/router)，使其支持注解风格路由写法

```js
import { Router, controller, mapping } from 'koa-annotation-router'
```

`controller` 和 `mapping` 用于装饰类和方法定义访问路径

`Router` 继承自 `@koa/router` 增加了 `addController` 方法用于注册被装饰的类，增加了 `printRoutes` 方法用于打印所有注册的路由

```
┌─────────┬────────┬────────────────────┬──────────────────────────────┐
│ (index) │ method │        path        │            caller            │
├─────────┼────────┼────────────────────┼──────────────────────────────┤
│    0    │ 'GET'  │ '/api/user/hello'  │ 'new UserController().hello' │
│    1    │ 'POST' │ '/api/user/update' │   'UserController.update'    │
│    2    │ 'GET'  │      '/hello'      │              ''              │
└─────────┴────────┴────────────────────┴──────────────────────────────┘
```

## 安装

注意：不需要再安装 `@koa/router` 或者 `koa-router` 了

```bash
yarn add koa-annotation-router
```

## 使用

参考 [test/index.ts](./test/index.ts)，[test/demo.ts](./test/demo.ts)

```ts
import Koa, { Context } from 'koa'
import { Router, controller, mapping } from 'koa-annotation-router'

@controller('/api/user')
class UserController {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @mapping('/hello')
  public async hello(ctx: Context) {
    ctx.response.body = `hello ${this.name}`
  }

  @mapping('/update', ['post'])
  public static async update(ctx: Context) {
    ctx.response.body = {
      code: 200,
      data: null,
      msg: 'ok'
    }
  }
}

const router = new Router()
router.addController(new UserController('tom'))
router.get('/hello', async function (ctx: Context) {
  ctx.response.body = `hello`
})

const app = new Koa().use(router.routes())
app.listen(3000)
```
