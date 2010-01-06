var SimpleTodo = {

  Item: function (text) {
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
  },

  KeyEvents: {

    do_enter: function() {
      SimpleTodo.DisplayManager.addListInput();
    },

    do_down: function() {
      SimpleTodo.DisplayManager.selectNext();
    },

    do_up: function() {
      SimpleTodo.DisplayManager.selectPrevious();
    },

    do_move_down: function() {
      SimpleTodo.DisplayManager.moveSelectedDown();
    },

    do_move_up: function() {
      SimpleTodo.DisplayManager.moveSelectedUp();
    },

    do_space: function() {
      SimpleTodo.DisplayManager.completeSelected();
    },

    do_backtick: function() {
      SimpleTodo.DisplayManager.hideCompleted();
    },

    bindings: {
      13:  "do_enter",
      106: "do_down",
      107: "do_up",
      108: "do_move_down",
      104: "do_move_up",
      32:  "do_space",
      96:  "do_backtick"
    },

    initialize: function() {
      var that = this;
      $(document).bind("keypress", function(e) {
        //alert(e.which);
        if (document.activeElement == document.body) {
          eval("SimpleTodo.KeyEvents."+that.bindings[e.which]+"();");
        }
      });
    }

  },

  DisplayManager: {
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
      SimpleTodo.LocalStore.removeAllCompleted();
    },

    completeSelected: function() {
      this.active.toggleClass("completed");
      this.active.data("item").completed = !this.active.data("item").completed;
      SimpleTodo.LocalStore.save();
    },

    selectPrevious: function() {
      var x = this.active.prev("li");
      if (x.size()>0) {
        this.setActive(x);
      }
    },

    selectNext: function() {
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
      this.active = el;
      this.active.addClass("active");
    },

    initialize: function() {
      var that = this;
      $.each(SimpleTodo.LocalStore.items, function(index, item) {
        that.addListItem(item);
      });

      this.setActive($("li:first"));

      $("form").live("submit", function(e) {
        var input = $(this).children("input").val();
        var item = new SimpleTodo.Item(input);
        $(this).parent().remove();
        SimpleTodo.LocalStore.add(item);
        that.addListItem(item);
        e.preventDefault();
      });
    }

  },

  LocalStore: {

    storageKey: "SimpleTodo.items",

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

  },

  initialize: function() {
    this.KeyEvents.initialize();
    this.LocalStore.initialize();
    this.DisplayManager.initialize();
  }

};

$(document).ready(function() {
  SimpleTodo.initialize();
});