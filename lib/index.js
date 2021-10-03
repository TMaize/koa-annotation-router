"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = exports.mapping = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
function mapping(path, methods = 'get') {
    return function (target, name, descriptor) {
        let _target = target;
        if (target.prototype) {
            _target = target.prototype;
        }
        const mappings = _target.mappings || [];
        if (!Array.isArray(methods)) {
            methods = [methods];
        }
        methods.forEach(method => {
            mappings.push({ name: name, method: method, path: path });
        });
        _target.mappings = mappings;
    };
}
exports.mapping = mapping;
function controller(prefix) {
    return function (target) {
        target.prototype.mappingPrefix = prefix;
    };
}
exports.controller = controller;
function default_1(controllers) {
    const router = new koa_router_1.default();
    // registe routes
    controllers.forEach(controller => {
        const prefix = controller.mappingPrefix || '';
        const mappings = controller.mappings || [];
        mappings.forEach(mapping => {
            var _a, _b;
            const path = `${prefix}/${mapping.path}`.replace(/\/{2,}/g, '/');
            let fn = undefined;
            if (controller[mapping.name]) {
                fn = controller[mapping.name].bind(controller);
            }
            else {
                fn = (_b = (_a = controller === null || controller === void 0 ? void 0 : controller.__proto__) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b[mapping.name];
            }
            if (!fn) {
                throw new Error(`can't access ${mapping.name}`);
            }
            router[mapping.method](path, fn);
        });
    });
    return router.routes();
}
exports.default = default_1;
//# sourceMappingURL=index.js.map