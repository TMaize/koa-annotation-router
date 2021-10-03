import Router from 'koa-router';
export declare type MethodName = 'get' | 'post' | 'put' | 'link' | 'unlink' | 'delete' | 'head' | 'options' | 'patch' | 'all';
export declare function mapping(path: string, methods?: MethodName | MethodName[]): (target: any, name: string, descriptor: any) => void;
export declare function controller(prefix: string): (target: any) => void;
export default function (controllers: any[]): Router.IMiddleware;
