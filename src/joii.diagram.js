/*                                                        ____.      .__.__
 Javascript Object Inheritance Implementation            |    | ____ |__|__|
 Copyright 2014, Harold Iedema. All rights reserved.     |    |/  _ \|  |  |
---------------------------------------------------- /\__|    (  <_> )  |  | --
                                                     \________|\____/|__|__|

 THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS
 OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.

 ------------------------------------------------------------------------------
*/
if (typeof(_g) === 'undefined' || typeof(_g.$JOII) === 'undefined') {
    throw new Error('JOII-PlantUML requires JOII to be loaded.');
}

if (typeof(_g.$JOII.REVISION) === 'undefined' || _g.$JOII.REVISION < 22) {
    throw new Error('JOII-PlantUML requires JOII 2.2 or higher.');
}

/**
 * JOII-Diagram Generator.
 *
 * This feature generates a UML diagram of one class, displaying parent/child
 * relations between parent classes and interfaces.
 *
 * Requires JOII 2.2 or later.
 *
 * @author Harold Iedema <harold@iedema.me>
 */
_g.$JOII.RegisterInNS('JoiiDiagram', _g.$JOII.PublicAPI.Class({

    classes         : [],
    scopes          : {},
    classmap        : {},
    relations       : [],
    notes_enabled   : true,
    anonymous_names : {},
    anonymous_id    : 0,

    /**
     * @param function class_fn
     * @param string   scope
     */
    __construct: function(classes, scopes)
    {
        var i = 0;

        // Validate & hydrate class objects.
        for (i in classes) {
            if (!classes.hasOwnProperty(i)) {
                continue;
            }
            if (typeof(classes[i]) === 'undefined') {
                throw new Error('One of the classes is not a valid JOII-class.');
            }
            this.addClass(classes[i]);
        }

        // Validate & hydrate scopes
        for (i in scopes) {
            if (!scopes.hasOwnProperty(i)) {
                continue;
            }
            this.addScope(i, scopes[i]);
        }

        // Public API
        return {
            'getPlantUML' : this.getPlantUML.bind(this),
            'addClass'    : this.addClass.bind(this),
            'addScope'    : this.addScope.bind(this),
            'addRelation' : this.addRelation.bind(this),
            'enableNotes' : this.enableNotes.bind(this),
            'disableNotes': this.disableNotes.bind(this)
        };
    },

    /**
     * Adds a class to compile.
     *
     * @param function class_fn
     * @return this
     */
    addClass: function(class_fn)
    {
        if (typeof(class_fn.__joii__) === 'undefined') {
            throw new Error('Class is not a valid JOII-class.');
        }
        this.classes.push(class_fn);
        return this;
    },

    /**
     * Adds an object scope to iterate over to scan for class names.
     *
     * @param string name
     * @param object object
     * @return this
     */
    addScope: function(name, object)
    {
        if (typeof(name) !== 'string') {
            throw new Error('Scopes shuold be passed as key/value object: [name: object].');
        }
        if (typeof(object) !== 'object' && typeof(object) !== 'function') {
            throw new Error('Scope values should be an object or a function.');
        }
        this.scopes[name] = object;
        return this;
    },

    /**
     * Adds a relation between 2 objects by name.
     *
     * The type parameter can be one of:
     *      - dependency (default)
     *      - inheritance
     *      - ...
     *
     * @param string a
     * @param string b
     * @param string type
     * @param int count_a
     * @param int count_b
     * @return this
     */
    addRelation: function(a, b, type, count_a, count_b)
    {
        this.relations.push({
            a: a,
            b: b,
            type: type,
            count_a: count_a,
            count_b: count_b
        });

        return this;
    },

    /**
     * Enables rendering of notes when using PlantUML.
     *
     * @return this
     */
    enableNotes: function() {
        this.notes_enabled = true;
        return this;
    },

    /**
     * Disables rendering of notes when using PlantUML.
     *
     * @return this
     */
    disableNotes: function() {
        this.notes_enabled = false;
        return this;
    },

    /**
     * Returns a textual representation of a PlantUML graph.
     */
    getPlantUML: function()
    {
        // Always compile first before generating code...
        this.startCompile();
        var src = '';

        for (var i in this.classmap) {
            if (!this.classmap.hasOwnProperty(i)) {
                continue;
            }

            var obj = this.classmap[i], has_public_api = false;
            src += obj.type + " " + obj.name;
            if (obj.parent_name) {
                src += " extends " + obj.parent_name;
            }
            src += " {\n";
            var prop_vis = '+';

            // Do we have a public API?
            if (obj.public_api) {
                has_public_api = true;
                prop_vis = '-';
                for (var i in obj.public_api) {
                    if (!obj.public_api.hasOwnProperty(i)) {
                        continue;
                    }
                    src += "    + " + obj.public_api[i].name;
                    if (obj.public_api[i].type === 'function') {
                        src += "(" + obj.public_api[i].args + ")\n";
                    }
                }
                src += "    ....\n";
            }

            for (var i in obj.properties) {
                if (!obj.properties.hasOwnProperty(i)) {
                    continue;
                }
                var p = obj.properties[i];
                src += "    " + prop_vis + " " + p.name;
                if (p.type === 'function') {
                    src += "(" + p.args + ")";
                }
                src += "\n";
            }

            if (obj.type === 'interface') {
                for (var i in obj.list) {
                    if (!obj.list.hasOwnProperty(i)) {
                        continue;
                    }
                    src += "    + " + obj.list[i] + "\n";
                }
            }
            src += "}\n\n";

            if (has_public_api === true && this.notes_enabled === true) {
                src += "note left of " + obj.name + " {\n";
                src += "    Class has a public API. Inherited methods are \n";
                src += "    protected unless specified in this class.\n";
                src += "}\n\n";
            }
        }

        // Get relationships between objects.
        for (var i in this.classmap) {
            if (!this.classmap.hasOwnProperty(i)) {
                continue;
            }
            var obj = this.classmap[i];
            if (obj.interfaces) {
                for (var i in obj.interfaces) {
                    if (!obj.interfaces.hasOwnProperty(i)) {
                        continue;
                    }
                    src += obj.name + " --|> " + obj.interfaces[i] + "\n";
                }
            }
        }

        // Finally, get "custom" relations if there are any.
        for (var i in this.relations) {
            var r = this.relations[i], count_a = count_b = '';
            if (r.count_a) { count_a = ' "' + r.count_a + '"'; }
            if (r.count_b) { count_b = '"' + r.count_b + '" '; }
            r.type = (!r.type) ? '->' : r.type;
            src += r.a + count_a + " " + r.type + " " + count_b + r.b + "\n";
        }
        console.log(src);
        return src;
    },

    startCompile: function()
    {
        for (var i in this.classes) {
            if (this.classes.hasOwnProperty(i)) {
                this.compile(this.classes[i]);
            }
        }
    },

    compile: function(fn)
    {
        var name = this.getClassName(fn.__joii__);

        // Does this class extend on anything?
        var parent_name = '';
        if (typeof(fn.__joii__.parent) !== 'undefined') {
            parent_name = this.getClassName(fn.__joii__.parent.__joii__);

            // If we didn't compile the parent class yet, compile it!
            if (typeof(this.classmap[parent_name]) === 'undefined') {
                this.compile(fn.__joii__.parent);
            }
        }

        // Does the class implement any interfaces?
        var interfaces = [];
        if (typeof(fn.__joii__['implements']) !== 'undefined' &&
            fn.__joii__['implements'].length > 0) {

            for (var i in fn.__joii__['implements']) {
                var i_name = this.getClassName(fn.__joii__['implements'][i]);
                var i_list = [];

                for (var x in fn.__joii__['implements'][i]) {
                    var type = fn.__joii__['implements'][i][x];
                    var impl = x;
                    if (type.toLowerCase() === 'function') {
                        impl += '()';
                    }
                    i_list.push(impl);
                }

                this.classmap[i_name] = {
                    type: 'interface',
                    name: i_name,
                    list: i_list
                };
                interfaces.push(i_name);
            }
        }

        // Get properties
        var properties = this.getPropertyListOf(fn);
        var public_api = this.getPublicAPI(fn);

        for (var p in public_api) {
            if (!public_api.hasOwnProperty(p)) {
                continue;
            }
            if (typeof(properties[p]) !== 'undefined') {
                delete properties[p];
            }
        }

        this.classmap[name] = {
            type        : 'class',
            name        : name,
            parent_name : parent_name,
            properties  : properties,
            public_api  : public_api,
            interfaces  : interfaces
        };
    },

    // _________________________________________________________ HELPERS ___ //

    /**
     * Returns the name of the given class.
     *
     * @param function fn
     * @return string
     */
    getClassName: function(fn)
    {
        var processed_scopes = [];

        var processScope = function(fn, scope, name) {
            for (var i in scope) {
                var n = name + '.' + i;
                if (scope.hasOwnProperty(i) && processed_scopes.indexOf(scope[i]) === -1) {
                    processed_scopes.push(scope[i]);

                    if ((typeof(scope[i].__joii__) !== 'undefined' && scope[i].__joii__ === fn) ||
                        (typeof(scope[i].__interface__) !== 'undefined' && scope[i] === fn)){
                        return n;
                    }
                    if (typeof(scope[i]) === 'function' || typeof(scope[i]) === 'object') {
                        if (false !== (n2 = processScope(fn, scope[i], n))) {
                            return n2;
                        }
                    }
                }
            }
            return false;
        };

        for (var i in this.scopes) {
            if (this.scopes.hasOwnProperty(i)) {
                if (false !== (n = processScope(fn, this.scopes[i], i))) {
                    return n;
                }
            }
        }

        // Anonymous. Did we already process this one?
        for (var i in this.anonymous_names) {
            if (this.anonymous_names[i] === fn) {
                return i;
            }
        }

        // We didn't process this class yet. Lets store it in case
        // we need it later.
        this.anonymous_id++;
        var name = 'Anonymous' + this.anonymous_id;
        this.anonymous_names[name] = fn;
        return name;
    },

    /**
     * Returns the property list of the given JOII-class.
     */
    getPropertyListOf: function(fn)
    {
        if (typeof(fn.__joii__) === 'undefined') {
            throw new Error('Given function is not a JOII-class.');
        }

        var f, args = [], list = {};
        for (var i in fn.__joii__.clean_prototype) {
            t = '';
            if (fn.__joii__.clean_prototype.hasOwnProperty(i)) {
                if (typeof(fn.__joii__.clean_prototype[i]) === 'function') {
                    f = fn.__joii__.clean_prototype[i];
                    args = f.toString().match (/function\s*\w*\s*\((.*?)\)/)[1].split(/\s*,\s*/);
                    t = 'function';
                } else {
                    t = 'field';
                }
                list[i] = {
                    'name' : i,
                    'args' : args.join(', '),
                    'type' : t
                };
            }
        }
        return list;
    },

    /**
     * Returns the defined Public API of a class.
     *
     * @param function fn
     */
    getPublicAPI: function(fn)
    {
        if (typeof(fn.__joii__) === 'undefined') {
            throw new Error('Given function is not a JOII-class.');
        }

        // Does the class have a constructor method?
        if (typeof(fn.__joii__.clean_prototype.__construct) === 'undefined') {
            return false;
        }
        var constructor = fn.prototype.__construct;

        // strip all line breaks and white spaces from the source.
        var src = constructor.toString();
        src = src.replace(/^\s+|\s+$/g,'');     // Remove leading/trailing spaces.
        src = src.replace(/(\r\n|\n|\r)/gm,""); // Remove break lines
        src = src.replace(/\s{2,}/g, ' ');      // Replace 2 spaces with 1.
        var matches = src.match(/([^{,]+):([^},]+)/g);
        if (matches === null) {
            return false;
        }

        // Collect a key/value list of matches.
        var list = {};

        for (var i in matches) {
            var p = /([^{,]+):([^},]+)/g.exec(matches[i]);
            var a = p[1].replace(/^\s+|\s+$/g,'');
            var b = p[2].replace(/^\s+|\s+$/g,'');

            var args = [];

            // Are we referencing to something in the prototype?
            var t = 'field';
            if (b.indexOf('this.') !== -1) {
                var fnc = b.replace('this.', '');
                if (typeof(fn.prototype[fnc]) === 'function') {
                    args = fn.prototype[fnc].toString().match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
                    t = 'function';
                }
            }

            list[a] = {
                'name' : a,
                'args' : args.join(', '),
                'type' : t
            };
        }

        return list;
    }

}));
