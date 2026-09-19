import { facts } from '@src/data/facts';

export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type Method = (typeof methods)[number];

export const methodTone: Record<Method, 'get' | 'post' | 'delete'> = {
  GET: 'get',
  POST: 'post',
  PUT: 'post',
  PATCH: 'post',
  DELETE: 'delete',
};

const { threads, port, throughput } = facts.plusweb;

export const boilerplateTop = ['#include <plusweb/App.hpp>', 'pw::App app;'];

export const handlers = [
  'app.get("/health", [](Request& req, Response& res) {',
  '  res.json({ "status": "ok", "uptime_s": 41207 });',
  '});',
  '',
  'app.get("/users", [](Request& req, Response& res) {',
  '  res.json({ "users": ["123", "124"], "total": 2 });',
  '});',
  '',
  'app.get("/users/new", [](Request& req, Response& res) {',
  '  res.json({ "form": "create-user" });',
  '});',
  '',
  'app.get("/users/:id", [](Request& req, Response& res) {',
  '  res.json({ "id": req.param("id"), "name": "Ahmed" });',
  '});',
  '',
  'app.post("/users", [](Request& req, Response& res) {',
  '  res.status(201).json({ "created": true });',
  '});',
  '',
  'app.del("/users/:id", [](Request& req, Response& res) {',
  '  res.status(204);',
  '});',
];

export const boilerplateBottom = [
  `app.listen(${port});  // ${threads.acceptors} acceptor, ${threads.workers} workers`,
];

export interface WalkStep {
  segment: string;
  kind: 'method' | 'static' | 'param';
  bound?: string;
}

export const sampleRequest: { method: Method; path: string } = {
  method: 'GET',
  path: '/users/123',
};

const walk: WalkStep[] = [
  { segment: 'GET:', kind: 'method' },
  { segment: 'users', kind: 'static' },
  { segment: '123', kind: 'param', bound: 'id' },
];

export const sampleResponse = {
  status: '200 OK',
  matched: 'GET /users/:id',
  body: { id: '123', name: 'Ahmed' },
  walk,
  note: `no literal child matched that segment, so the router scanned this node’s children for a parameter and bound it. that scan is O(children) — invisible here, fatal at ${throughput[2].routes.toLocaleString('en-US')} routes.`,
};
