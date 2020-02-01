
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
    let outros;
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

    /* src\Input.svelte generated by Svelte v3.18.1 */

    const file = "src\\Input.svelte";

    function create_fragment(ctx) {
    	let div;
    	let input;
    	let t0;
    	let span;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*placeholder*/ ctx[1]);
    			attr_dev(input, "placeholder", " ");
    			attr_dev(input, "class", "input svelte-1jv4c68");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 41, 2, 806);
    			attr_dev(span, "class", "input__label svelte-1jv4c68");
    			add_location(span, file, 42, 2, 885);
    			attr_dev(div, "class", "input-container svelte-1jv4c68");
    			add_location(div, file, 40, 0, 773);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			dispose = listen_dev(input, "input", /*handleChange*/ ctx[0], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 2) set_data_dev(t1, /*placeholder*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	let { handleChange } = $$props;
    	let { placeholder } = $$props;
    	const writable_props = ["handleChange", "placeholder"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("handleChange" in $$props) $$invalidate(0, handleChange = $$props.handleChange);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => {
    		return { handleChange, placeholder };
    	};

    	$$self.$inject_state = $$props => {
    		if ("handleChange" in $$props) $$invalidate(0, handleChange = $$props.handleChange);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    	};

    	return [handleChange, placeholder];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { handleChange: 0, placeholder: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleChange*/ ctx[0] === undefined && !("handleChange" in props)) {
    			console.warn("<Input> was created without expected prop 'handleChange'");
    		}

    		if (/*placeholder*/ ctx[1] === undefined && !("placeholder" in props)) {
    			console.warn("<Input> was created without expected prop 'placeholder'");
    		}
    	}

    	get handleChange() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleChange(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Loader.svelte generated by Svelte v3.18.1 */

    const file$1 = "src\\Loader.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loader--inner svelte-f28hea");
    			add_location(div0, file$1, 39, 2, 766);
    			attr_dev(div1, "class", "loader svelte-f28hea");
    			set_style(div1, "--shouldShow", /*shouldShow*/ ctx[0]);
    			add_location(div1, file$1, 38, 0, 708);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { loading: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$1.name
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

    /* src\App.svelte generated by Svelte v3.18.1 */
    const file$2 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].fields;
    	return child_ctx;
    }

    // (128:8) {#each searchResults as { fields }}
    function create_each_block(ctx) {
    	let li;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let t1_value = /*fields*/ ctx[8]["system.title"] + "";
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
    			attr_dev(div0, "class", "result__icon svelte-ftk1ji");
    			set_style(div0, "--backgroundColor", /*colors*/ ctx[3][/*fields*/ ctx[8]["system.workitemtype"]]);
    			add_location(div0, file$2, 130, 14, 2728);
    			add_location(div1, file$2, 129, 12, 2708);
    			attr_dev(div2, "class", "result__title svelte-ftk1ji");
    			add_location(div2, file$2, 134, 12, 2886);
    			attr_dev(li, "class", "result svelte-ftk1ji");
    			add_location(li, file$2, 128, 10, 2676);
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
    			if (dirty & /*searchResults*/ 4) {
    				set_style(div0, "--backgroundColor", /*colors*/ ctx[3][/*fields*/ ctx[8]["system.workitemtype"]]);
    			}

    			if (dirty & /*searchResults*/ 4 && t1_value !== (t1_value = /*fields*/ ctx[8]["system.title"] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(128:8) {#each searchResults as { fields }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let ul;
    	let current;

    	const input = new Input({
    			props: {
    				handleChange: /*handleChange*/ ctx[4],
    				placeholder: "Work item Id"
    			},
    			$$inline: true
    		});

    	const loader = new Loader({
    			props: { loading: /*loading*/ ctx[1] },
    			$$inline: true
    		});

    	let each_value = /*searchResults*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Branch creator";
    			t1 = space();
    			div1 = element("div");
    			create_component(input.$$.fragment);
    			t2 = space();
    			create_component(loader.$$.fragment);
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 121, 6, 2409);
    			attr_dev(div0, "class", "title svelte-ftk1ji");
    			add_location(div0, file$2, 120, 4, 2383);
    			attr_dev(ul, "class", "results scrollable-container svelte-ftk1ji");
    			add_location(ul, file$2, 126, 6, 2564);
    			attr_dev(div1, "class", "search-box svelte-ftk1ji");
    			add_location(div1, file$2, 123, 4, 2448);
    			attr_dev(div2, "class", "container svelte-ftk1ji");
    			add_location(div2, file$2, 119, 2, 2355);
    			attr_dev(main, "class", "center svelte-ftk1ji");
    			add_location(main, file$2, 118, 0, 2331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(input, div1, null);
    			append_dev(div1, t2);
    			mount_component(loader, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[7](ul);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const loader_changes = {};
    			if (dirty & /*loading*/ 2) loader_changes.loading = /*loading*/ ctx[1];
    			loader.$set(loader_changes);

    			if (dirty & /*searchResults, colors*/ 12) {
    				each_value = /*searchResults*/ ctx[2];
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(input);
    			destroy_component(loader);
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

    function instance$2($$self, $$props, $$invalidate) {
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
    		"Test Case": "rgb(96, 175, 73)",
    		"User Story": "rgb(0, 156, 204)"
    	};

    	let autoscroll;
    	let div;
    	let loading;
    	let searchResults = [];

    	beforeUpdate(() => {
    		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight;
    	});

    	afterUpdate(() => {
    		if (autoscroll) {
    			div.scrollTo(0, div.scrollHeight);
    		}
    	});

    	async function handleChange({ target: { value } }) {
    		if (!value) {
    			$$invalidate(2, searchResults = []);
    			$$invalidate(1, loading = false);
    			return;
    		}

    		$$invalidate(1, loading = true);
    		const { results } = await searchAzure(value);
    		$$invalidate(1, loading = false);
    		$$invalidate(2, searchResults = results);
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, div = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    		if ("div" in $$props) $$invalidate(0, div = $$props.div);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("searchResults" in $$props) $$invalidate(2, searchResults = $$props.searchResults);
    		if ("isEmpty" in $$props) isEmpty = $$props.isEmpty;
    	};

    	let isEmpty;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchResults*/ 4) {
    			 isEmpty = searchResults.length === 0;
    		}
    	};

    	return [
    		div,
    		loading,
    		searchResults,
    		colors,
    		handleChange,
    		autoscroll,
    		isEmpty,
    		ul_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
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
