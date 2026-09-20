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

const SETTLE = 300;

export default class PlusWebPlayground extends HTMLElement {
  #router?: Router;
  #compileTimer?: ReturnType<typeof setTimeout>;
  #timeTimer?: ReturnType<typeof setTimeout>;

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
      this.#router = await loadRouter(this.dataset.module ?? '');
    } catch {
      this.#part('note').textContent = 'The router could not load, so nothing here is live.';
      return;
    }

    this.dataset.state = 'ready';
    this.#part('note').textContent =
      `PlusWeb ${this.#router.version().commit}, compiled to WebAssembly and matching in this tab.`;

    this.#part<HTMLTextAreaElement>('source').addEventListener('input', () => {
      clearTimeout(this.#compileTimer);
      this.#compileTimer = setTimeout(() => this.#compile(), SETTLE);
    });
    this.#part<HTMLFormElement>('form').addEventListener('submit', event => event.preventDefault());
    this.#part<HTMLInputElement>('path').addEventListener('input', () => this.#match());
    this.#part<HTMLSelectElement>('method').addEventListener('change', () => this.#match());
    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-path]')) {
      button.addEventListener('click', () => {
        this.#part<HTMLSelectElement>('method').value = button.dataset.method ?? 'GET';
        this.#part<HTMLInputElement>('path').value = button.dataset.path ?? '/';
        this.#match();
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
        problem ||= `${method} ${pattern} — ${error instanceof Error ? error.message : 'rejected'}`;
      }
    }

    const count = this.#part('count');
    count.textContent = problem || `${registered} routes`;
    count.dataset.problem = String(Boolean(problem));
    this.#part('trie').replaceChildren(this.#tree(this.#router.dumpTrie().root.children));
    this.#match();
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

  #request(): [Method, string] {
    return [
      this.#part<HTMLSelectElement>('method').value as Method,
      this.#part<HTMLInputElement>('path').value.trim() || '/',
    ];
  }

  // Matching is cheap enough for every keystroke; timing is not, so it follows once typing stops.
  #match() {
    if (!this.#router) return;
    const [method, path] = this.#request();
    const { matched, params, pattern } = this.#router.dispatch(method, path);

    const bound = Object.entries(params)
      .map(([name, value]) => `${name}="${value}"`)
      .join(' ');

    this.#part('result').dataset.matched = String(matched);
    this.#part('match').textContent = matched
      ? `${pattern}${bound ? `  ${bound}` : ''}`
      : 'no route';
    this.#part('ns').textContent = '';

    clearTimeout(this.#timeTimer);
    this.#timeTimer = setTimeout(() => this.#time(), SETTLE);
  }

  #time() {
    if (!this.#router) return;
    const [method, path] = this.#request();
    this.#part('ns').textContent =
      `${this.#router.benchDispatch(method, path, BENCH_ITERATIONS).toFixed(0)} ns`;
  }
}

customElements.define('plusweb-playground', PlusWebPlayground);
