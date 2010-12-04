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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * Implements single and multi selection handling.
 *
 * Example:
 * <pre class="javascript">
 * var rawData = [];
 * for (var i = 0; i < 2500; i++) {
 *  rawData[i] = "Item No " + i;
 * }
 *
 * var model = qx.data.marshal.Json.createModel(rawData);
 * var list = new qx.ui.list.List(model);
 *
 * // Pre-Select "Item No 20"
 * list.getSelection().push(model.getItem(20));
 *
 * // log change selection
 * list.getSelection().addListener("change", function(e) {
 *   this.debug("Selection: " + list.getSelection().getItem(0));
 * }, this);
 * </pre>
 */
qx.Mixin.define("qx.ui.list.core.MSelectionHandling",
{

  construct : function() {
    this._initSelectionManager();

    this.initSelection(new qx.data.Array());
  },

  properties :
  {
    /** Current selected items */
    selection :
    {
      check : "qx.data.Array",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },

    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : ["single", "multi", "additive", "one"],
      init : "single",
      apply : "_applySelectionMode"
    },

    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states).
     *
     * Only possible for the selection modes <code>multi</code> and <code>additive</code>
     */
    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    },

    /**
     * Enable quick selection mode, where no click is needed to change the selection.
     *
     * Only possible for the modes <code>single</code> and <code>one</code>.
     */
    quickSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyQuickSelection"
    }
  },

  members :
  {
    /** {qx.ui.virtual.selection.Row} selection manager */
    _manager : null,

    /** {Boolean} flag to ignore the selection change from {@link #selection} */
    __ignoreChangeSelection : false,

    /** {Boolean} flag to ignore the selection change from {@link #_manager} */
    __ignoreManagerChangeSelection : false,

    /**
     * Initialize the selection manager with his delegate.
     */
    _initSelectionManager : function()
    {
      var self = this;
      var selectionDelegate = {
        isItemSelectable : function(item) {
          return self._isSelectable(item);
        },

        styleSelectable : function(item, type, wasAdded) {
          if (type != "selected") {
            return;
          }

          var widget = self._layer.getRenderedCellWidget(item, 0);
          if(widget == null) {
            return;
          }

          if (wasAdded) {
            self._widgetCellProvider.styleSelectabled(widget);
          } else {
            self._widgetCellProvider.styleUnselectabled(widget);
          }
        }
      }

      this._manager = new qx.ui.virtual.selection.Row(
        this.getPane(), selectionDelegate
      );
      this._manager.attachMouseEvents(this.getPane());
      this._manager.attachKeyEvents(this);
      this._manager.addListener("changeSelection", this._onManagerChangeSelection, this);
    },

    /**
     * Returns if the passed row can be selected or not.
     *
     * @param row {Integer} row to select.
     * @return {Boolean} <code>true</code> when the row can be selected,
     *    <code>false</code> otherwise.
     */
    _isSelectable : function(row)
    {
      var widget = this._layer.getRenderedCellWidget(row, 0);

      if (widget != null && !this.__ignoreChangeSelection) {
        return widget.isEnabled();
      } else {
        return true;
      }
    },

    // apply method
    _applySelection : function(value, old)
    {
      value.addListener("change", this._onChangeSelection, this);

      if (old != null) {
        old.removeListener("change", this._onChangeSelection, this);
      }

      this._onChangeSelection();
    },

    // apply method
    _applySelectionMode : function(value, old) {
      this._manager.setMode(value);
    },

    // apply method
    _applyDragSelection : function(value, old) {
      this._manager.setDrag(value);
    },

    // apply method
    _applyQuickSelection : function(value, old) {
      this._manager.setQuick(value);
    },

    /**
     * Event handler for the internal selection change {@link #selection}.
     *
     * @param e {qx.event.type.Data} the change event.
     */
    _onChangeSelection : function(e)
    {
      if (this.__ignoreManagerChangeSelection == true) {
        return;
      }

      this.__ignoreChangeSelection = true;
      var selection = this.getSelection();

      var newSelection = [];
      for (var i = 0; i < selection.getLength(); i++)
      {
        var item = selection.getItem(i);
        var index = this.getModel().indexOf(item);
        newSelection.push(index);
      }

      try {
        this._manager.replaceSelection(newSelection);
      }
      catch(e)
      {
        this._manager.selectItem(newSelection[newSelection.length - 1]);
        this.__synchronizeSelection();
      }

      this.__ignoreChangeSelection = false;
    },

    /**
     * Event handler for the selection change from the {@link #_manager}.
     *
     * @param e {qx.event.type.Data} the change event.
     */
    _onManagerChangeSelection : function(e) {
      if (this.__ignoreChangeSelection == true) {
        return;
      }

      var selection = this.getSelection();
      var currentSelection = e.getData();

      this.__ignoreManagerChangeSelection = true;

      // replace selection and fire event
      this.__synchronizeSelection();
      if (selection.getLength() > 0) {
        var lastIndex = selection.getLength() - 1;
        selection.splice(lastIndex, 1, this._getDataFromRow(currentSelection[lastIndex]));
      } else {
        selection.removeAll();
      }

      this.__ignoreManagerChangeSelection = false;
    },

    /**
     * Synchronized the selection form the manager with the local one.
     */
    __synchronizeSelection : function()
    {
      var localSelection = this.getSelection();
      var nativArray = localSelection.toArray();
      var managerSelection = this._manager.getSelection();

      qx.lang.Array.removeAll(nativArray);
      for(var i = 0; i < managerSelection.length; i++) {
        nativArray.push(this._getDataFromRow(managerSelection[i]));
      }
      localSelection.length = nativArray.length;
    }
  },

  destruct : function()
  {
    this._manager.dispose();
    this._manager = null;
  }
});
