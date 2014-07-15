# JOII Diagram Generator

This plugin allows you to generate class diagrams for JOII-based classes. At this moment, it only supports PlantUML. More types may be added by (pull-) request if you wish to see more diagram types implemented.

Example diagram:
![Example Diagram](http://www.plantuml.com/plantuml/img/lLDTIyCm57tlhxZigLLRy0y8LKJsC1cCFO-OtAw1DYd9pNIe_zqqAtNOLZe4yn3QavnpxbUa8ZG5umXvqrIICv9QPPkZ9Qopt569YZfqnHJRerdsZFS8_Be6zdqDuoJwZ29UCMjdAuuBEOj6iHfleF5Yhzg895pB_0eVAUnsN2jBnd6AamxR8sqzy_wuxVYzK8XCQKAei23GnQK1FeIiIcQ1GUDUF1NozJA3fIhHI481DLAfXJyt287I6E_7soEdAlHiso2NXVI0L42bj11gbOrNhSqXR6kZ3rASbqg85e_RBUcmBlNubEm9CrZh0vx1taUEzhpt6ZQu4mxLF3Dx_l6_SOChZpMJrTHCz8x_OfIBMYhffuMHDe1lX4fCnpEjizA-3t_KU79eQGv_zeIcwSVTvKyu6hSUY0rd8_fzJ1Ut2qZd1pGHn-9ge3AmYhu0)

## Requirements

This plugin requires **JOII 2.2**. Starting from this version, it's possible to create plugins that register themselves inside the JOII-namespace.

## Basic usage

```javascript
var diagram = new JoiiDiagram([
    SomeNamespace.MyClass1, 
    SomeNamespace.MyClass2
], {
    "Application": SomeNamespace
})

var src = diagram.getPlantUML();
// Use the value of 'src' on http://www.plantuml.com/plantuml/ to see the result in action.
```

The JoiiDiagram class accepts 2 parameters: A `list of classes` and a key/value
pair of `namespaces`. Because there is no way to find out the name of a class
in a graceful way, you specify a namespace which will be scanned for objects
that are exactly the same as the ones you provided in the class list. If the
plugin is unable to associate a name with your class, the name "_Anonymous_"
will be used, suffixed with an index number.

Be aware though that this can have some strange behaviour when using
namespaces, since the plugin can't associate your class to something it already
processed when scanning object inheritance or interface implementations. I hope
to fix this in a future release.

## Adding relations
You can add relations by using the `addRelation` method. This method accepts 5
parameters of which 3 are optional:

 - `class_a` FQN of class_a. eg.: My.Namespace.FooClass
 - `class_b` FQN of class_b. eg.: My.Namespace.BarClass
 - `relation_type` optional. see PlantUML arrow types, leave blank for default arrow
 - `count_a` optional. How many of class_a fit in class_b ?
 - `count_b` optional. How many of class_b fit in class_a ?

In the image above, the relation between **UserProvider** and the 
**AuthenticationManager** is one of these extra relations. The same goes for
the relation between the **User** and **UserProvider**. The rest is done
automatically.

```javascript
var diagram = new JoiiDiagram([
    SomeNamespace.MyClass1, 
    SomeNamespace.MyClass2
], {
    "Application": SomeNamespace
});

// Add custom relations.
diagram.addRelation('SomeClass', 'SomeNamespace.MyClass1')
       .addRelation('SomeNamespace.MyClass1', 'SomeNamespace.MyClass2', '-|>', '*', '1');
       
// Grab the source.
var src = diagram.getPlantUML();
```

#### Hint: All methods are chainable.

## Public API

When a Public API is defined within a class, the diagram will show the methods
defined in the Public API as "public" while keeping the remaining properties
shown as "private" as they are not accessible from the outside world. This
behavior does not apply for parent classes, as public API's are only applicable
for calls made from outside the class scope.

For a usage example of the way Public API works, please check out <http://joii.zone/documentation/classes> (bottom of the page).

## Please note...

This is the initial version of this plugin. More functionality will be added in the near future. However, the way this plugin works right now will remain as-is. Feel free to start using it, stay tuned for shiny additions.
