import { MockApiError } from './errors';

export interface HandlerContext {
  params: Record<string, string>;
  body: unknown;
  query: URLSearchParams;
}

export type RouteHandler = (ctx: HandlerContext) => unknown | Promise<unknown>;

interface Route {
  method: string;
  segments: string[];
  handler: RouteHandler;
}

const routes = new Map<string, Route>();

export function registerRoute(method: string, path: string, handler: RouteHandler): void {
  const normalizedMethod = method.toUpperCase();
  routes.set(`${normalizedMethod} ${path}`, {
    method: normalizedMethod,
    segments: path.split('/').filter(Boolean),
    handler,
  });
}

export async function dispatch(method: string, url: string, body: unknown): Promise<unknown> {
  const [pathname, queryString] = url.split('?');
  const urlSegments = pathname.split('/').filter(Boolean);
  const query = new URLSearchParams(queryString ?? '');
  const normalizedMethod = method.toUpperCase();

  for (const route of routes.values()) {
    if (route.method !== normalizedMethod) continue;
    if (route.segments.length !== urlSegments.length) continue;

    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < route.segments.length; i += 1) {
      const segment = route.segments[i];
      if (segment.startsWith(':')) {
        params[segment.slice(1)] = decodeURIComponent(urlSegments[i]);
      } else if (segment !== urlSegments[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return route.handler({ params, body, query });
    }
  }

  throw new MockApiError(404, `No mock route for ${normalizedMethod} ${pathname}`);
}
