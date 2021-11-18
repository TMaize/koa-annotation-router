import Koa, { Context } from 'koa'
import { Router, controller, mapping } from '../index'

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
