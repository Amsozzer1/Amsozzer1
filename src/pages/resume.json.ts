import type { APIRoute } from 'astro';
import resume from '@src/data/resume.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(resume, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
