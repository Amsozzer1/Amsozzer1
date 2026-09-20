export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type Method = (typeof methods)[number];

export const methodTone: Record<Method, 'get' | 'post' | 'delete'> = {
  GET: 'get',
  POST: 'post',
  PUT: 'post',
  PATCH: 'post',
  DELETE: 'delete',
};

export const boilerplateTop = ['#include <PlusWeb/HttpServer.h>', '', 'HttpServer app(3000);'];

export const handlers = [
  'app.GET("/health", [](HttpRequest& req, HttpResponse& res) {',
  '  res.send(json{ {"status", "ok"} });',
  '});',
  '',
  'app.GET("/users", [](HttpRequest& req, HttpResponse& res) {',
  '  res.send(json{ {"total", 2} });',
  '});',
  '',
  'app.GET("/users/new", [](HttpRequest& req, HttpResponse& res) {',
  '  res.send(json{ {"form", "create-user"} });',
  '});',
  '',
  'app.GET("/users/:id", [](HttpRequest& req, HttpResponse& res) {',
  '  res.send(json{ {"id", req.params["id"]} });',
  '});',
  '',
  'app.POST("/users", [](HttpRequest& req, HttpResponse& res) {',
  '  res.status(201).send(json{ {"created", true} });',
  '});',
  '',
  'app.DELETE("/users/:id", [](HttpRequest& req, HttpResponse& res) {',
  '  res.status(204).send("");',
  '});',
];

export const boilerplateBottom = ['app.serve();'];

export const sampleRequest: { method: Method; path: string } = {
  method: 'GET',
  path: '/users/123',
};

// Paths worth trying, each of which shows the router doing something specific.
export const suggestions: { method: Method; path: string; why: string }[] = [
  { method: 'GET', path: '/users/123', why: 'binds :id' },
  { method: 'GET', path: '/users/new', why: 'literal beats the parameter' },
  { method: 'POST', path: '/users', why: 'the method is part of the key' },
  { method: 'GET', path: '/users', why: 'same path, different method' },
  { method: 'DELETE', path: '/users/7', why: 'binds :id on another method' },
  { method: 'GET', path: '/nope', why: 'a miss' },
];

export const BENCH_ITERATIONS = 200_000;
