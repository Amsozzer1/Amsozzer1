export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type Method = (typeof methods)[number];

export const methodTone: Record<Method, 'get' | 'post' | 'delete'> = {
  GET: 'get',
  POST: 'post',
  PUT: 'post',
  PATCH: 'post',
  DELETE: 'delete',
};

// One line per route, no handler bodies: only the method and the pattern reach the router.
export const source = [
  'app.GET("/health", health);',
  'app.GET("/users", listUsers);',
  'app.GET("/users/new", newUserForm);',
  'app.GET("/users/:id", showUser);',
  'app.POST("/users", createUser);',
  'app.DELETE("/users/:id", deleteUser);',
].join('\n');

export const sampleRequest: { method: Method; path: string } = {
  method: 'GET',
  path: '/users/123',
};

export const examples: { method: Method; path: string }[] = [
  { method: 'GET', path: '/users/123' },
  { method: 'GET', path: '/users/new' },
  { method: 'GET', path: '/nope' },
];

export const BENCH_ITERATIONS = 50_000;
