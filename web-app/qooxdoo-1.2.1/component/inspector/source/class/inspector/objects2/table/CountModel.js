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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.objects2.table.CountModel",
{
  extend : inspector.objects2.table.AbstractModel,

  construct : function(model)
  {
    this.base(arguments, model, ["Count", "Classname"]);
  },

  members :
  {
    _getData: function() {
      var objects = this._model.getObjects();

      var tempData = {};
      for (var i = 0; i < objects.length; i++)
      {
        var classname = objects[i].classname;

        if (tempData[classname] === undefined) {
          tempData[classname] = 0;
        }
        tempData[classname]++;
      }

      var data = [];
      for (var classname in tempData) {
        data.push([tempData[classname], classname]);
      }

      data.sort(function(a, b) {
        return a[0] < b[0];
      });

      return data;
    }
  }
});
