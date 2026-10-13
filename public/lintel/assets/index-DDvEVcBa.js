(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');
`,t=`create table public.invoices (
  id bigint generated always as identity primary key,
  customer_id uuid not null references auth.users (id),
  amount_cents integer not null,
  card_last4 text not null
);
create index invoices_customer_id_idx
  on public.invoices (customer_id);
`,n=`${e}
insert into public.invoices
  (customer_id, amount_cents, card_last4)
values
  ('11111111-1111-1111-1111-111111111111', 4900, '4242'),
  ('22222222-2222-2222-2222-222222222222', 4900, '1881');
`,r=[{id:`leaky`,label:`Leaky table`,migration:`-- Invoices. Row level security is never enabled.\n${t}`,seed:n},{id:`fixed`,label:`Fixed table`,migration:`-- The same table, with RLS on and a policy:
-- customers see their own invoices.
${t}alter table public.invoices enable row level security;

create policy "customers read their invoices"
  on public.invoices for select to authenticated
  using ((select auth.uid()) = customer_id);
`,seed:n},{id:`true-for-anon`,label:`using (true) for anon`,migration:`-- RLS is on, but the policies let the anon key in.
create table public.feedback (
  id bigint generated always as identity primary key,
  email text not null,
  message text not null
);
alter table public.feedback enable row level security;

create policy "anyone can read feedback"
  on public.feedback for select to anon
  using (true);

create policy "anyone can send feedback"
  on public.feedback for insert to anon
  with check (true);
`,seed:`insert into public.feedback (email, message) values
  ('ada@example.com', 'the export button is broken again'),
  ('bob@example.com', 'please add dark mode');
`},{id:`clean`,label:`Clean`,migration:`-- Profiles: signed-in users read them all and
-- edit only their own.
create table public.profiles (
  id uuid primary key
    references auth.users (id) on delete cascade,
  username text not null unique
);
alter table public.profiles enable row level security;

create policy "signed-in users read profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
`,seed:`${e}
insert into public.profiles (id, username) values
  ('11111111-1111-1111-1111-111111111111', 'ada'),
  ('22222222-2222-2222-2222-222222222222', 'bob');
`}];function i(e){let{schema:t,name:n}=e.object;return[t,n].filter(Boolean).join(`.`)||`(database)`}function a(e){let t=t=>e.filter(e=>e.level===t).length;return`${t(`error`)} error, ${t(`warn`)} warn, ${t(`info`)} info`}function o(e){return e===`no rows to probe`?`anon can query it, but it has no rows, so P001 can't prove whether RLS hides them. Add rows to seed.sql.`:e}var s=(e,t=`text`)=>({text:e,tone:t});function c(e){return[[s(`  `),s(e.level.padEnd(5),e.level),s(` `),s(i(e),`object`),s(` `),s(e.rule,`rule`),...e.source===`probe`?[s(` [proven]`,`proven`)]:[]],[s(`        `),s(e.message)]]}function l(e){let t=[[s(`lintel ${e.lintel_version} · ${e.target.label}`,`meta`)],[]];for(let n of[`error`,`warn`,`info`]){let r=e.findings.filter(e=>e.level===n);r.length&&t.push(...r.flatMap(c),[])}e.findings.length||t.push([s(`  no findings`,`clean`)],[]);let n=e.probes.unverified??[];for(let e of n)t.push([s(`  `),s(`-`.padEnd(5),`meta`),s(` `),s(`${e.schema}.${e.name}`,`object`),s(` `),s(`P001`,`rule`),s(` [unverified_no_rows]`,`meta`)],[s(`        `),s(o(e.reason))]);return n.length&&t.push([]),t.push([s(`${e.findings.length} findings (${a(e.findings)})${n.length?` · ${n.length} unverified`:``}`,`meta`)]),t}var u=2e4,d=e=>document.getElementById(e),f=d(`migration`),p=d(`seed`),m=d(`run`),h=d(`status`),g=d(`output-beam`),_=d(`beam-fill`),v=d(`results`),y=d(`meta`),b,x=!1,S,C=1,w=/Mac|iPhone|iPad/.test(navigator.platform),T=d(`examples`);r.forEach((e,t)=>{t&&T.append(z(`span`,`examples-sep`,`·`));let n=z(`button`,`example`,e.label);n.type=`button`,n.dataset.id=e.id,n.setAttribute(`aria-pressed`,`false`),n.addEventListener(`click`,()=>{f.value=e.migration,p.value=e.seed,O(e.id),x&&M()}),T.append(n)});var E=r[0],D=!1;E&&(f.value=E.migration,p.value=E.seed,D=!0);function O(e){for(let t of T.querySelectorAll(`.example`))t.setAttribute(`aria-pressed`,String(t.dataset.id===e))}O(E?.id);for(let e of[f,p])e.addEventListener(`input`,()=>O());function k(){x=!1,b=new Worker(new URL(`/lintel/assets/worker-CdkMrUHm.js`,``+import.meta.url),{type:`module`}),b.onmessage=e=>j(e.data),b.onerror=()=>R(`The engine failed to start. Reload the page to try again.`),A({type:`boot`,base:new URL(`/lintel/`,location.href).href}),g.classList.add(`loading`),_.style.width=`0`,R(`Loading Postgres…`)}var A=e=>b.postMessage(e);function j(e){switch(e.type){case`progress`:{let t=Math.round(100*e.loaded/e.total);_.style.width=`${t}%`,R(`Postgres is loading…`),y.textContent=`loading · ${t}%`;return}case`starting`:R(`Starting Postgres and loading Supabase’s roles and schemas…`),y.textContent=`starting`;return;case`ready`:x=!0,g.classList.remove(`loading`),y.textContent=``,m.disabled=!1,L(),D&&(D=!1,M());return;case`failed`:R(`The engine failed to start: ${e.message}`);return;case`started`:S?.id===e.id&&(S.watchdog=setTimeout(()=>N(!0),u));return;case`result`:if(S?.id!==e.id)return;clearTimeout(S.watchdog),S=void 0,m.disabled=!1,P(e.outcome),L()}}function M(){if(!x||S)return;S={id:C++},m.disabled=!0,v.classList.add(`stale`),h.replaceChildren(`Checking… `);let e=z(`button`,`stop`,`stop`);e.type=`button`,e.addEventListener(`click`,()=>N(!1)),h.append(e),A({type:`run`,id:S.id,migration:f.value,seed:p.value})}function N(e){S&&clearTimeout(S.watchdog),S=void 0,b.terminate(),m.disabled=!0,v.classList.remove(`stale`),y.textContent=``,v.replaceChildren(B(`empty`,e?`Stopped after ${u/1e3} seconds. Something in the migration kept running, and Postgres in the browser can’t cancel a query, so the engine was restarted.`:`Stopped. The engine is restarting.`)),k()}function P(e){v.classList.remove(`stale`),y.textContent=`${e.ms<1e3?`${e.ms} ms`:`${(e.ms/1e3).toFixed(1)} s`}`,v.replaceChildren(...I(e.ok?l(e.report):F(e.error)))}function F(e){let t=[[{text:`error`,tone:`error`},{text:` `,tone:`text`},{text:e.code,tone:`object`},{text:`: ${e.message}`,tone:`text`}]];e.cause&&t.push([{text:`  likely cause: `,tone:`meta`},{text:e.cause,tone:`text`}]);let n=e.hint?.split(`try: `)[1];if(n&&t.push([{text:`  try: `,tone:`meta`},{text:n,tone:`object`}]),e.details){t.push([]);for(let n of e.details.split(`
`))t.push([{text:`  ${n}`,tone:`meta`}])}return t}function I(e){return e.map((e,t)=>{if(!e.length)return z(`div`,`gap`);let n=z(`p`,`line`);/^ {8}/.test(e[0]?.text??``)&&t>0?n.classList.add(`line-message`):/^(error|warn|info|-)\s*$/.test(e[1]?.text??``)&&n.classList.add(`line-head`);for(let t of e)n.append(t.tone===`text`&&!t.text.trim()?t.text:z(`span`,`t-${t.tone}`,t.text));return n})}function L(){h.replaceChildren(z(`span`,`status-key`,`${w?`⌘`:`Ctrl`} + Enter to check`))}function R(e){h.textContent=e}function z(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n!==void 0&&(r.textContent=n),r}var B=(e,t)=>z(`p`,e,t);m.addEventListener(`click`,M),document.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.metaKey||e.ctrlKey)&&(e.preventDefault(),M())}),document.readyState===`complete`?setTimeout(k,0):addEventListener(`load`,()=>setTimeout(k,0),{once:!0});