/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Menu showing all loaded gists and its controlls.
 */
qx.Class.define("playground.view.gist.GistMenu",
{
  extend : qx.ui.menu.Menu,


  construct : function()
  {
    this.base(arguments);

    // storage for the current items in the menu (usually the gist menu items)
    this.__items = [];

    // user name field
    this.__userNameChange = new playground.view.gist.UserNameMenuItem();
    this.add(this.__userNameChange);
    this.__userNameChange.addListener("reload", function(e) {
      this.__loading();
      this.fireDataEvent("reload", e.getData());
    }, this);

    // filter
    this.__filterCheckBox = new playground.view.gist.CheckBox(
      this.tr("Activate filter for [qx]")
    );
    var initFilterValue = qx.bom.Cookie.get("playgroundFilter") !== "false";
    this.__filterCheckBox.setValue(initFilterValue);
    this.__filterCheckBox.addListener("changeValue", this.__onFilterChange, this);
    this.add(this.__filterCheckBox);

    var newGistButton = new qx.ui.menu.Button(
      this.tr("New gist"), "icon/16/actions/list-add.png"
    );
    newGistButton.addListener("execute", function() {
      this.fireEvent("newGist");
    }, this);
    this.add(newGistButton);

    // separator
    this.add(new qx.ui.menu.Separator());

    // item for signaling an empty list
    this.__emptyItem = new playground.view.gist.TextMenuItem(this.tr("<em>No gist to show.</em>"));
    this.add(this.__emptyItem);
    this.__items.push(this.__emptyItem);

    // item for signaling the loading process
    this.__loadingItem = new playground.view.gist.TextMenuItem(
      this.tr("Loading..."), "playground/images/loading.gif"
    );

    // check for initial loading
    if (qx.bom.Cookie.get("playgroundUser")) {
      this.__loading();
    }
  },


  events : {
    /**
     * Fired if a new gist has been selected
     */
    "changeGist" : "qx.event.type.Data",

    /**
     * Fired if the gists need to relaod.
     */
    "reload" : "qx.event.type.Data",

    /**
     * Fired when a new gists should be made.
     */
     "newGist" : "qx.event.type.Event",


     /**
      * Fired when a gist should be edited.
      */
     "editGist" : "qx.event.type.Data"
  },


  members :
  {
    __items : null,
    __loadingItem : null,
    __emptyItem : null,
    __userNameChange : null,
    __filterCheckBox : null,


    /**
     * Helper method for setting up the list to the loading view.
     */
    __loading : function()
    {
      // empty the cache
      for (var i = 0; i < this.__items.length; i++) {
        if (this.indexOf(this.__items[i]) != -1) {
          this.remove(this.__items[i]);
        }
        if (this.__items[i] != this.__emptyItem) {
          this.__items[i].destroy();
        }
      };
      this.__items = [];

      this.add(this.__loadingItem);
    },

    // overridden
    _applySelectedButton : function(value, old) {
      this.__userNameChange.focusTextField(value == this.__userNameChange);
      this.base(arguments, value, old);
    },


    /**
     * Responsible for adding new gists to the menu.
     * @param names {Array} The labels of the menu items for the gists.
     * @param texts {Array} An array containing the content of the gists.
     */
    updateGists : function(names, texts)
    {
      // remove the loading item if its in the menu
      if (this.indexOf(this.__loadingItem) != -1) {
        this.remove(this.__loadingItem);
      }

      // empty list handling
      if (names.length == 0) {
        this.add(this.__emptyItem);
        this.__items.push(this.__emptyItem);
        return;
      }

      // add the new menu items
      for (var i = 0; i < names.length; i++) {
        // skip empty gists
        if (!texts[i]) {continue;}

        var menuItem = new playground.view.gist.MenuButton(
          names[i], "icon/22/actions/edit-paste.png"
        );
        this.add(menuItem);
        this.__items.push(menuItem);
        menuItem.addListener("execute",
          qx.lang.Function.bind(function(code, name) {
            this.fireDataEvent("changeGist", {code: code, name: name});
          }, this, texts[i], names[i])
        );
        menuItem.addListener("editGist", function(e) {
          this.fireDataEvent("editGist", e.getData());
        }, this);
      };
      // apply the filter on load
      this.__onFilterChange();
    },


    /**
     * Markes the username textfield as invalid.
     * @param invalid {Boolean} true, if the request failed
     * @param message {String} The error message.
     */
    invalidUser : function(invalid, message) {
      this.__userNameChange.markInvalid(invalid, message);
    },


    /**
     * Handler for the filter checkbox. It checks all added menu items and
     * excludes the items not containing a '[qx]' in its label.
     */
    __onFilterChange : function() {
      // if the gists are currently loading, do nothing
      if (this.indexOf(this.__loadingItem) != -1) {
        return;
      }
      var on = this.__filterCheckBox.getValue();
      // write the status to the cookie
      qx.bom.Cookie.set("playgroundFilter", on, 100);

      var oneShown = false;
      for (var i = 0; i < this.__items.length; i++) {
        var item = this.__items[i];
        // ignore the status items
        if (item == this.__emptyItem) {continue;}
        if (on && item.getLabel().indexOf("[qx]") == -1) {
          this.remove(item);
        } else {
          oneShown = true;
          this.add(item);
        }
      };

      // handle empty lists after the filtering
      if (!oneShown) {
        this.add(this.__emptyItem);
      } else if (this.indexOf(this.__emptyItem) != -1) {
        this.remove(this.__emptyItem);
      }
    },


    //overridden
    _onMouseOver : function(e)
    {
      this.base(arguments, e);

      var target = e.getTarget();
      if (target.isEnabled()) {
        this.setSelectedButton(target);
      }
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    for (var i = 0; i < this.__items.length; i++) {
      this.__items[i].dispose();
    };
    this.__items = null;
    this._disposeObjects("__userNameChange", "__filterCheckBox", "__emptyItem",
      "__loadingItem");
  }
});
