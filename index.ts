import KoaRouter from '@koa/router'
import * as Koa from 'koa'

export type MethodName = 'get' | 'post' | 'put' | 'link' | 'unlink' | 'delete' | 'head' | 'options' | 'patch' | 'all'

interface AnnotationConfig {
  class: string
  prefix: string
  mappings: MappingItem[]
}

interface MappingItem {
  method: MethodName
  function: string
  path: string
  isStatic: boolean
}

function getAnnotationRouter(target: Function | Object): AnnotationConfig {
  const constructor = (typeof target === 'function' ? target : target.constructor) as any
  // annotation 挂在类上，继承后要防止修改父类的annotation
  if (!Object.hasOwnProperty.call(constructor, 'annotation')) {
    constructor.annotation = {}
  }
  const annotation = constructor.annotation
  if (!annotation.router) {
    annotation.router = {
      class: '',
      mappings: []
    }
  }
  return annotation.router
}

export function mapping(path?: string, methods: MethodName | MethodName[] = 'get'): MethodDecorator {
  return function (target: Object | Function, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const router = getAnnotationRouter(target)

    if (!Array.isArray(methods)) {
      methods = [methods]
    }
    const isStatic = typeof target === 'function'
    methods.forEach(method => {
      router.mappings.push({ function: name, method, path, isStatic })
    })
  }
}

export function controller(prefix: string = '/'): ClassDecorator {
  return function (target: Function) {
    const router = getAnnotationRouter(target)
    router.prefix = prefix || '/'
    router.class = target.name
  }
}

export class Router<StateT = Koa.DefaultState, ContextT = Koa.DefaultContext> extends KoaRouter<StateT, ContextT> {
  constructor(opt?: KoaRouter.RouterOptions) {
    super(opt)
  }

  public addController(controller: any, ...more: Array<any>): Router<StateT, ContextT> {
    const controllers = []
    if (Array.isArray(controller)) {
      controllers.push(...controller)
    } else {
      controllers.push(controller)
    }
    if (more && more.length) {
      controllers.push(...more)
    }
    // register routes
    controllers.forEach(controller => {
      if (!controller?.constructor?.annotation?.router) {
        return
      }
      const annotationRouter = getAnnotationRouter(controller)

      // 没有@controller注解
      if (!annotationRouter.class) return

      const prefix = annotationRouter.prefix
      const mappings = annotationRouter.mappings
      mappings.forEach(mapping => {
        const path = `${prefix}/${mapping.path}`.replace(/\/{2,}/g, '/').replace(/(^\s*)|(\s*$)/g, '')
        let fn = undefined
        if (controller[mapping.function]) {
          fn = controller[mapping.function].bind(controller)
          fn.prettyName = `new ${annotationRouter.class}().${mapping.function}`
        } else {
          fn = ((controller as Object).constructor as any)[mapping.function].bind(undefined)
          fn.prettyName = `${annotationRouter.class}.${mapping.function}`
        }
        this[mapping.method](path, fn)
      })
    })

    return this
  }

  public printRoutes(): Array<Record<string, string>> {
    let table: Array<Record<string, string>> = []
    this.stack.forEach(item => {
      item.methods.forEach(method => {
        if (method === 'HEAD') {
          return
        }

        table.push({
          method: method,
          path: item.path,
          caller: (item.stack[0] as any).prettyName || (item.stack[0] as any).name
        })
      })
    })
    console.table(table)
    return table
  }
}
