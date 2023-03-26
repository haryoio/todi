import { Registration } from "./registration.ts";

export class ResolutionContext {
  scopedResolutions: Map<Registration, any> = new Map();
}
