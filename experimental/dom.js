(function(global) {
  function mixin(o, ps) {
    Object.keys(ps).forEach(function(p) {
      if ((p in o) || (p in o.prototype)) return;
      Object.defineProperty(
        o.prototype,
        p,
        Object.getOwnPropertyDescriptor(ps, p)
      );
    });
  }


  // Interface ParentNode
  // https://dom.spec.whatwg.org/#interface-parentnode

  function mutationMethodMacro(nodes) {
    var node = null;
    nodes = nodes.map(function(node) {
      return (typeof node !== 'object') ? document.createTextNode(node) : node;
    });
    // TODO: Spec doesn't handle 0 length
    if (nodes.length !== 1) {
      node = document.createDocumentFragment();
      nodes.forEach(function(n) { node.appendChild(n); });
    } else {
      node = nodes[0];
    }
    return node;
  }

  var ParentNode = {
    prepend: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = mutationMethodMacro(nodes);
      this.insertBefore(nodes, this.firstChild);
    },
    append: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = mutationMethodMacro(nodes);
      this.appendChild(nodes);
    }
  };

  mixin(Document, ParentNode);
  mixin(DocumentFragment, ParentNode);
  mixin(Element, ParentNode);

  // Interface ChildNode
  // https://dom.spec.whatwg.org/#interface-childnode

  var ChildNode = {
    before: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      if (!this.parentNode) return;
      nodes = mutationMethodMacro(nodes);
      this.parentNode.insertBefore(nodes, this);
    },
    after: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      if (!this.parentNode) return;
      nodes = mutationMethodMacro(nodes);
      if (this.nextSibling)
        this.parentNode.insertBefore(nodes, this.nextSibling);
      else
        this.parentNode.appendChild(nodes);
    },
    replaceWith: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      if (!this.parentNode) return;
      nodes = mutationMethodMacro(nodes);
      this.parentNode.replaceChild(nodes, this);
    },
    remove: function() {
      if (!this.parentNode) return;
      this.parentNode.removeChild(this);
    }
  };

  mixin(DocumentType, ChildNode);
  mixin(Element, ChildNode);
  mixin(CharacterData, ChildNode);

}(self));
