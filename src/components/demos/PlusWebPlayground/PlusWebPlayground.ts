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

const nanos = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(2)} µs` : `${value.toFixed(1)} ns`;

export default class PlusWebPlayground extends HTMLElement {
  #router?: Router;

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
    const status = this.#part('status');
    try {
      this.#router = await loadRouter();
    } catch {
      status.textContent = 'The router could not be loaded, so this demo is showing nothing live.';
      return;
    }

    const { version, commit } = this.#router.version();
    status.textContent = `PlusWeb ${version} (${commit}), compiled to WebAssembly and running in this tab.`;

    this.#compile();
    this.dataset.state = 'ready';

    this.#part<HTMLFormElement>('form').addEventListener('submit', event => {
      event.preventDefault();
      this.#dispatch();
    });
    this.#part<HTMLButtonElement>('bench').addEventListener('click', () => this.#bench());
    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-path]')) {
      button.addEventListener('click', () => {
        this.#part<HTMLSelectElement>('method').value = button.dataset.method ?? 'GET';
        this.#part<HTMLInputElement>('path').value = button.dataset.path ?? '/';
        this.#dispatch();
      });
    }
  }

  // The route lines are the router's real input; the handler bodies are not compiled.
  #compile() {
    if (!this.#router) return;
    this.#router.reset();

    const source = this.#part('source').textContent ?? '';
    for (const { method, pattern } of routesFrom(source)) {
      this.#router.registerRoute(method, pattern);
    }

    const { routeCount, root } = this.#router.dumpTrie();
    this.#part('count').textContent = `${routeCount} routes in the trie`;
    this.#part('trie').replaceChildren(this.#tree(root.children));
  }

  #tree(nodes: TrieNode[]): HTMLUListElement {
    const list = document.createElement('ul');
    for (const node of nodes) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.className = node.isParameter ? 'node param' : 'node';
      label.textContent = node.value;
      item.append(label);
      if (node.hasHandler) {
        const handler = document.createElement('span');
        handler.className = 'handler';
        handler.textContent = 'handler';
        item.append(' ', handler);
      }
      if (node.children.length) item.append(this.#tree(node.children));
      list.append(item);
    }
    return list;
  }

  #dispatch() {
    if (!this.#router) return;
    const method = this.#part<HTMLSelectElement>('method').value as Method;
    const path = this.#part<HTMLInputElement>('path').value.trim() || '/';
    const result = this.#router.dispatch(method, path);

    const params = Object.entries(result.params);
    this.#part('result').replaceChildren(
      ...[
        ['status', result.matched ? '200 matched' : '404 no route'],
        ['route', result.pattern ?? '—'],
        ['params', params.length ? params.map(([k, v]) => `${k} = "${v}"`).join(', ') : 'none'],
      ].flatMap(([term, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = value;
        return [dt, dd];
      }),
    );
    this.#part('result').dataset.matched = String(result.matched);
  }

  #bench() {
    if (!this.#router) return;
    const method = this.#part<HTMLSelectElement>('method').value;
    const path = this.#part<HTMLInputElement>('path').value.trim() || '/';
    const perOperation = this.#router.benchDispatch(method, path, BENCH_ITERATIONS);
    this.#part('bench-result').textContent =
      `${nanos(perOperation)} per lookup, best of three runs of ${BENCH_ITERATIONS.toLocaleString('en-US')}`;
  }
}

customElements.define('plusweb-playground', PlusWebPlayground);
