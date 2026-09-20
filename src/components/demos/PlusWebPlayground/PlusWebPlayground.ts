import {
  BENCH_ITERATIONS,
  type Method,
} from '@src/components/demos/PlusWebPlayground/_helpers/plusWebPlayground.consts';
import { routesFrom } from '@src/components/demos/PlusWebPlayground/_helpers/plusWebPlayground.functions';
import {
  loadRouter,
  type Router,
  type TrieNode,
} from '@src/components/demos/PlusWebPlayground/_helpers/plusWebPlayground.resolvers';

const RECOMPILE_DELAY = 250;

export default class PlusWebPlayground extends HTMLElement {
  #router?: Router;
  #timer?: ReturnType<typeof setTimeout>;

  #part<T extends HTMLElement>(name: string) {
    const element = this.querySelector<T>(`[data-pw="${name}"]`);
    if (!element) throw new Error(`PlusWebPlayground is missing [data-pw="${name}"]`);
    return element;
  }

  connectedCallback() {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void this.#start();
    });
    observer.observe(this);
  }

  async #start() {
    try {
      this.#router = await loadRouter();
    } catch {
      this.#part('note').textContent = 'The router could not load, so nothing here is live.';
      return;
    }

    this.dataset.state = 'ready';
    this.#part('note').textContent =
      `PlusWeb ${this.#router.version().commit}, compiled to WebAssembly and running in this tab.`;

    this.#part<HTMLTextAreaElement>('source').addEventListener('input', () => {
      clearTimeout(this.#timer);
      this.#timer = setTimeout(() => this.#compile(), RECOMPILE_DELAY);
    });
    this.#part<HTMLFormElement>('form').addEventListener('submit', event => {
      event.preventDefault();
      this.#send();
    });
    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-path]')) {
      button.addEventListener('click', () => {
        this.#part<HTMLSelectElement>('method').value = button.dataset.method ?? 'GET';
        this.#part<HTMLInputElement>('path').value = button.dataset.path ?? '/';
        this.#send();
      });
    }

    this.#compile();
  }

  #compile() {
    if (!this.#router) return;
    this.#router.reset();

    let registered = 0;
    let problem = '';
    for (const { method, pattern } of routesFrom(this.#part<HTMLTextAreaElement>('source').value)) {
      try {
        this.#router.registerRoute(method, pattern);
        registered += 1;
      } catch (error) {
        problem ||= `${method} ${pattern}: ${error instanceof Error ? error.message : 'rejected'}`;
      }
    }

    this.#part('count').textContent = problem || `${registered} routes`;
    this.#part('count').dataset.problem = String(Boolean(problem));
    this.#part('trie').replaceChildren(this.#tree(this.#router.dumpTrie().root.children));
    this.#send();
  }

  #tree(nodes: TrieNode[]): HTMLUListElement {
    const list = document.createElement('ul');
    for (const node of nodes) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.className = node.isParameter ? 'node param' : 'node';
      label.textContent = node.value;
      item.append(label);
      if (node.children.length) item.append(this.#tree(node.children));
      list.append(item);
    }
    return list;
  }

  #send() {
    if (!this.#router) return;
    const method = this.#part<HTMLSelectElement>('method').value as Method;
    const path = this.#part<HTMLInputElement>('path').value.trim() || '/';
    const { matched, params, pattern } = this.#router.dispatch(method, path);
    const nanos = this.#router.benchDispatch(method, path, BENCH_ITERATIONS);

    const bound = Object.entries(params)
      .map(([name, value]) => `${name}="${value}"`)
      .join(' ');

    const result = this.#part('result');
    result.dataset.matched = String(matched);
    result.textContent = matched
      ? `matched ${pattern}${bound ? `  ${bound}` : ''}  ·  ${nanos.toFixed(0)} ns`
      : `no route  ·  ${nanos.toFixed(0)} ns`;
  }
}

customElements.define('plusweb-playground', PlusWebPlayground);
