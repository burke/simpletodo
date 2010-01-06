var SimpleTodo = SimpleTodo || {};

(function(lib){

  lib.Item = function (text) {
    this.text = text;
    this.completed = false;
    this.uuid = (function() {
      // http://www.ietf.org/rfc/rfc4122.txt
      var s = [];
      var hexDigits = "0123456789ABCDEF";
      for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[12] = "4";
      s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);

      var uuid = s.join("");
      return uuid;
    })();
  };

  lib.KeyEvents = {

    doEnter: function() {
      lib.DisplayManager.addListInput();
    },

    doDown: function() {
      lib.DisplayManager.selectNext();
    },

    doUp: function() {
      lib.DisplayManager.selectPrevious();
    },

    doMoveDown: function() {
      lib.DisplayManager.moveSelectedDown();
    },

    doMoveUp: function() {
      lib.DisplayManager.moveSelectedUp();
    },

    doSpace: function() {
      lib.DisplayManager.completeSelected();
    },

    doBacktick: function() {
      lib.DisplayManager.hideCompleted();
    },

    bindings: {
      13:  "doEnter",
      106: "doDown",
      107: "doUp",
      108: "doMoveDown",
      104: "doMoveUp",
      32:  "doSpace",
      96:  "doBacktick"
    },

    initialize: function() {
      var that = this;
      $(document).bind("keypress", function(e) {
        //alert(e.which);
        if (document.activeElement == document.body) {
          eval("lib.KeyEvents."+that.bindings[e.which]+"();");
        }
      });
    }

  };

  lib.DisplayManager = {
    addListItem: function(item) {
      $(document.createElement("li")).
        html("<span>"+item.text+"</span>").
        addClass(item.completed ? "completed" : null).
        data("item", item).
        appendTo("#todo");
    },

    addListInput: function() {
      $("#todo").append("<li><form action=''><input type='text' /></form></li>");
      $("input").focus();
    },

    active: null,

    hideCompleted: function() {
      $("li.completed").remove();
      lib.LocalStore.removeAllCompleted();
      if (! this.active.data("item")) { // The associated data element has been deleted.
        this.setActive($("li:first"));
      }
    },

    completeSelected: function() {
      this.active.toggleClass("completed");
      this.active.data("item").completed = !this.active.data("item").completed;
      lib.LocalStore.save();
    },

    selectPrevious: function() {
      if (! this.active) {
        this.setActive($("li:first"));
      }
      var x = this.active.prev("li");
      if (x.size()>0) {
        this.setActive(x);
      }
    },

    selectNext: function() {
      if (! this.active) {
        this.setActive($("li:first"));
      }
      var x = this.active.next("li");
      if (x.size()>0) {
        this.setActive(x);
      }
    },

    moveSelectedDown: function() {
      var x = this.active.next("li");
      if (x.size()>0) {
        this.active.remove().insertAfter(x);
      }
    },

    moveSelectedUp: function() {
      var x = this.active.prev("li");
      if (x.size()>0) {
        this.active.remove().insertBefore(x);
      }
    },

    setActive: function(el) {
      if(this.active) { this.active.removeClass("active"); }
      if (el[0]) {
        this.active = el;
        this.active.addClass("active");
      }
    },

    initialize: function() {
      var that = this;
      $.each(lib.LocalStore.items, function(index, item) {
        that.addListItem(item);
      });

      this.setActive($("li:first"));

      $("form").live("submit", function(e) {
        var input = $(this).children("input").val();
        var item = new lib.Item(input);
        $(this).parent().remove();
        lib.LocalStore.add(item);
        that.addListItem(item);
        e.preventDefault();
      });

    }

  };

  lib.LocalStore = {

    storageKey: "lib.items",

    fetch: function() {
      var jsonItems = localStorage.getItem(this.storageKey) || "[]";
      this.items = JSON.parse(jsonItems);
    },

    items: null,

    removeAllCompleted: function() {
      this.items = this.items.filter(function(item) {
        return item.completed == false;
      });
      this.save();
    },

    save: function() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },

    add: function(item) {
      this.items.push(item);
      this.save();
    },

    initialize: function() {
      this.fetch();
    }

  };

  lib.initialize = function() {
    this.KeyEvents.initialize();
    this.LocalStore.initialize();
    this.DisplayManager.initialize();
  };

})(SimpleTodo);

$(document).ready(function() {
  SimpleTodo.initialize();
});