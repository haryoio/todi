import RegistryBase from "./registry.ts";
import { InterceptorOptions } from "./types.ts";

import {
    PostResolutionInterceptorCallback,
    PreResolutionInterceptorCallback,
} from "./interfaces/container.ts"


export type PreResolutionInterceptor = {
    callback: PreResolutionInterceptorCallback;
    options: InterceptorOptions;
}

export type PostResolutionInterceptor = {
    callback: PostResolutionInterceptorCallback;
    options: InterceptorOptions;
}

export class PreResolutionInterceptors extends RegistryBase<PreResolutionInterceptor> { }
export class PostResolutionInterceptors extends RegistryBase<PostResolutionInterceptor> { }

export default class Interceptors {
    public preResolutions: PreResolutionInterceptors = new PreResolutionInterceptors()
    public postResolutions: PostResolutionInterceptors = new PostResolutionInterceptors()
}
