import Router from 'koa-router'

export type MethodName = 'get' | 'post' | 'put' | 'link' | 'unlink' | 'delete' | 'head' | 'options' | 'patch' | 'all'

interface MappingItem {
  method: MethodName
  name: string
  path: string
}

export function mapping(path: string, methods: MethodName | MethodName[] = 'get') {
  return function (target: any, name: string, descriptor: any) {
    let _target = target
    if (target.prototype) {
      _target = target.prototype
    }

    const mappings: MappingItem[] = _target.mappings || []
    if (!Array.isArray(methods)) {
      methods = [methods]
    }

    methods.forEach(method => {
      mappings.push({ name: name, method: method, path: path })
    })

    _target.mappings = mappings
  }
}

export function controller(prefix: string) {
  return function (target: any) {
    target.prototype.mappingPrefix = prefix
  }
}

export default function (controllers: any[]): Router.IMiddleware {
  const router = new Router()

  // registe routes
  controllers.forEach(controller => {
    const prefix: string = controller.mappingPrefix || ''
    const mappings: MappingItem[] = controller.mappings || []

    mappings.forEach(mapping => {
      const path = `${prefix}/${mapping.path}`.replace(/\/{2,}/g, '/')
      let fn = undefined
      if (controller[mapping.name]) {
        fn = controller[mapping.name].bind(controller)
      } else {
        fn = controller?.__proto__?.constructor?.[mapping.name]
      }
      if (!fn) {
        throw new Error(`can't access ${mapping.name}`)
      }

      router[mapping.method](path, fn)
    })
  })

  return router.routes()
}
