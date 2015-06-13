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

  function convertNodesIntoANode(nodes) {
    var node = null;
    nodes = nodes.map(function(node) {
      return !(node instanceof Node) ? document.createTextNode(node) : node;
    });
    if (nodes.length === 1) {
      node = nodes[0];
    } else {
      node = document.createDocumentFragment();
      nodes.forEach(function(n) { node.appendChild(n); });
    }
    return node;
  }

  var ParentNode = {
    prepend: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = convertNodesIntoANode(nodes);
      this.insertBefore(nodes, this.firstChild);
    },
    append: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = convertNodesIntoANode(nodes);
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
      var parent = this.parentNode;
      if (!parent) return;
      var viablePreviousSibling = this.previousSibling;
      while (nodes.indexOf(viablePreviousSibling) !== -1)
        viablePreviousSibling = viablePreviousSibling.previousSibling;
      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viablePreviousSibling ?
                          viablePreviousSibling.nextSibling : parent.firstChild);
    },
    after: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;
      while (nodes.indexOf(viableNextSibling) !== -1)
        viableNextSibling = viableNextSibling.nextSibling;
      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viableNextSibling);
    },
    replaceWith: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;
      while (nodes.indexOf(viableNextSibling) !== -1)
        viableNextSibling = viableNextSibling.nextSibling;
      var node = convertNodesIntoANode(nodes);

      if (this.parentNode === parent)
        parent.replaceChild(node, this);
      else
        parent.insertBefore(node, viableNextSibling);
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
