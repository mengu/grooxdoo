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

qx.Class.define("qx.test.ui.list.core.SingleSelection",
{
  extend : qx.test.ui.list.AbstractListTest,

  members :
  {
    testSelection : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(1));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");
      this.assertTrue(selection.equals(new qx.data.Array([this._model.getItem(1)])), "On List");

      // check selection from manager
      var item = this._list._manager.getSelectedItem();
      item = this._list._getDataFromRow(item);

      this.assertEquals(this._model.getItem(1), item);
    },

    testInvalidSelection : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(1));
      selection.push(this._model.getItem(2));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");
      this.assertTrue(selection.equals(new qx.data.Array([this._model.getItem(2)])), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();

      this.assertEquals(1, selection.length);
      this.assertEquals(2, selection[0]);
    },

    testSelectionByUserInteraction : function()
    {
      var selection = this._list.getSelection();

      this._list._manager.selectItem(2);
      this.flush();

      this.assertEquals(1, selection.getLength());
      this.assertEquals(this._model.getItem(2), selection.getItem(0));
      this.assertEquals(2, this._list._manager.getSelectedItem());
    },

    testSelectionEventByUserInteraction : function()
    {
      var selection = this._list.getSelection();

      var self = this;
      this.assertEventFired(selection, "change",
        function()
        {
          self._list._manager.selectItem(2);
          self.flush();
        },
        function(e)
        {
          self.assertEquals(1, selection.getLength());
          self.assertEquals(self._model.getItem(2), selection.getItem(0));
          self.assertEquals(2, self._list._manager.getSelectedItem());
        }
      );
    }
  }
});
