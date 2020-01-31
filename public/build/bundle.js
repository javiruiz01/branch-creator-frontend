
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
    const seen_callbacks = new Set();
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
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

    async function searchAzure(searchText) {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append(
        'Authorization',
        'Basic OnBid3BzaGxhdW54aXJlejZsNm5kM2pub2kyb2JjeGd2anpkaHZlN2M0YnhpeXNycnNrcmE='
      );

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(Object.assign({}, basicFields, { searchText })),
        redirect: 'follow'
      };

      return await fetch(apiUrl, requestOptions).then(res => res.json());
    }

    /* src\App.svelte generated by Svelte v3.18.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].fields;
    	return child_ctx;
    }

    // (170:6) {#if !isEmpty}
    function create_if_block(ctx) {
    	let ul;
    	let each_value = /*searchResults*/ ctx[0];
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

    			attr_dev(ul, "class", "results scrollable-container svelte-1jb70lg");
    			add_location(ul, file, 170, 8, 3305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchResults, colors*/ 9) {
    				each_value = /*searchResults*/ ctx[0];
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(170:6) {#if !isEmpty}",
    		ctx
    	});

    	return block;
    }

    // (172:10) {#each searchResults as { fields }}
    function create_each_block(ctx) {
    	let li;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let t1_value = /*fields*/ ctx[5]["system.title"] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "result__icon svelte-1jb70lg");
    			set_style(div0, "--backgroundColor", /*colors*/ ctx[3][/*fields*/ ctx[5]["system.workitemtype"]]);
    			add_location(div0, file, 174, 16, 3461);
    			add_location(div1, file, 173, 14, 3439);
    			attr_dev(div2, "class", "result__title svelte-1jb70lg");
    			add_location(div2, file, 178, 14, 3627);
    			attr_dev(li, "class", "result svelte-1jb70lg");
    			add_location(li, file, 172, 12, 3405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			append_dev(div1, div0);
    			append_dev(li, t0);
    			append_dev(li, div2);
    			append_dev(div2, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchResults*/ 1) {
    				set_style(div0, "--backgroundColor", /*colors*/ ctx[3][/*fields*/ ctx[5]["system.workitemtype"]]);
    			}

    			if (dirty & /*searchResults*/ 1 && t1_value !== (t1_value = /*fields*/ ctx[5]["system.title"] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(172:10) {#each searchResults as { fields }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div4;
    	let div3;
    	let div2;
    	let input;
    	let t0;
    	let span;
    	let t2;
    	let div1;
    	let div0;
    	let t3;
    	let dispose;
    	let if_block = !/*isEmpty*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Work Item Id";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "placeholder", "\n          ");
    			attr_dev(input, "class", "input svelte-1jb70lg");
    			attr_dev(input, "type", "text");
    			toggle_class(input, "dirty", !/*isEmpty*/ ctx[2]);
    			add_location(input, file, 156, 8, 2950);
    			attr_dev(span, "class", "input__label svelte-1jb70lg");
    			add_location(span, file, 163, 8, 3117);
    			attr_dev(div0, "class", "loader--inner svelte-1jb70lg");
    			add_location(div0, file, 165, 10, 3217);
    			attr_dev(div1, "class", "loader svelte-1jb70lg");
    			toggle_class(div1, "loading", /*loading*/ ctx[1]);
    			add_location(div1, file, 164, 8, 3172);
    			attr_dev(div2, "class", "search-box svelte-1jb70lg");
    			add_location(div2, file, 155, 6, 2917);
    			attr_dev(div3, "class", "container svelte-1jb70lg");
    			add_location(div3, file, 154, 4, 2887);
    			attr_dev(div4, "class", "center svelte-1jb70lg");
    			add_location(div4, file, 153, 2, 2862);
    			add_location(main, file, 152, 0, 2853);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			append_dev(div2, t0);
    			append_dev(div2, span);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t3);
    			if (if_block) if_block.m(div3, null);
    			dispose = listen_dev(input, "input", /*handleChange*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isEmpty*/ 4) {
    				toggle_class(input, "dirty", !/*isEmpty*/ ctx[2]);
    			}

    			if (dirty & /*loading*/ 2) {
    				toggle_class(div1, "loading", /*loading*/ ctx[1]);
    			}

    			if (!/*isEmpty*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			dispose();
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

    function instance($$self, $$props, $$invalidate) {
    	const colors = {
    		Bug: "rgb(204, 41, 61)",
    		Enabler: "rgb(96, 175, 73)",
    		Epic: "rgb(255, 123, 0)",
    		Feature: "rgb(119, 59, 147)",
    		Issue: "rgb(96, 175, 73)",
    		Kaizen: "rgb(96, 175, 73)",
    		Pentesting: "pentesting",
    		Support: "rgb(96, 175, 73)",
    		Task: "rgb(242, 203, 29)",
    		"Tech Debt": "rgb(96, 175, 73)",
    		"User Story": "rgb(0, 156, 204)"
    	};

    	let searchResults = [];
    	let loading;

    	async function handleChange({ target: { value } }) {
    		if (!value) {
    			$$invalidate(0, searchResults = []);
    			$$invalidate(1, loading = false);
    			return;
    		}

    		$$invalidate(1, loading = true);
    		const { results } = await searchAzure(value);
    		$$invalidate(1, loading = false);
    		$$invalidate(0, searchResults = results);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("searchResults" in $$props) $$invalidate(0, searchResults = $$props.searchResults);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("isEmpty" in $$props) $$invalidate(2, isEmpty = $$props.isEmpty);
    	};

    	let isEmpty;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchResults*/ 1) {
    			 $$invalidate(2, isEmpty = searchResults.length === 0);
    		}
    	};

    	return [searchResults, loading, isEmpty, colors, handleChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
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
