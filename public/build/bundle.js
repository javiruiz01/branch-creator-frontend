
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const existingToken = localStorage.getItem('AZURE_PAT');
    const token = writable(existingToken ? existingToken : '');
    token.subscribe(value => localStorage.setItem('AZURE_PAT', value));

    const newBranchName = writable('');

    const selectedTheme = localStorage.getItem('THEME');
    const theme = writable(selectedTheme ? selectedTheme : 'light');
    theme.subscribe(value => localStorage.setItem('THEME', value));

    /* src\Components\Footer.svelte generated by Svelte v3.18.2 */

    const file = "src\\Components\\Footer.svelte";

    function create_fragment(ctx) {
    	let footer;
    	let t0;
    	let span;
    	let t2;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			t0 = text("Crafted with\r\n  ");
    			span = element("span");
    			span.textContent = "♥";
    			t2 = text("\r\n  by\r\n  ");
    			a = element("a");
    			a.textContent = "@javiruiz06";
    			set_style(span, "color", "var(--color-dark-red)");
    			add_location(span, file, 26, 2, 455);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://twitter.com/javiruiz06");
    			attr_dev(a, "rel", "noreferrer");
    			attr_dev(a, "class", "svelte-86rdu2");
    			add_location(a, file, 28, 2, 517);
    			attr_dev(footer, "class", "svelte-86rdu2");
    			add_location(footer, file, 24, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, t0);
    			append_dev(footer, span);
    			append_dev(footer, t2);
    			append_dev(footer, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const workItemTypes = {
      Bug: { color: 'rgb(204, 41, 61)', type: 'bug' },
      Enabler: { color: 'rgb(96, 175, 73)', type: 'enabler' },
      Epic: { color: 'rgb(255, 123, 0)', type: 'epic' },
      Feature: { color: 'rgb(119, 59, 147)', type: 'feature' },
      Issue: { color: 'rgb(96, 175, 73)', type: 'issue' },
      Kaizen: { color: 'rgb(96, 175, 73)', type: 'kaizen' },
      Pentesting: { color: 'rgb(96, 175, 73)', type: 'pentesting' },
      People: { color: 'rgb(96, 175, 73)', type: 'people' },
      Support: { color: 'rgb(96, 175, 73)', type: 'support' },
      Task: { color: 'rgb(242, 203, 29)', type: 'task' },
      'Tech Debt': { color: 'rgb(96, 175, 73)', type: 'techdebt' },
      'Test Case': { color: 'rgb(96, 175, 73)', type: 'testcase' },
      'User Story': { color: 'rgb(0, 156, 204)', type: 'us' }
    };

    function getBranchName(rawType, id, rawTitle) {
      const title = pipe(
        replaceAmpersands,
        keepOnlyWords,
        trim,
        replaceEmptySpaces,
        toLowerCase
      )(rawTitle);
      const { type } = workItemTypes[rawType];

      return `${type}/${id}_${title}`.substring(0, 48);
    }

    function replaceAmpersands(title) {
      return title.replace(/&/gi, 'and');
    }

    function keepOnlyWords(title) {
      return title.replace(/[^\w+]/gim, ' ');
    }

    function replaceEmptySpaces(title) {
      return title.replace(/[ ]+/gim, '_');
    }

    function trim(title) {
      return title.trim();
    }

    function toLowerCase(title) {
      return title.toLowerCase();
    }

    function pipe(...fns) {
      return arg => fns.reduce((acc, fn) => fn(acc), arg);
    }

    const apiUrl = `https://almsearch.dev.azure.com/payvision/Warriors/_apis/search/workitemsearchresults?api-version=5.1-preview.1`;
    const basicFields = {
      $skip: 0,
      $top: 20,
      filters: null,
      $orderBy: [
        {
          field: 'system.id',
          sortOrder: 'DESC'
        }
      ]
    };

    async function searchAzure(token, searchText) {
      const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`:${token}`)}`
      });

      const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(Object.assign({}, basicFields, { searchText })),
        redirect: 'follow'
      };

      return await fetch(apiUrl, requestOptions).then(res => res.json());
    }

    /* src\Components\Input.svelte generated by Svelte v3.18.2 */

    const file$1 = "src\\Components\\Input.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label_1;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*placeholder*/ ctx[2]);
    			attr_dev(input, "placeholder", "\r\n    ");
    			attr_dev(input, "id", /*label*/ ctx[1]);
    			attr_dev(input, "class", "input svelte-1k9tfb3");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 50, 2, 1057);
    			attr_dev(label_1, "class", "input__label svelte-1k9tfb3");
    			attr_dev(label_1, "for", /*label*/ ctx[1]);
    			add_location(label_1, file$1, 58, 2, 1209);
    			attr_dev(div, "class", "input-container svelte-1k9tfb3");
    			add_location(div, file$1, 49, 0, 1024);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label_1);
    			append_dev(label_1, t1);

    			dispose = [
    				listen_dev(
    					input,
    					"input",
    					function () {
    						if (is_function(/*handleChange*/ ctx[0])) /*handleChange*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					input,
    					"keydown",
    					function () {
    						if (is_function(/*handleKeyDown*/ ctx[3])) /*handleKeyDown*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				)
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*label*/ 2) {
    				attr_dev(input, "id", /*label*/ ctx[1]);
    			}

    			if (dirty & /*placeholder*/ 4) set_data_dev(t1, /*placeholder*/ ctx[2]);

    			if (dirty & /*label*/ 2) {
    				attr_dev(label_1, "for", /*label*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { handleChange } = $$props;
    	let { label = "" } = $$props;
    	let { placeholder } = $$props;

    	let { handleKeyDown = () => {
    		
    	} } = $$props;

    	const writable_props = ["handleChange", "label", "placeholder", "handleKeyDown"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("handleChange" in $$props) $$invalidate(0, handleChange = $$props.handleChange);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("handleKeyDown" in $$props) $$invalidate(3, handleKeyDown = $$props.handleKeyDown);
    	};

    	$$self.$capture_state = () => {
    		return {
    			handleChange,
    			label,
    			placeholder,
    			handleKeyDown
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("handleChange" in $$props) $$invalidate(0, handleChange = $$props.handleChange);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("handleKeyDown" in $$props) $$invalidate(3, handleKeyDown = $$props.handleKeyDown);
    	};

    	return [handleChange, label, placeholder, handleKeyDown];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment$1, safe_not_equal, {
    			handleChange: 0,
    			label: 1,
    			placeholder: 2,
    			handleKeyDown: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleChange*/ ctx[0] === undefined && !("handleChange" in props)) {
    			console.warn("<Input> was created without expected prop 'handleChange'");
    		}

    		if (/*placeholder*/ ctx[2] === undefined && !("placeholder" in props)) {
    			console.warn("<Input> was created without expected prop 'placeholder'");
    		}
    	}

    	get handleChange() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleChange(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleKeyDown() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleKeyDown(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\List.svelte generated by Svelte v3.18.2 */
    const file$2 = "src\\Components\\List.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].fields;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (102:2) {#each list as { fields }
    function create_each_block(ctx) {
    	let li;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let t1_value = getTitle(/*fields*/ ctx[8]) + "";
    	let t1;
    	let t2;
    	let li_class_value;
    	let dispose;

    	function keydown_handler(...args) {
    		return /*keydown_handler*/ ctx[5](/*fields*/ ctx[8], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*fields*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "result__icon svelte-xd55gn");
    			set_style(div0, "--backgroundColor", getBackgroundColor(/*fields*/ ctx[8]));
    			add_location(div0, file$2, 108, 8, 2489);
    			add_location(div1, file$2, 107, 6, 2474);
    			attr_dev(div2, "class", "result__title svelte-xd55gn");
    			add_location(div2, file$2, 112, 6, 2616);
    			attr_dev(li, "class", li_class_value = "result result_" + /*i*/ ctx[10] + " svelte-xd55gn");
    			attr_dev(li, "tabindex", "0");
    			add_location(li, file$2, 102, 4, 2315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			append_dev(div1, div0);
    			append_dev(li, t0);
    			append_dev(li, div2);
    			append_dev(div2, t1);
    			append_dev(li, t2);

    			dispose = [
    				listen_dev(li, "keydown", keydown_handler, false, false, false),
    				listen_dev(li, "click", click_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*list*/ 1) {
    				set_style(div0, "--backgroundColor", getBackgroundColor(/*fields*/ ctx[8]));
    			}

    			if (dirty & /*list*/ 1 && t1_value !== (t1_value = getTitle(/*fields*/ ctx[8]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(102:2) {#each list as { fields }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let each_value = /*list*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "tabindex", "-1");
    			attr_dev(ul, "class", "results scrollable-container svelte-xd55gn");
    			add_location(ul, file$2, 100, 0, 2205);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[7](ul);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*onKeyDown, list, handleSelection, getTitle, getBackgroundColor*/ 11) {
    				each_value = /*list*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleArrowKeys(nextSelectableElement) {
    	nextSelectableElement = nextSelectableElement || document.body.querySelector("#searchbox");
    	nextSelectableElement.focus();
    }

    function getBackgroundColor({ "system.workitemtype": type }) {
    	return workItemTypes[type].color;
    }

    function getTitle({ "system.title": title }) {
    	return title;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { list } = $$props;
    	let { handleSelection } = $$props;
    	let autoscroll;
    	let div;

    	beforeUpdate(() => {
    		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight;
    	});

    	afterUpdate(() => {
    		if (autoscroll) {
    			div.scrollTo(0, div.scrollHeight);
    		}
    	});

    	function onKeyDown(event, fields) {
    		const { code, target: { previousSibling, nextSibling } } = event;

    		switch (code) {
    			case "Space":
    			case "Enter":
    				event.preventDefault();
    				handleSelection(fields);
    				break;
    			case "ArrowUp":
    				event.preventDefault();
    				handleArrowKeys(previousSibling);
    				break;
    			case "ArrowDown":
    				event.preventDefault();
    				handleArrowKeys(nextSibling);
    				break;
    		}
    	}

    	const writable_props = ["list", "handleSelection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = (fields, e) => onKeyDown(e, fields);
    	const click_handler = fields => handleSelection(fields);

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, div = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("handleSelection" in $$props) $$invalidate(1, handleSelection = $$props.handleSelection);
    	};

    	$$self.$capture_state = () => {
    		return { list, handleSelection, autoscroll, div };
    	};

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("handleSelection" in $$props) $$invalidate(1, handleSelection = $$props.handleSelection);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    		if ("div" in $$props) $$invalidate(2, div = $$props.div);
    	};

    	return [
    		list,
    		handleSelection,
    		div,
    		onKeyDown,
    		autoscroll,
    		keydown_handler,
    		click_handler,
    		ul_binding
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { list: 0, handleSelection: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*list*/ ctx[0] === undefined && !("list" in props)) {
    			console.warn("<List> was created without expected prop 'list'");
    		}

    		if (/*handleSelection*/ ctx[1] === undefined && !("handleSelection" in props)) {
    			console.warn("<List> was created without expected prop 'handleSelection'");
    		}
    	}

    	get list() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleSelection() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleSelection(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Loader.svelte generated by Svelte v3.18.2 */

    const file$3 = "src\\Components\\Loader.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loader--inner svelte-ev1688");
    			add_location(div0, file$3, 39, 2, 790);
    			attr_dev(div1, "class", "loader svelte-ev1688");
    			set_style(div1, "--shouldShow", /*shouldShow*/ ctx[0]);
    			add_location(div1, file$3, 38, 0, 732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*shouldShow*/ 1) {
    				set_style(div1, "--shouldShow", /*shouldShow*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { loading } = $$props;
    	const writable_props = ["loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => {
    		return { loading, shouldShow };
    	};

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("shouldShow" in $$props) $$invalidate(0, shouldShow = $$props.shouldShow);
    	};

    	let shouldShow;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*loading*/ 2) {
    			 $$invalidate(0, shouldShow = loading ? "block" : "none");
    		}
    	};

    	return [shouldShow, loading];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { loading: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*loading*/ ctx[1] === undefined && !("loading" in props)) {
    			console.warn("<Loader> was created without expected prop 'loading'");
    		}
    	}

    	get loading() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Pages\SearchBoxContainer.svelte generated by Svelte v3.18.2 */
    const file$4 = "src\\Pages\\SearchBoxContainer.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;

    	const input = new Input({
    			props: {
    				handleChange: /*handleChange*/ ctx[2],
    				handleKeyDown,
    				placeholder: "Work item Id",
    				label: "searchbox"
    			},
    			$$inline: true
    		});

    	const loader = new Loader({
    			props: { loading: /*loading*/ ctx[0] },
    			$$inline: true
    		});

    	const list = new List({
    			props: {
    				list: /*searchResults*/ ctx[1],
    				handleSelection
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(input.$$.fragment);
    			t0 = space();
    			create_component(loader.$$.fragment);
    			t1 = space();
    			create_component(list.$$.fragment);
    			attr_dev(div, "class", "search-box svelte-gp6mnc");
    			add_location(div, file$4, 63, 0, 1587);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(input, div, null);
    			append_dev(div, t0);
    			mount_component(loader, div, null);
    			append_dev(div, t1);
    			mount_component(list, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const loader_changes = {};
    			if (dirty & /*loading*/ 1) loader_changes.loading = /*loading*/ ctx[0];
    			loader.$set(loader_changes);
    			const list_changes = {};
    			if (dirty & /*searchResults*/ 2) list_changes.list = /*searchResults*/ ctx[1];
    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(loader.$$.fragment, local);
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(loader.$$.fragment, local);
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input);
    			destroy_component(loader);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleSelection({ "system.workitemtype": type, "system.id": id, "system.title": title }) {
    	copyToClipboard(getBranchName(type, id, title));
    }

    function copyToClipboard(branchName) {
    	if (navigator.clipboard) {
    		navigator.clipboard.writeText(branchName).then(() => newBranchName.update(name => name = branchName));
    	} else {
    		const listener = e => {
    			e.clipboardData.setData("text/plain", branchName);
    			e.preventDefault();
    		};

    		document.addEventListener("copy", listener, false);
    		document.execCommand("copy");
    		document.removeEventListener("copy", listener, false);
    	}
    }

    function handleKeyDown(event) {
    	if (event.code === "ArrowDown") {
    		event.preventDefault();
    		document.body.querySelector(".result_0").focus();
    	}
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $token;
    	validate_store(token, "token");
    	component_subscribe($$self, token, $$value => $$invalidate(3, $token = $$value));
    	let loading;
    	let searchResults = [];

    	async function handleChange({ target: { value } }) {
    		if (!value) {
    			$$invalidate(1, searchResults = []);
    			$$invalidate(0, loading = false);
    			return;
    		}

    		$$invalidate(0, loading = true);
    		searchAzure($token, value).then(({ results }) => $$invalidate(1, searchResults = results)).finally(() => $$invalidate(0, loading = false));
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    		if ("searchResults" in $$props) $$invalidate(1, searchResults = $$props.searchResults);
    		if ("$token" in $$props) token.set($token = $$props.$token);
    	};

    	return [loading, searchResults, handleChange];
    }

    class SearchBoxContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchBoxContainer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Components\Toaster.svelte generated by Svelte v3.18.2 */
    const file$5 = "src\\Components\\Toaster.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let span;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Copied to clipboard!";
    			attr_dev(span, "class", "message svelte-1yvznyb");
    			add_location(span, file$5, 49, 4, 906);
    			attr_dev(div0, "class", "card svelte-1yvznyb");
    			add_location(div0, file$5, 48, 2, 882);
    			attr_dev(div1, "class", "container svelte-1yvznyb");
    			toggle_class(div1, "show", /*show*/ ctx[0]);
    			add_location(div1, file$5, 47, 0, 844);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*show*/ 1) {
    				toggle_class(div1, "show", /*show*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let show = false;

    	newBranchName.subscribe(name => {
    		if (!name) return;
    		$$invalidate(0, show = true);
    		setTimeout(() => $$invalidate(0, show = false), 1500);
    	});

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    	};

    	return [show];
    }

    class Toaster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toaster",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Components\Toggle.svelte generated by Svelte v3.18.2 */
    const file$6 = "src\\Components\\Toggle.svelte";

    function create_fragment$6(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Ligth";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Dark";
    			t3 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "toggle-light svelte-1buidv3");
    			add_location(div0, file$6, 74, 4, 1517);
    			attr_dev(div1, "class", "toggle-dark svelte-1buidv3");
    			add_location(div1, file$6, 75, 4, 1598);
    			attr_dev(div2, "class", "selected svelte-1buidv3");
    			toggle_class(div2, "light", /*selectedTheme*/ ctx[0] === "light");
    			toggle_class(div2, "dark", /*selectedTheme*/ ctx[0] === "dark");
    			add_location(div2, file$6, 76, 4, 1676);
    			attr_dev(div3, "class", "toggle svelte-1buidv3");
    			add_location(div3, file$6, 73, 2, 1491);
    			attr_dev(div4, "class", "container svelte-1buidv3");
    			add_location(div4, file$6, 72, 0, 1464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[1], false, false, false),
    				listen_dev(div1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedTheme*/ 1) {
    				toggle_class(div2, "light", /*selectedTheme*/ ctx[0] === "light");
    			}

    			if (dirty & /*selectedTheme*/ 1) {
    				toggle_class(div2, "dark", /*selectedTheme*/ ctx[0] === "dark");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const transitionClass = "color-theme-in-transition";

    function switchTheme(selected) {
    	theme.update(theme => theme = selected);
    	const { classList } = document.body;
    	classList.add(transitionClass);
    	window.setTimeout(() => classList.remove(transitionClass), 1000);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let selectedTheme;

    	theme.subscribe(value => {
    		$$invalidate(0, selectedTheme = value);
    		document.documentElement.setAttribute("data-theme", value);
    	});

    	const click_handler = () => switchTheme("light");
    	const click_handler_1 = () => switchTheme("dark");

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedTheme" in $$props) $$invalidate(0, selectedTheme = $$props.selectedTheme);
    	};

    	return [selectedTheme, click_handler, click_handler_1];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Pages\Token.svelte generated by Svelte v3.18.2 */
    const file$7 = "src\\Pages\\Token.svelte";

    function create_fragment$7(ctx) {
    	let form;
    	let t0;
    	let div;
    	let button;
    	let t1;
    	let span;
    	let current;
    	let dispose;

    	const input = new Input({
    			props: {
    				label: "token",
    				handleChange: /*handleChange*/ ctx[1],
    				placeholder: "Set your token"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			create_component(input.$$.fragment);
    			t0 = space();
    			div = element("div");
    			button = element("button");
    			t1 = text("Submit\r\n      ");
    			span = element("span");
    			span.textContent = "→";
    			attr_dev(span, "class", "animate svelte-17o3foj");
    			add_location(span, file$7, 68, 6, 1280);
    			attr_dev(button, "class", "svelte-17o3foj");
    			add_location(button, file$7, 66, 4, 1250);
    			add_location(div, file$7, 65, 2, 1239);
    			attr_dev(form, "class", "svelte-17o3foj");
    			add_location(form, file$7, 63, 0, 1118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			mount_component(input, form, null);
    			append_dev(form, t0);
    			append_dev(form, div);
    			append_dev(div, button);
    			append_dev(button, t1);
    			append_dev(button, span);
    			current = true;
    			dispose = listen_dev(form, "submit", /*submit_handler*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self) {
    	let userToken;

    	function handleClick(event) {
    		event.preventDefault();
    		token.update(token => token = userToken);
    	}

    	function handleChange({ target }) {
    		userToken = target.value;
    	}

    	const submit_handler = event => handleClick(event);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("userToken" in $$props) userToken = $$props.userToken;
    	};

    	return [handleClick, handleChange, userToken, submit_handler];
    }

    class Token extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Token",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.18.2 */
    const file$8 = "src\\App.svelte";

    // (52:4) {:else}
    function create_else_block(ctx) {
    	let current;
    	const token_1 = new Token({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(token_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(token_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(token_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(token_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(token_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(52:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#if $token}
    function create_if_block(ctx) {
    	let current;
    	const searchboxcontainer = new SearchBoxContainer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(searchboxcontainer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(searchboxcontainer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchboxcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchboxcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(searchboxcontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(50:4) {#if $token}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let t1;
    	let main;
    	let div1;
    	let div0;
    	let h1;
    	let t3;
    	let current_block_type_index;
    	let if_block;
    	let t4;
    	let current;
    	const toggle = new Toggle({ $$inline: true });
    	const toaster = new Toaster({ $$inline: true });
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$token*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(toaster.$$.fragment);
    			t1 = space();
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Branch creator";
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "svelte-1g341s");
    			add_location(h1, file$8, 47, 6, 992);
    			attr_dev(div0, "class", "title svelte-1g341s");
    			add_location(div0, file$8, 46, 4, 966);
    			attr_dev(div1, "class", "container svelte-1g341s");
    			add_location(div1, file$8, 45, 2, 938);
    			attr_dev(main, "class", "center svelte-1g341s");
    			add_location(main, file$8, 44, 0, 914);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(toaster, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div1, t3);
    			if_blocks[current_block_type_index].m(div1, null);
    			insert_dev(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(toaster.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(toaster.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(toaster, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t4);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $token;
    	validate_store(token, "token");
    	component_subscribe($$self, token, $$value => $$invalidate(0, $token = $$value));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$token" in $$props) token.set($token = $$props.$token);
    	};

    	return [$token];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
