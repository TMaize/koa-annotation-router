import Koa, { Context } from 'koa'
import { Router, controller, mapping } from '../index'

@controller('/animal')
class AnimalController {
  name: string

  constructor(name: string) {
    this.name = name
  }

  @mapping('bark', ['post'])
  public static async bark(ctx: Context) {
    ctx.body = 'w~ w~ w~'
  }

  @mapping('say')
  public async say(ctx: Context) {
    ctx.body = `I'm ${this.name}`
  }
}

@controller()
class DogController extends AnimalController {
  @mapping('/dog/say')
  public async say(ctx: Context) {
    await super.say(ctx)
  }
}

// 打印注解附加的信息， 子类和父类之间的路由不存在继承关系
console.log(JSON.stringify((AnimalController as any).annotation.router, null, 2) + '\n\n')
console.log(JSON.stringify((DogController as any).annotation.router, null, 2) + '\n\n')

const app = new Koa()
const router = new Router({ prefix: '/global-prefix' })
router.addController(new AnimalController('animal'), new DogController('doge'))

app.use(async function (ctx: Context, next: () => Promise<any>) {
  console.log(ctx.request.path)
  await next()
})

app.use(router.routes())

// 打印koa所有的路由
router.printRoutes()

app.listen(3000)
